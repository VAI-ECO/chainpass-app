/**
 * SPEC-CP-02 registry — register · fetch · retire · open · display · record · search.
 * The platform sends a contract number and V.A.I. numbers and receives an agreement number.
 */
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export async function sha256HexBytes(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256HexText(text: string): Promise<string> {
  return sha256HexBytes(new TextEncoder().encode(text));
}

export function mintAgreementId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `AG-${hex.slice(0, 26).padEnd(26, "0")}`;
}

async function appendLedger(
  supabase: SupabaseClient,
  table_name: string,
  row_key: string,
  row_hash: string
): Promise<void> {
  const { error } = await supabase.from("record_ledger").insert({
    table_name,
    row_key,
    row_hash,
    entry_hash: "pending",
  });
  if (error) throw new Error(error.message);
}

export async function registerContract(
  supabase: SupabaseClient,
  args: {
    contract_id: string;
    platform_id: string;
    family: string;
    version: string;
    body: string;
    language: string;
    parties: 1 | 2;
    registered_by: string;
    supersedes?: string | null;
  }
): Promise<{ contract_id: string; content_hash: string; status: string }> {
  const raw = new TextEncoder().encode(args.body);
  const content_hash = await sha256HexBytes(raw);
  const { error } = await supabase.from("contracts").insert({
    contract_id: args.contract_id,
    platform_id: args.platform_id,
    family: args.family,
    version: args.version,
    body: args.body,
    content_hash,
    language: args.language,
    parties: args.parties,
    registered_by: args.registered_by,
    status: "draft",
    supersedes: args.supersedes ?? null,
  });
  if (error) throw new Error(error.message);
  await appendLedger(supabase, "contracts", args.contract_id, content_hash);
  return { contract_id: args.contract_id, content_hash, status: "draft" };
}

