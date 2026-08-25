import { drainQueuedSessionAction } from "../_shared/drain-action.ts";

Deno.test("drainQueuedSessionAction: always fails to live-camera path", () => {
  const action = drainQueuedSessionAction("ABC1234");
  if (action !== "failed_needs_live_camera") {
    throw new Error(`unexpected action: ${action}`);
  }
  const actionNoVai = drainQueuedSessionAction(null);
  if (actionNoVai !== "failed_needs_live_camera") {
    throw new Error(`unexpected action for null vai: ${actionNoVai}`);
  }
});

Deno.test("drain-queue source does not select complycube_client_id", async () => {
  const src = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  if (/complycube_client_id/.test(src)) {
    throw new Error("patent gate: drain-queue must not read complycube_client_id");
  }
});
