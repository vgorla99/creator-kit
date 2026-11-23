import type { Item } from "../../shared/src/index.ts";

const line = (i: Item): string => `- ${i.code}${i.date ? ` (${i.date})` : ""} ${i.title} [${i.stage}: ${i.folder}]`;
const withNote = (i: Item): string => `${line(i)}\n  Note: ${i.dash.notes.trim().replace(/\n+/g, "\n  ")}`;

/** One prompt the creator pastes to Claude: what to post, what to change, what is still open. */
export function buildPrompt(brandName: string, provider: string, unsorted: Item[], today: string): string {
  const items = [...unsorted].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const approved = items.filter((i) => i.dash.approved && !i.dash.notes.trim());
  const approvedWithNotes = items.filter((i) => i.dash.approved && i.dash.notes.trim());
  const changes = items.filter((i) => !i.dash.approved && i.dash.notes.trim());
  const open = items.filter((i) => !i.dash.approved && !i.dash.notes.trim());
  const how = provider.startsWith("postiz") ? "schedule on Postiz" : "give me the posting checklist";

  const parts = [`Dashboard review — ${brandName} — ${today} (${items.length} posts)`];
  if (approved.length) parts.push(`Approved — ${how} as planned:\n${approved.map(line).join("\n")}`);
  if (approvedWithNotes.length) parts.push(`Approved after these small changes — apply them, then ${how}:\n${approvedWithNotes.map(withNote).join("\n")}`);
  if (changes.length) parts.push(`Change first, then show me again (not approved yet):\n${changes.map(withNote).join("\n")}`);
  if (open.length) parts.push(`Not reviewed yet — leave as is:\n${open.map(line).join("\n")}`);
  parts.push(
    "Post folders and dash.json (approved/notes) are the source of truth. Follow brand/brand.yaml and brand/STYLE.md. " +
      "Only the approved posts go out; never post anything I did not approve, and confirm with me before publishing.",
  );
  return parts.join("\n\n");
}
