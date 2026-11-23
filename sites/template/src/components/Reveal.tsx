import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li";
}

/**
 * Fades its children in when they scroll into view. The server HTML is
 * always visible; only blocks that start below the fold wait, and CSS skips
 * the effect entirely for visitors who prefer reduced motion.
 */
export function Reveal({ children, className, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"shown" | "waiting">("shown");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setState("waiting");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={(node: HTMLElement | null) => { ref.current = node; }} data-reveal={state} className={className}>
      {children}
    </Tag>
  );
}