export async function fetchContract(
  supabase: SupabaseClient,
  contract_id: string,
  platform_id: string
) {
  const { data, error } = await supabase
    .from("contracts")
    .select(
      "contract_id, platform_id, family, version, content_hash, language, parties, status, retired_at, registered_at, registered_at_offset"
    )
    .eq("contract_id", contract_id)
    .eq("platform_id", platform_id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("contract_not_found");
  return data;
}

export async function retireContract(
  supabase: SupabaseClient,
  contract_id: string,
  platform_id: string
) {
  const row = await fetchContract(supabase, contract_id, platform_id);
  if (row.status !== "live") {
    throw new Error("only_live_may_retire");
  }
  const { error } = await supabase
    .from("contracts")
    .update({
      status: "retired",
      retired_at: new Date().toISOString(),
      retired_at_offset: "00:00:00",
    })
    .eq("contract_id", contract_id)
    .eq("platform_id", platform_id);
  if (error) throw new Error(error.message);
  return { contract_id, status: "retired" };
}

export async function goLive(
  supabase: SupabaseClient,
  contract_id: string,
  platform_id: string
) {
  const row = await fetchContract(supabase, contract_id, platform_id);
  if (row.status !== "draft") throw new Error("only_draft_may_go_live");
  const { error } = await supabase
    .from("contracts")
    .update({ status: "live" })
    .eq("contract_id", contract_id);
  if (error) throw new Error(error.message);
  return { contract_id, status: "live" };
}

export async function openAgreement(
  supabase: SupabaseClient,
  args: {
    contract_id: string;
    platform_id: string;
    vais: string[];
  }
): Promise<{ agreement_id: string }> {
  const contract = await fetchContract(
    supabase,
    args.contract_id,
    args.platform_id
  );
  if (contract.status === "draft") {
    throw new Error("draft_never_served");
  }
  if (contract.status === "retired") {
    throw new Error("retired_refused_at_open");
  }
  if (contract.status !== "live") {
    throw new Error("contract_not_live");
  }
  if (args.vais.length !== contract.parties) {
    throw new Error("parties_count_mismatch");
  }
  const agreement_id = mintAgreementId();
  const { error } = await supabase.from("agreements").insert({
    agreement_id,
    contract_id: contract.contract_id,
    content_hash: contract.content_hash,
    platform_id: args.platform_id,
  });
  if (error) throw new Error(error.message);
  await appendLedger(
    supabase,
    "agreements",
    agreement_id,
    await sha256HexText(agreement_id + contract.content_hash)
  );
  return { agreement_id };
}

export async function displayContract(
  supabase: SupabaseClient,
  args: {
    agreement_id: string;
    vai: string;
    delivery: string;
  }
) {
  const { data: agr, error } = await supabase
    .from("agreements")
    .select("agreement_id, contract_id, content_hash, platform_id")
    .eq("agreement_id", args.agreement_id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!agr) throw new Error("agreement_not_found");
  const { data: contract, error: cErr } = await supabase
    .from("contracts")
    .select("body, content_hash, status")
    .eq("contract_id", agr.contract_id)
    .maybeSingle();
  if (cErr) throw new Error(cErr.message);
  if (!contract) throw new Error("contract_not_found");
  const { error: sErr } = await supabase.from("serve_events").insert({
    agreement_id: agr.agreement_id,
    contract_id: agr.contract_id,
    content_hash: agr.content_hash,
    vai: args.vai,
    delivery: args.delivery,
  });
  if (sErr) throw new Error(sErr.message);
  return {
    agreement_id: agr.agreement_id,
    content_hash: agr.content_hash,
    body: contract.body,
  };
}

export async function recordAnswer(
  supabase: SupabaseClient,
  args: {
    agreement_id: string;
    vai: string;
    party_order: 1 | 2;
    answer: "yes" | "no";
    match_ref?: string | null;
  }
) {
  const { data: agr, error } = await supabase
    .from("agreements")
    .select("agreement_id, content_hash, outcome")
    .eq("agreement_id", args.agreement_id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!agr) throw new Error("agreement_not_found");
  const { error: pErr } = await supabase.from("agreement_parties").insert({
    agreement_id: args.agreement_id,
    vai: args.vai,
    party_order: args.party_order,
    answer: args.answer,
    match_ref: args.match_ref ?? null,
  });
  if (pErr) throw new Error(pErr.message);
  await appendLedger(
    supabase,
    "agreement_parties",
    `${args.agreement_id}:${args.vai}`,
    await sha256HexText(`${args.agreement_id}:${args.vai}:${args.answer}`)
  );
  return {
    agreement_id: args.agreement_id,
    vai: args.vai,
    answer: args.answer,
  };
}

export async function searchAgreements(
  supabase: SupabaseClient,
  args: { agreement_id?: string; vai?: string; platform_id: string }
) {
  if (args.agreement_id) {
    const { data, error } = await supabase
      .from("agreements")
      .select(
        "agreement_id, contract_id, content_hash, outcome, created_at, created_at_offset, closed_at, closed_at_offset"
      )
      .eq("agreement_id", args.agreement_id)
      .eq("platform_id", args.platform_id);
    if (error) throw new Error(error.message);
    return data ?? [];
  }
  if (args.vai) {
    const { data: parties, error } = await supabase
      .from("agreement_parties")
      .select("agreement_id")
      .eq("vai", args.vai);
    if (error) throw new Error(error.message);
    const ids = [...new Set((parties ?? []).map((p) => p.agreement_id))];
    if (ids.length === 0) return [];
    const { data, error: aErr } = await supabase
      .from("agreements")
      .select(
        "agreement_id, contract_id, content_hash, outcome, created_at, created_at_offset, closed_at, closed_at_offset"
      )
      .in("agreement_id", ids)
      .eq("platform_id", args.platform_id);
    if (aErr) throw new Error(aErr.message);
    return data ?? [];
  }
  throw new Error("agreement_id or vai required");
}
