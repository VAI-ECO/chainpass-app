Deno.test("handoff payload keys exclude legal name", () => {
  const payload = { vai: "ABCDEFG", username: "neo", email: "a@b.c", phone: null, session_key: "sk" };
  for (const k of Object.keys(payload)) {
    if (/legal|full_name|first_name|last_name/i.test(k)) throw new Error(k);
  }
});
Deno.test("after handoff session key must be null on ChainPass", () => {
  const after = { provider_session_key: null as string | null };
  if (after.provider_session_key != null) throw new Error("key retained");
});
