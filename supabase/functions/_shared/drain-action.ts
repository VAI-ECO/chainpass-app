export type DrainAction = "failed_needs_live_camera";

/**
 * Queued silent provider reopen is gone. Item cannot complete without her at a camera.
 */
export function drainQueuedSessionAction(_vai: string | null): DrainAction {
  return "failed_needs_live_camera";
}
