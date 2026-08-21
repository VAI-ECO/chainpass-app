/**
 * Bank deactivate is status update — never .delete() on service_registry.
 * deno test --allow-read supabase/functions/bank/no_delete_test.ts
 */
Deno.test("bank PATCH path updates status; source has no service_registry delete", async () => {
  const text = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  if (!/Remove = status change, never delete/.test(text) && !/\.update\(\s*\{\s*status/.test(text)) {
    throw new Error("expected status update path");
  }
  // Fail if a delete against service_registry is introduced
  if (/\.from\(\s*["']service_registry["']\s*\)\s*\.delete\(/.test(text)) {
    throw new Error("service_registry must not be deleted");
  }
  if (/req\.method === ["']DELETE["']/.test(text)) {
    throw new Error("DELETE method must not exist on bank");
  }
});
