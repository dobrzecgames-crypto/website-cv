# CODEX → CLAUDE

Written by **Codex only**. Claude reads, never edits.
Append-only: new entries go at the bottom.

Format and rules: `agent-comms/README.md`.

---

## 2026-08-22 16:36 — CODEX → CLAUDE

**TOPIC:** HERO dealer — visual/composition ownership
**STATUS:** HANDOFF / VISUAL CORRECTION NEEDED
**RELATED:** `f3da8f9`, `6f1ef0a`, `index.html`, `scripts/laser.js`,
`styles/station.css`, `styles/site.css`, `styles/grid.css`, `GRID_BIBLE.md`

### Message

The implemented mechanics are usable and may be worth preserving:

- One complete central Station acts as the deck. Six real mode DOM nodes are
  dealt in order `LASER → PADS → SYNTH → SEQ → SONG → MIX`; the next mode is
  revealed under the outgoing one, without six full Station copies.
- `LASER IT` triggers a fast, overlapping bach-bach deal. The final state keeps
  an empty central slot; the scroll cue appears only after settle. Reduced-motion
  behavior is present, and MIX retains its SOLO/MUTE and measurement behavior.
- The primary implementation checkpoint is `f3da8f9`. The latest visual
  correction candidate is `6f1ef0a`; it is **not accepted**. Relevant source is
  in `index.html`, `scripts/laser.js`, `styles/station.css`, `styles/site.css`,
  `styles/grid.css` and `GRID_BIBLE.md`.

The user rejected the current visual composition: the initial PADS peek, radial
or compass-like arrangement, oversized cards (especially SYNTH and MIX), the
chassis reading as a dominant black hole, and fitting that depends too strongly
on the 1440×1000 / real-browser viewport height. The prototype works
mechanically, but does not yet achieve **chaos on first glance / sterility on
second glance**.

The intended read is a drunken dealer executed by a Swiss engineer: after the
single intact Station and `LASER IT`, deal the six modes quickly across the
table, asymmetrically and deterministically — not radially, symmetrically,
randomly or by compass points — while respecting `GRID_BIBLE.md`.

A later second deal is planned for smaller capability cards (remaining synths,
DISPLAY and selected details). Do not implement it yet: the first deal establishes
the architecture; the second adds depth. Sections below the HERO remain
selective, not an inventory dump.

### Requested action

Take ownership of the HERO visual/composition correction and prepare the next
version for user review. Preserve the existing technical architecture and timing
where they help, but freely change composition, scale, landing positions,
masking, chassis treatment, viewport fitting and subtle motion. Do not rewrite
the technology without a reason; report if the structure blocks the intended
result.

### Do not change

- Do not treat `6f1ef0a` or its HERO composition as accepted.
- Do not implement the second capability-card deal yet.
- Do not modify production domains or DNS as part of this handoff.
