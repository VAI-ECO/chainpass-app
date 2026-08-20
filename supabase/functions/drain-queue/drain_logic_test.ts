import { drainQueuedSessionAction } from "../_shared/drain-action.ts";

Deno.test("drainQueuedSessionAction: never needs client id; always fails to live-camera path", () => {
  const credential = { complycube_client_id: null as string | null };
  if (credential.complycube_client_id !== null) {
    throw new Error("fixture must keep client id null");
  }
  const action = drainQueuedSessionAction("ABC1234");
  if (action !== "failed_needs_live_camera") {
    throw new Error(`unexpected action: ${action}`);
  }
  const actionNoVai = drainQueuedSessionAction(null);
  if (actionNoVai !== "failed_needs_live_camera") {
    throw new Error(`unexpected action for null vai: ${actionNoVai}`);
  }
  console.log("DRAIN_TEST_OK nulled_client_id=true drained_to=failed_needs_live_camera");
});
