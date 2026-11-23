// STARTER — copied by `npm run new -- <slug>` into src/reels/<slug>/.
// A small, working 12 s reel that shows the whole contract in one file:
// a timeline, three chapters on brand-colour stages, two transitions, and a
// call to action. Every colour, the wordmark and the handle come from
// brand/brand.yaml, so it already looks like your brand.
//
// Replace the words and the moves with this video's own idea; keep the kit.

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ease, prog, springIn, tween } from "../../kit/anim";
import { MusicBed } from "../../kit/audio";
import { GlobalFonts } from "../../kit/fonts";
import { defineReel } from "../../kit/reel";
import { BorderWipe, CircleFlood, Grain } from "../../kit/svg";
import { Chrome, MaskLine, Typewriter } from "../../kit/text";
import { BRAND, C, FONT, H, MARGIN, W, accentOn, inkOn } from "../../kit/theme";

// ── timeline (frames, 30 per second) ─────────────────────────
const T = {
  flood: { start: 70, cover: 92 }, // 01 -> 02: a circle grows out of the accent bar
  two: 92,
  wipe: { start: 196, cover: 216, end: 236 }, // 02 -> 03: a frame border closes and reopens
  three: 216,
  end: 360,
} as const;
const STAGES = [
  { start: 0, bg: C.dark },
  { start: T.two, bg: C.primary },
  { start: T.three, bg: C.tertiary },
] as const;
const stageAt = (f: number) => STAGES.reduce((i, s, idx) => (f >= s.start ? idx : i), 0);

const BAR = { y: 900, h: 14 }; // the accent bar under the hook
const BUTTON = { y: 1250, w: 620, h: 112 };

// ── chapters ─────────────────────────────────────────────────
const One: React.FC<{ f: number }> = ({ f }) => {
  const grow = prog(f, 40, 62, ease.outExpo);
  return (
    <>
      <MaskLine f={f} inAt={14} top={560} size={150} color={C.light}>
        YOUR
      </MaskLine>
      <MaskLine f={f} inAt={22} top={722} size={150} color={C.primary}>
        HOOK.
      </MaskLine>
      <div style={{ position: "absolute", left: MARGIN, top: BAR.y, width: 520 * grow, height: BAR.h, borderRadius: BAR.h / 2, background: C.primary }} />
    </>
  );
};

const Two: React.FC<{ f: number }> = ({ f }) => {
  const ink = inkOn(C.primary);
  return (
    <>
      <MaskLine f={f} inAt={T.two + 8} top={420} size={96} color={ink}>
        The point,
      </MaskLine>
      <MaskLine f={f} inAt={T.two + 16} top={520} size={96} color={ink}>
        in two lines.
      </MaskLine>
      <Typewriter f={f} start={T.two + 30} text="Mono captions annotate the action." top={1520} color={ink} />
    </>
  );
};

const Three: React.FC<{ f: number }> = ({ f }) => {
  const pop = springIn(f, T.three + 34, true);
  const accent = accentOn(C.tertiary);
  return (
    <>
      <MaskLine f={f} inAt={T.three + 18} top={640} size={150} color={C.light}>
        CALL TO
      </MaskLine>
      <MaskLine f={f} inAt={T.three + 26} top={802} size={150} color={accent}>
        ACTION.
      </MaskLine>
      <div
        style={{
          position: "absolute",
          left: (W - BUTTON.w) / 2,
          top: BUTTON.y - BUTTON.h / 2,
          width: BUTTON.w,
          height: BUTTON.h,
          borderRadius: BUTTON.h / 2,
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: 38,
          color: inkOn(accent),
          transform: `scale(${pop})`,
        }}
      >
        FOLLOW {BRAND.handle.toUpperCase()}
      </div>
    </>
  );
};

export const Starter: React.FC = () => {
  const f = useCurrentFrame();
  const i = stageAt(f);
  // The hook drifts up a little while it holds, so no frame is ever still.
  const drift = tween(f, 0, T.flood.cover, 0, -30, ease.linear);
  return (
    <AbsoluteFill style={{ background: STAGES[i].bg }}>
      <GlobalFonts />
      <MusicBed src={BRAND.music} duration={T.end} />
      <AbsoluteFill>
        {f < T.flood.cover ? (
          <AbsoluteFill style={{ transform: `translateY(${drift}px)` }}>
            <One f={f} />
          </AbsoluteFill>
        ) : null}
        {f >= T.two && f < T.wipe.cover ? <Two f={f} /> : null}
        {f >= T.three ? <Three f={f} /> : null}
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <CircleFlood f={f} start={T.flood.start} cover={T.flood.cover} x={MARGIN + 520} y={BAR.y + BAR.h / 2} r0={BAR.h} color={C.primary} />
        <BorderWipe f={f} start={T.wipe.start} cover={T.wipe.cover} end={T.wipe.end} color={C.secondary} />
      </svg>
      <Chrome f={f} stage={STAGES[i].bg} chapter={i} chapterStart={STAGES[i].start} chapterCount={STAGES.length} />
      <Grain f={f} />
    </AbsoluteFill>
  );
};

export const reel = defineReel({
  id: "Starter",
  component: Starter,
  durationInFrames: T.end,
  reviewFrames: [10, 30, 60, 80, 100, 150, 190, 206, 220, 240, 270, 330],
});
