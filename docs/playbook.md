# Playbook: hooks and trial reels

> Part of [Creator Kit](../README.md). How to start a reel so people stay, and how to test two openings without guessing. Claude uses the same rules when it plans a reel with you.

## The first 3 seconds

Most people decide in the first second whether to keep watching. The hook is the words and picture in those first 3 seconds.

- **Readable on mute.** Most people scroll with the sound off. The hook must work as text on screen.
- **Short.** At most 6 words on screen. One line you can read in one glance.
- **The picture does something.** Movement, a hand, a result, a mistake. Not a logo, not a title card.
- **One promise.** The viewer should know what they get if they stay. Then the reel has to keep that promise.
- **Inside the safe zone.** Keep the hook away from the edges, where the app puts buttons and the caption (see [platforms.md](platforms.md)).

## Hook types

Pick a type on purpose, so you can later see which type works for *your* audience. Your brand file lists the ones you use in `content.hook_types` (the example brand uses *mistake*, *before/after* and *one-tool challenge*). If you have none yet, start with these:

| Type | What it does | Example (Kiln Hour) |
|---|---|---|
| result first | show the finished thing, then how | "This mug never touched a wheel" |
| pain first | name the problem they have | "Your pinch pot cracks overnight?" |
| mistake | show what went wrong and why | "I scored too shallow. Here's the crack." |
| before / after | two states, side by side | "Day 1 vs day 30 of coil mugs" |
| contrarian | disagree with a common belief | "You don't need a kiln to glaze" |
| question | a question they want answered | "Why did this handle fall off?" |
| list / number | a countable promise | "10 tools already in your kitchen" |
| how-to | the step, straight away | "Slip and score in 20 seconds" |

Avoid hooks that shame the viewer ("you're doing it wrong") unless that is really your voice. Your `voice.dont` list in the brand file is where you write those rules down.

## Trial reels: test two hooks

A **trial reel** is an Instagram reel shown first to people who don't follow you. Your followers don't see it unless you decide to share it with them later. That makes it a clean test: same video, different opening, strangers as the judges.

How the kit does it, when `content.trial_reels: true` is in your brand file:

1. When you plan a reel, Claude writes **hook A** and **hook B**, two *different* hook types, each 6 words or less. The `ab-hook-tester` skill writes and judges the pair.
2. You pick. Hook A goes on the normal reel. Hook B goes on a second version, `reel-trial-B.mp4`, where **only the hook changes**. Its caption, `trial-B.txt`, is written for strangers, not for your followers.
3. You post the normal reel as usual, and the B version as a trial reel (in the Instagram app: on the share step, switch on **Trial**; with Postiz, the `post-video` skill sets it for you).
4. After a few days, compare the two in your numbers. Add both rows to `reels/content/_metrics/metrics.csv` with their `hook_type` filled in.

Change one thing only. If you change the hook *and* the music, you won't know which one made the difference.

## Reading the result

- **Views** tell you how far the hook carried the reel. **Saves, shares and follows** tell you whether the rest was worth it. When they disagree, say so; don't pick the number you like.
- One test is a hint, not a rule. After about 5 reels per hook type you start to see a pattern.
- The dashboard's **Performance** tab shows which hook types win, using a score of shares + saves + follows per 1,000 views ([analytics.md](analytics.md)).
- Once a month, ask Claude to run `content-calendar-from-analytics`. It plans most of next month on your winning hook types and keeps a few slots for testing a new one.

## A checklist before you post

- [ ] The hook is 6 words or less and readable on mute
- [ ] The first frame already shows something happening
- [ ] The reel keeps the hook's promise before the end
- [ ] Hook A and hook B are different types (trial reels on)
- [ ] The hook type is written down, so the numbers can be compared later
