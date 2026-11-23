// The example round the Style tab shows until Claude writes reels/style/round.json.
// Previews are drawn in CSS (see web/src/styles.css), so it works with no files at all.
import type { StyleRound } from "../../shared/src/index.ts";

export const EXAMPLE_ROUND: StyleRound = {
  round: {
    title: "Find your style one round at a time",
    round: "example",
    intro: "Claude makes a round of graphics and animations for your style. Watch each one, mark it Keep, Maybe or Drop, leave a note, and submit. Claude reads every note and builds the next round from them.",
    notes: [],
    aspect: "9:16",
  },
  sections: [
    { id: "ex-type", name: "Text entrances", use: "Three ways the same word can land. In a real round these are options Claude made for your brand.", order: 1 },
  ],
  cards: [
    { id: "ex-1a", section: "ex-type", label: "Pop", desc: "Scales up from small with a little overshoot.", demo: "pop", order: 1 },
    { id: "ex-1b", section: "ex-type", label: "Slide", desc: "Slides up from below on a fast ease.", demo: "slide", order: 2 },
    { id: "ex-1c", section: "ex-type", label: "Typed", desc: "Types on in mono with a cursor.", demo: "typed", order: 3 },
  ],
};
