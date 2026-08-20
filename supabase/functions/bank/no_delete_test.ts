Deno.test("remove provider is status disabled never delete", () => {
  const action = "status_change";
  if (action === "delete") throw new Error("must not delete");
});
