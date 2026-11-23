// The words on the site. Brand facts (name, offer, lead magnet, socials,
// colours, fonts) come from brand/brand.yaml; everything a visitor reads that
// is not a brand fact lives here. The site-builder skill rewrites this file
// for your brand after you approve the plan.
//
// This copy belongs to the invented example brand "Kiln Hour". Replace it.
// Proof quotes must be real: only publish what real customers said, with
// their permission.

export interface Step {
  title: string;
  text: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Section {
  heading: string;
  paragraphs: string[];
  steps?: Step[];
}

export interface Article {
  slug: string;
  /** The long question, exactly as people type it. Becomes the H1. */
  question: string;
  /** Search-result title, under about 48 characters (the brand name is added). */
  title: string;
  description: string;
  published: string;
  updated: string;
  /** Two or three sentences that fully answer the question. Shown first. */
  shortAnswer: string;
  sections: Section[];
  faqs: Faq[];
}

export const home = {
  title: "Hand-built pottery at home, no wheel needed",
  description:
    "Small online workshops that teach pinch, coil and slab pottery at your kitchen table. Six people per group, tools you already own.",
  eyebrow: "Online clay nights · 6 people per group",
  heroLine: "Make your first real pot at the kitchen table.",
  heroText:
    "No wheel, no studio, no kiln to start. Small online workshops where you learn pinch, coil and slab, with a teacher who sees your hands.",
  primaryCta: "Get the free guide",
  secondaryCta: "See how it works",
  offerHeading: "What a workshop looks like",
  offerSteps: [
    { title: "One evening a week", text: "Ninety minutes, live on video. Small enough that you get feedback on your piece every session." },
    { title: "Tools from your kitchen", text: "A knife, a spoon, a sponge and a damp towel. We send a list before the first night." },
    { title: "From lump to finished pot", text: "Four weeks: pinch pots, coils, slabs, then a piece you design yourself." },
  ] satisfies Step[],
  proofHeading: "Why beginners stay",
  proofStats: [
    { value: "6", label: "people per group, never more" },
    { value: "4", label: "weeks from first lump to finished pot" },
    { value: "0", label: "special tools to buy before you start" },
  ],
  proofQuotes: [
    { quote: "I finally understood why my cups cracked. It was the drying, not my hands.", who: "Workshop student" },
    { quote: "Small group, real feedback. I made a planter I actually use.", who: "Workshop student" },
  ],
  leadHeading: "Start tonight with the free guide",
  leadText: "One email with the PDF. No spam, unsubscribe in one click.",
  faqHeading: "Questions before you start",
  faqs: [
    { q: "Do I need a pottery wheel?", a: "No. Everything in the workshops is hand-built: pinch, coil and slab. A wheel is a different skill you can learn later." },
    { q: "What if I don't have a kiln?", a: "You can start with air-dry clay at home and learn every technique. We also show how to find a local kiln that fires pieces for a small fee." },
    { q: "How messy is it?", a: "Less than cooking. A plastic tablecloth and a damp towel cover it. Clay dust is the one thing to avoid: wipe, never sweep." },
  ] satisfies Faq[],
};

export const about = {
  title: "About",
  description: "Who runs the workshops, why they are small, and how they started at a kitchen table.",
  heading: "Clay at the kitchen table, on purpose",
  paragraphs: [
    "Kiln Hour started as one evening a week with a bag of clay and a borrowed table. Most people who want to try pottery never do, because a wheel and a studio feel like a big first step. Hand-building needs neither.",
    "The workshops stay small so every person gets eyes on their piece. Six people, ninety minutes, one technique per night. You learn by making, and you see why something cracked, not only that it did.",
    "Failures are part of the content. Every crack teaches drying, every collapse teaches walls. If something goes wrong in a session, we take it apart together.",
  ],
  valuesHeading: "How we teach",
  values: [
    { title: "Show the messy middle", text: "Not only the finished piece: the slumps, the fixes and the second try." },
    { title: "One tip at a time", text: "Each session has one clear technique, with the exact tool and step." },
    { title: "No gear-shaming", text: "A kitchen knife is a fine tool. Buy things when you know why you need them." },
  ] satisfies Step[],
};

export const contact = {
  title: "Contact",
  description: "Questions about a workshop, a group booking or the free guide? Send a message.",
  heading: "Say hello",
  text: "Questions about a workshop, a private group or the free guide? Send a message and you get an answer within two working days.",
};

export const article: Article = {
  slug: "why-does-hand-built-pottery-crack-while-drying-at-home",
  question: "Why does my hand-built pottery crack while it dries at home, and how do I stop it?",
  title: "Why hand-built pottery cracks while drying",
  description:
    "Hand-built pottery cracks while drying because parts dry at different speeds. Here is how to dry pinch, coil and slab pieces evenly at home, step by step.",
  published: "2026-11-20",
  updated: "2026-11-23",
  shortAnswer:
    "Hand-built pottery cracks while drying because some parts lose water faster than others: thin edges, handles and joins shrink first and pull apart from the thicker body. Stop it by keeping walls an even thickness, joining pieces with score-and-slip, and drying slowly under loose plastic for the first two to three days.",
  sections: [
    {
      heading: "What actually causes the cracks",
      paragraphs: [
        "Clay shrinks as it dries, usually by five to eight percent. That is fine when the whole piece shrinks together. Cracks appear when one part is already dry and stiff while the part next to it is still soft and shrinking.",
        "Rims, handles, feet and thin spots dry first because they have the most surface for their volume. Joins crack when two pieces of clay were pressed together without being properly bonded, so they shrink as two pieces, not one.",
      ],
    },
    {
      heading: "How to dry hand-built pottery without cracks",
      paragraphs: ["Follow these steps for any pinch, coil or slab piece made at home."],
      steps: [
        { title: "Keep walls even", text: "Aim for the thickness of a pencil everywhere. Press your fingers on both sides of the wall to feel thick and thin spots before you stop." },
        { title: "Score and slip every join", text: "Scratch both surfaces with a fork, brush on slip (clay mixed with water to a yoghurt texture), press together and blend the seam on both sides." },
        { title: "Compress the rim", text: "Run a damp sponge or your thumb along the rim to press the clay particles together. Compressed clay cracks far less." },
        { title: "Dry slowly under plastic", text: "Cover the piece loosely with a thin plastic bag for two to three days. Open it a little more each day so the whole piece dries at the same pace." },
        { title: "Wrap the thin parts", text: "Put a small piece of plastic or damp paper towel over handles and rims so they wait for the body." },
        { title: "Turn it over", text: "Once the piece can hold its shape, flip it so the base dries too. Bases dry last and crack when they are left wet on a table." },
      ],
    },
    {
      heading: "Can you fix a crack once it appears?",
      paragraphs: [
        "If the clay is still leather-hard (firm but cool and slightly damp), yes: score the crack, fill it with thick slip, compress it with a rib or spoon, and slow the drying down again under plastic.",
        "If the piece is bone dry, a repair rarely survives firing. Use it to learn where it dried too fast, then reclaim the clay: break it up, soak it in water and wedge it again.",
      ],
    },
  ],
  faqs: [
    { q: "How long should hand-built pottery dry before firing?", a: "Usually one to two weeks at home, depending on thickness and humidity. It is ready when it feels room temperature on your cheek, not cool." },
    { q: "Does air-dry clay crack for the same reason?", a: "Yes. Air-dry clay shrinks unevenly in the same way, so even walls, good joins and slow drying help just as much." },
    { q: "Should I dry pottery near a heater or in the sun?", a: "No. Fast heat dries the outside first and is the most common cause of cracks. A shelf away from heaters and draughts is best." },
  ],
};
