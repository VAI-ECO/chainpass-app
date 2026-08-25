/** Device-side only. Never a credential column. Never sent to a platform. */

export const REMEMBER_VAI_KEY = "chainpass_remember_vai";
export const ENROL_VAI_SHOWN_KEY = "enrolment_vai_shown";

export function getRememberedVai(): string | null {
  if (typeof localStorage === "undefined") return null;
  const v = localStorage.getItem(REMEMBER_VAI_KEY);
  return v && v.trim() ? v.trim() : null;
}

export function setRememberOnDevice(vai: string, remember: boolean): void {
  if (typeof localStorage === "undefined") return;
  if (remember && vai.trim()) {
    localStorage.setItem(REMEMBER_VAI_KEY, vai.trim());
  } else {
    localStorage.removeItem(REMEMBER_VAI_KEY);
  }
}
