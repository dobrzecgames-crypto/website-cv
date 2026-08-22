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

## Agent communication

_Source: user instruction, 2026-08-22._

- `agent-comms/` is documentation only — no automation, no agent invoking another agent.
- Each outbox has a single writer; the other agent reads and never edits it.
- Outbox entries are append-only; read messages are not deleted.
- Agent-to-agent agreement never overrides an explicit user decision.
- Product-direction questions are marked `STATUS: USER DECISION NEEDED` and escalated, not resolved between agents.
