# Current Handoff

_Current state only. Not a log, not a chat. Update when state actually changes._

**Last updated:** 2026-08-22 18:16 — Claude

## Active

**User** — visual review of the rebuilt HERO.

## Paused

**Claude** — HERO rebuild delivered; no further iteration before that review.

**Codex** — no HERO implementation or visual iteration before that review.

## Current state

The HERO was rebuilt rather than corrected. Station starts intact and closed;
`LASER IT` cuts it open; the six modules leave the one central slot, each
released at its own real panel seam, and land on a frozen asymmetric frame; the
emptied chassis closes over its bay and docks under the wordmark.

Verified at 1920/1440/1280/1200 desktop, 1024/834/768 tablet and 430/390/360/320
mobile: the six plates are one exact stack before the trigger at every size,
nothing overlaps after, no horizontal overflow, console clean. Reduced motion
lands the same frame with no travel. Cold load 537 KB over 21 requests,
FCP 244ms, CLS 0, 216 DOM nodes, click to next painted frame 23ms.

Codex's `prototypes/station-interactions/` is untouched and is reserved for the
reading chapters, not the hero.

Unrelated in-flight work is sitting uncommitted in `assets/station/` and
`tools/capture-station.mjs`, plus new BASSIC / MonoGorg / drum-synth captures.
Neither agent should fold it into their own commits.

## Next

1. The user reviews the rebuilt HERO.
2. If accepted: mount the interaction lab into the reading chapters.
3. The second capability-card deal is still not started, by instruction.

## Technical checkpoints

- `f3da8f9` — dealer mechanics; superseded, mechanism partly retained
- `6f1ef0a` — dealer visual correction; **not accepted**, superseded
- current working tree — opened-instrument HERO, awaiting review

## Stable references

- `GRID_BIBLE.md` section 19 — the frozen hero contract with measured validation
- `GRID_BIBLE.md` — binding geometry specification
- `PROJECT_BRIEF.md`, `DESIGN_PRINCIPLES.md`, `STORYBOARD.md`
- `CONTENT_STRUCTURE.md`, `TECHNICAL_PRINCIPLES.md`, `ASSET_PLAN.md`
- `DECISIONS.md` (root) — canonical product decisions
- `agent-comms/DECISIONS.md` — decisions settled in agent sessions
