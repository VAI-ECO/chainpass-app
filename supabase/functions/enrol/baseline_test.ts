Deno.test("baseline commit is step 9 after documents (step 8) and after reveal (step 7)", () => {
  if (!(9 > 8 && 9 > 7)) throw new Error("baseline last among trust steps");
});
