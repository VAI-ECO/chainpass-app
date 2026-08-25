import { generateSessionKey, SESSION_KEY_LENGTH } from "../_shared/session-key.ts";

Deno.test("session key is 32 alphanumeric characters", () => {
  const key = generateSessionKey();
  if (key.length !== SESSION_KEY_LENGTH || SESSION_KEY_LENGTH !== 32) {
    throw new Error(`length ${key.length}, expected 32`);
  }
  if (!/^[A-Za-z0-9]{32}$/.test(key)) {
    throw new Error("session key is not 32 alphanumeric");
  }
});
