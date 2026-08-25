/**
 * CANON-CP-02 §1 step 12 — server-to-server handoff body.
 * The session key rides here. It never rides in the browser.
 */
export type HandoffSession = {
  vai: string;
  session_key: string | null;
  username: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  terms_accepted_at: string | null;
};

export function serverToServerPayload(session: HandoffSession): {
  vai: string;
  session_key: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  terms_affirmed: boolean;
} {
  const key = typeof session.session_key === "string" ? session.session_key.trim() : "";
  if (!key) {
    throw new Error("session_key_required_for_handoff");
  }
  return {
    vai: session.vai.trim(),
    session_key: key,
    username: session.username,
    email: session.contact_email,
    phone: session.contact_phone,
    terms_affirmed: !!session.terms_accepted_at,
  };
}
