/** One retrieval template. Brand is a value on the platform row. */

export function retrievalHeading(brand: string): string {
  const name = brand.trim() || "ChainPass";
  return `${name} recovery`;
}
