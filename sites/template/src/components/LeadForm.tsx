import { useId, useState, type FormEvent } from "react";

interface LeadFormProps {
  /** Where the sign-up came from, sent with the form (e.g. "home", "popup"). */
  source: string;
  button: string;
  /** Show a message box instead of only an email field. */
  withMessage?: boolean;
  onDone?: () => void;
  tone?: "light" | "dark";
}

type Status = "idle" | "sending" | "done" | "error";

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT ?? "";

export function LeadForm({ source, button, withMessage = false, onDone, tone = "light" }: LeadFormProps) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ENDPOINT) {
      setStatus("error");
      setError("This form is not connected yet. The site owner needs to add a form address (see docs/sites-launch.md).");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: new FormData(event.currentTarget), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("done");
      onDone?.();
    } catch {
      setStatus("error");
      setError("That did not go through. Check your connection and try again.");
    }
  }

  const field =
    tone === "dark"
      ? "border-light/60 bg-dark text-light placeholder:text-light/60"
      : "border-dark/40 bg-white text-dark placeholder:text-dark/60";

  if (status === "done") {
    return (
      <p role="status" className="text-lg font-semibold">
        Thank you. Check your inbox in the next few minutes.
      </p>
    );
  }

  return (
    <form onSubmit={submit} action={ENDPOINT || undefined} method="post" className="grid gap-3">
      <input type="hidden" name="source" value={source} />
      {withMessage && (
        <>
          <label htmlFor={`${id}-name`} className="text-sm font-semibold">Your name</label>
          <input id={`${id}-name`} name="name" autoComplete="name" className={`min-h-12 rounded-xl border px-4 text-base ${field}`} />
        </>
      )}
      <label htmlFor={`${id}-email`} className="text-sm font-semibold">Email address</label>
      <div className={withMessage ? "grid gap-3" : "grid gap-3 sm:grid-cols-[1fr_auto]"}>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          className={`min-h-12 rounded-xl border px-4 text-base ${field}`}
        />
        {!withMessage && <SubmitButton label={button} busy={status === "sending"} />}
      </div>
      {withMessage && (
        <>
          <label htmlFor={`${id}-message`} className="text-sm font-semibold">Message</label>
          <textarea id={`${id}-message`} name="message" required rows={5} className={`rounded-xl border px-4 py-3 text-base ${field}`} />
          <SubmitButton label={button} busy={status === "sending"} />
        </>
      )}
      <p aria-live="polite" className="min-h-6 text-sm font-semibold">
        {status === "error" ? error : ""}
      </p>
    </form>
  );
}

function SubmitButton({ label, busy }: { label: string; busy: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="press min-h-12 rounded-xl bg-primary px-6 font-display text-base font-bold text-dark hover:brightness-105 disabled:opacity-70"
    >
      {busy ? "Sending…" : label}
    </button>
  );
}
