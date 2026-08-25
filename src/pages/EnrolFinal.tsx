import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnrolNote,
  EnrolPrimaryButton,
  EnrolShell,
  EnrolTitle,
} from "@/components/enrol/EnrolShell";
import { ENROL_VAI_SHOWN_KEY, setRememberOnDevice } from "@/lib/remember-vai";

/** Step 11a — V.A.I. shown once more. Remember on this device is device-side only. */
export default function EnrolFinal() {
  const navigate = useNavigate();
  const vai =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(ENROL_VAI_SHOWN_KEY)
      : null;
  const [remember, setRemember] = useState(false);

  function continueOn() {
    if (vai) setRememberOnDevice(vai, remember);
    else setRememberOnDevice("", false);
    navigate("/enrol/handoff");
  }

  return (
    <EnrolShell stepLabel="Step 11a">
      <EnrolTitle>This is the V.A.I.</EnrolTitle>
      {vai ? (
        <p className="my-3.5 text-center text-[34px] font-bold tracking-[0.14em]">{vai}</p>
      ) : (
        <p className="my-2 leading-[1.45]">The number was shown on the previous screens.</p>
      )}
      <label className="my-3 flex items-start gap-2">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <span>Remember it on this device?</span>
      </label>
      <p className="my-2 text-[14px] leading-[1.45]">
        Default is not remembered. This stays on the device. It never signs anyone in.
        The face still runs.
      </p>
      <EnrolPrimaryButton onClick={continueOn}>Continue</EnrolPrimaryButton>
      <EnrolNote>CANON-CP-02 §1.1. Not a field a platform can read.</EnrolNote>
    </EnrolShell>
  );
}
