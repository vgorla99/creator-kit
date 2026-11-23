/** Decorative shapes in the brand colours. Swap for a real photo when you have one (keep width/height set). */
export function HeroArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-auto w-full max-w-md" aria-hidden="true" focusable="false">
      <circle cx="200" cy="210" r="170" className="fill-secondary/25" />
      <g className="float-slow" style={{ transformOrigin: "150px 260px" }}>
        <path d="M95 190c0-18 110-18 110 0l-12 120c-2 20-84 20-86 0z" className="fill-primary" />
        <ellipse cx="150" cy="190" rx="55" ry="12" className="fill-dark" />
      </g>
      <g className="float-slower" style={{ transformOrigin: "275px 250px" }}>
        <path d="M230 150c-30 40-30 120 45 140 75-20 75-100 45-140z" className="fill-tertiary" />
        <rect x="248" y="128" width="54" height="26" rx="8" className="fill-tertiary" />
        <path d="M245 210c20 10 40 10 60 0" className="stroke-light" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      <rect x="60" y="318" width="290" height="14" rx="7" className="fill-dark" />
    </svg>
  );
}
