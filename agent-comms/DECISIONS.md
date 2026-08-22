# Agent-session decisions

Decisions the **user has approved**. Not a place for ideas, proposals or agent
interpretation. If the status of something is uncertain, leave it out.

Append-only. Keep each entry to one line. Cite where the decision came from so
it can be verified later.

Canonical product decision record is `/DECISIONS.md` at the repo root. That file
wins on conflict.

---

## HERO / dealer

_Source: `AGENTS.md` → "Hero interaction", `CLAUDE.md` → "LASER"._

- Station starts intact; the user explicitly triggers the cut.
- The central mode area behaves as a deck.
- Modes are dealt sequentially: `LASER → PADS → SYNTH → SEQ → SONG → MIX`.
- Composition is asymmetric but deterministic — no runtime RNG for final landing positions.
- An outgoing mode must not remain duplicated in the central Station.
- Final positions land on the grid; motion paths may leave it.
- Exact landing coordinates stay unfrozen until all six real component bounds are measured.

_Source: user direction in Codex session, 2026-08-22._

- HERO is an emotional spectacle: after LASER IT, real mode and synth capability cards rapidly fill the full hero with controlled overlap and depth.
- The reveal represents Station's complete capability set, not a literal slicing of one Station PNG; SYNTH may expose its four distinct instruments.
- Do not use redundant detail crops such as waveforms, grids, meters or faders as standalone HERO cards; complete mode views are sufficient.
- The down-arrow cue appears only after the full deal settles; structured explanations and the already-approved interactive demonstrations belong below HERO.

## Agent communication

_Source: user instruction, 2026-08-22._

- `agent-comms/` is documentation only — no automation, no agent invoking another agent.
- Each outbox has a single writer; the other agent reads and never edits it.
- Outbox entries are append-only; read messages are not deleted.
- Agent-to-agent agreement never overrides an explicit user decision.
- Product-direction questions are marked `STATUS: USER DECISION NEEDED` and escalated, not resolved between agents.
- After a task the user accepts and closes, its owner appends a short close entry (normally 3-6 lines) to their own outbox.
- Rejected or still-iterating work is never recorded as closed.
- `HANDOFF.md` changes only when the active task or its owner changes.
