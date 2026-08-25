import { generateSessionKey, SESSION_KEY_LENGTH } from "../_shared/session-key.ts";

Deno.test("session key is 30 alphanumeric characters", () => {
  const key = generateSessionKey();
  if (key.length !== SESSION_KEY_LENGTH || SESSION_KEY_LENGTH !== 30) {
    throw new Error(`length ${key.length}, expected 30`);
  }
  if (!/^[A-Za-z0-9]{30}$/.test(key)) {
    throw new Error("session key is not 30 alphanumeric");
  }
});
