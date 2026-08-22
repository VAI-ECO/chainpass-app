import type { InputHTMLAttributes, ReactNode } from "react";

export type EnrolUiState = "default" | "loading" | "empty" | "error";

const ink = "#16295f";
const blue = "#3e6bf5";
const paper = "#f2f2f3";
const warn = "#8a5a00";
const warnBg = "#fff3d6";

export function EnrolShell({
  stepLabel,
  children,
}: {
  stepLabel?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen px-4 py-4"
      style={{ background: blue, color: ink, fontSize: 16 }}
    >
      <main className="mx-auto w-full max-w-[390px] md:max-w-[720px] lg:max-w-[960px]">
        <section
          className="rounded-[10px] p-6"
          style={{ background: paper }}
        >
          {stepLabel ? (
            <p
              className="mb-2 text-[13px] uppercase tracking-[0.06em]"
              style={{ color: "#555" }}
            >
              {stepLabel}
            </p>
          ) : null}
          {children}
        </section>
      </main>
    </div>
  );
}

export function EnrolTitle({ children }: { children: ReactNode }) {
  return <h1 className="my-2 text-[22px] font-semibold leading-snug">{children}</h1>;
}

export function EnrolNote({ children }: { children: ReactNode }) {
  return (
    <p className="my-2 text-[13px] leading-[1.4]" style={{ color: "#555" }}>
      {children}
    </p>
  );
}

export function EnrolWarn({ children }: { children: ReactNode }) {
  return (
    <p
      className="my-2 rounded-lg p-2.5 text-[13px]"
      style={{ color: warn, background: warnBg }}
    >
      {children}
    </p>
  );
}

export function EnrolRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex justify-between gap-3 border-b border-[#ddd] py-2"
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function EnrolPrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="my-2.5 block w-full rounded-lg px-3 py-[13px] text-base disabled:cursor-default disabled:opacity-45"
      style={{ background: ink, color: "#fff", border: "none" }}
    >
      {children}
    </button>
  );
}

export function EnrolSecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="my-2.5 block w-full rounded-lg px-3 py-[13px] text-base disabled:cursor-default disabled:opacity-45"
      style={{ background: "transparent", color: ink, border: `1.5px solid ${ink}` }}
    >
      {children}
    </button>
  );
}

export function EnrolField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="my-2 block w-full rounded-lg border-[1.5px] bg-white p-3 text-base"
      style={{ borderColor: ink, color: ink }}
    />
  );
}

export function EnrolSkeleton() {
  return (
    <div className="space-y-2.5">
      <div className="h-3.5 w-[62%] animate-pulse rounded-md bg-[#ddd]" />
      <div className="h-3.5 w-full animate-pulse rounded-md bg-[#ddd]" />
      <div className="h-3.5 w-[88%] animate-pulse rounded-md bg-[#ddd]" />
      <div className="h-3.5 w-[40%] animate-pulse rounded-md bg-[#ddd]" />
    </div>
  );
}

export function EnrolAlert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="my-2 leading-[1.45]">
      {children}
    </p>
  );
}
