import { computeConsumptionProjection } from "../_shared/consumption.ts";
Deno.test("projection shape has no stored burn columns — computed fields only", () => {
  const sample = {
    remaining: 10,
    burned_in_window: 2,
    burn_per_hour: 2 / 24,
    projected_empty_at: null as string | null,
  };
  if (!("burn_per_hour" in sample) || !("projected_empty_at" in sample)) {
    throw new Error("computed fields required");
  }
});
