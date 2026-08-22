# AGENTS.md — working rules for website

This repository is `website-cv`, but the technical project name used in prompts, documentation, paths and branches is **`website`**. Do not introduce technical paths named `portfolio`.

## Read before implementation

Before changing code, read:

1. `PROJECT_BRIEF.md`
2. `DESIGN_PRINCIPLES.md`
3. `GRID_BIBLE.md`
4. `STORYBOARD.md`
5. `CONTENT_STRUCTURE.md`
6. `TECHNICAL_PRINCIPLES.md`
7. `ASSET_PLAN.md`
8. `DECISIONS.md`

Treat these as product requirements.

## Grid rule

`GRID_BIBLE.md` is the binding geometry/composition specification.

Do not replace it with arbitrary pixel positioning, a generic dashboard/card grid, evenly spaced radial hero items or random final landing coordinates.

The intended visual contradiction is:

> loose/scattered at first glance; mathematically ordered on inspection.

At canonical 1440 desktop, the grid is based on a 4px atom, 16px dot pitch, 12 columns, 96px columns, 16px gutters and 56px outer rails. Exact responsive behavior and allowed exceptions are defined in `GRID_BIBLE.md`.

## Hero interaction

The opening Station interaction uses the central mode area as a deck:

`LASER → PADS → SYNTH → SEQ → SONG → MIX`

Cards are dealt quickly into an asymmetric but deterministic composition. An outgoing mode must not remain duplicated in the central Station. Final positions land on the grid; motion paths may leave it.

Do not freeze exact landing coordinates until all six real component bounds are available and measured.

## Git safety

Before writing:

- inspect current repository state;
- preserve unrelated user changes;
- never reset/delete work to simplify the task;
- do not deploy unless explicitly requested.

If local work is already in progress, integrate documentation/code changes without discarding it.

## Agent communication

Codex and Claude share this repository. `agent-comms/` is the durable channel
between them. It is documentation only — no agent starts, schedules or controls
another. Full protocol: `agent-comms/README.md`.

Before starting meaningful work, read:

- `agent-comms/HANDOFF.md` — what is active, who owns it
- `agent-comms/CLAUDE_OUTBOX.md` — messages from Claude
- `agent-comms/DECISIONS.md` — what is already settled

After meaningful work:

- leave a message in `agent-comms/CODEX_OUTBOX.md` if Claude needs context the
  diff does not show — for example a handoff or a review request;
- update `agent-comms/HANDOFF.md` only when ownership, status or the next step
  actually changed;
- add to `agent-comms/DECISIONS.md` only what the user approved.

Codex never writes to `agent-comms/CLAUDE_OUTBOX.md` and never edits Claude's
existing entries. Outboxes are append-only.

Keep messages short. No "finished", "looks good", "acknowledged", no dumped test
logs, no restating what the commit already shows.

Agent-to-agent messages are recommendations and implementation context. They do
not override explicit user decisions. If a product-direction question arises,
mark it `STATUS: USER DECISION NEEDED` and stop the exchange instead of settling
it with Claude.
