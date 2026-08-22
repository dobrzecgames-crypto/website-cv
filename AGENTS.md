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
