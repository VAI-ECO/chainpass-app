/**
 * View-and-sign binding: the stamped id is the id the viewer rendered.
 * deno test supabase/functions/_shared/agreement-version_test.ts
 */
import {
  bindShownToCurrent,
  selectCurrentVersion,
  type CurrentVersion,
} from "./agreement-version.ts";

function row(id: string, extra: Partial<CurrentVersion> = {}): CurrentVersion {
  return {
    id,
    platform_id: "plat-1",
    subtype: "terms",
    body: "THE DOCUMENT BODY",
    version: "v1",
    effective_from: "2026-01-01T00:00:00.000Z",
    notice: null,
    ...extra,
  };
}

Deno.test("viewer id and stamped id are the same version", () => {
  const viewed = selectCurrentVersion([row("ver-saw-this")]);
  if (viewed.status !== "ok") throw new Error("expected unique current version");

  const viewer_version_id = viewed.version.id;
  const resolved_again = selectCurrentVersion([row("ver-saw-this")]);
  if (resolved_again.status !== "ok") throw new Error("sign resolve failed");

  const bind = bindShownToCurrent(viewer_version_id, resolved_again.version.id);
  if (!bind.ok) throw new Error("expected stamp, got " + bind.error);

  const stamped_version_id = bind.agreement_version_id;

  console.log("VIEWER_VERSION_ID=", viewer_version_id);
  console.log("STAMPED_VERSION_ID=", stamped_version_id);

  if (viewer_version_id !== stamped_version_id) {
    throw new Error(
      `ids diverged viewer=${viewer_version_id} stamped=${stamped_version_id}`
    );
  }
});

Deno.test("shown id that is not current is stale_document", () => {
  const bind = bindShownToCurrent("ver-old", "ver-new");
  if (bind.ok || bind.error !== "stale_document") {
    throw new Error("expected stale_document");
  }
});

Deno.test("two effective rows are not picked", () => {
  const resolved = selectCurrentVersion([
    row("ver-a"),
    row("ver-b", { version: "v2" }),
  ]);
  if (resolved.status !== "multiple") {
    throw new Error("expected multiple_effective_versions");
  }
});
