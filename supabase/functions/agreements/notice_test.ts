Deno.test("notice is platform words optional; ChainPass does not summarise", () => {
  const notice = "We changed clause 4 about fees.";
  if (!notice.includes("We changed")) throw new Error("platform words");
});
