import { useEffect, useRef } from "react";
import { brand } from "virtual:brand";
import { LeadForm } from "./LeadForm";

const STORAGE_KEY = "lead-popup-seen";
const SCROLL_SHARE = 0.5;
const DELAY_MS = 30_000;

function seen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function remember(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private mode or blocked storage: the pop-up may show again, that's all.
  }
}

/**
 * Lead-magnet pop-up. Opens once per visitor, after they scroll half the page
 * or stay 30 seconds. Native <dialog>: focus moves in, Escape closes it,
 * focus returns to where it was.
 */
export function LeadPopup() {
  const ref = useRef<HTMLDialogElement>(null);
  const magnet = brand.site?.lead_magnet;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !magnet || seen()) return;
    let opened = false;
    const open = () => {
      if (opened || seen()) return;
      opened = true;
      remember();
      dialog.showModal();
      cleanup();
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= SCROLL_SHARE) open();
    };
    const timer = window.setTimeout(open, DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }
    return cleanup;
  }, [magnet]);

  if (!magnet) return null;
  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="popup-title"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      className="m-auto w-[min(92vw,30rem)] rounded-3xl bg-light p-0 text-dark shadow-2xl backdrop:bg-dark/70"
    >
      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-2xl leading-none hover:bg-dark/10"
        >
          <span aria-hidden="true">×</span>
        </button>
        <p className="font-mono text-xs uppercase tracking-widest text-tertiary">Free</p>
        <h2 id="popup-title" className="mt-2 pr-10 text-2xl font-bold sm:text-3xl">{magnet.charAt(0).toUpperCase() + magnet.slice(1)}</h2>
        <p className="mt-3 text-dark/80">One email with the download. Unsubscribe in one click.</p>
        <div className="mt-5">
          <LeadForm source="popup" button="Send it to me" />
        </div>
      </div>
    </dialog>
  );
}
