# website

Personal interactive website and product showcase.

This repository is intentionally referred to as **`website`** in project documentation, paths, branches, prompts and agent instructions. Do not create or revive technical paths named `portfolio`.

## Status

Early concept / pre-production.

The current focus is to define the narrative, interaction language, technical constraints and source assets before implementation begins.

## Core idea

The website itself is a product and a demonstration of modern web development. Its main story is built around **Station**, a browser-based music workstation. Rather than presenting Station as a static gallery of screenshots, the website uses Station's own workflow as the narrative structure:

**LASER → PADS → SYNTH → SEQ / SONG → MIX → MASTER**

The page begins with Station as one complete product. LASER cuts it apart; later sections inspect and reorganize its systems; SEQ / SONG restores hierarchy; MIX shows selection, iteration and removal; MASTER resolves everything back into the finished product.

## Project docs

- `PROJECT_BRIEF.md` — purpose, audience, goals and non-goals
- `DESIGN_PRINCIPLES.md` — visual and interaction rules
- `STORYBOARD.md` — narrative flow and major transitions
- `CONTENT_STRUCTURE.md` — what information each chapter needs to communicate
- `TECHNICAL_PRINCIPLES.md` — performance and implementation constraints
- `ASSET_PLAN.md` — source material required from Station and other work
- `CLAUDE.md` — working rules for Claude and other coding agents
- `DECISIONS.md` — durable product decisions that should not drift between sessions

## Development

Implementation stack and commands will be added after the first technical prototype is chosen. Do not add a large framework or animation stack before proving that the interaction requires it.
