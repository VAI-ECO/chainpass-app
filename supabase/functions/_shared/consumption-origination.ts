/**
 * §14.5 — credential holder at a NEW platform costs that platform consumption
 * and earns it nothing. Origination commission is never written on verify/gate.
 */
export function newPlatformEarnsNothingOnVerify(args: {
  verifying_platform_id: string;
  originating_platform_id: string | null;
  commission_rows_written: number;
}): boolean {
  // Even if verifying platform !== originator, verify must not create commission.
  return args.commission_rows_written === 0;
}
