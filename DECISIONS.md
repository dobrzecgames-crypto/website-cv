# Decisions — website

This file records durable product decisions so later sessions and coding agents do not reopen settled questions without a concrete reason.

## Naming

- The GitHub repository is `website-cv`.
- The technical project name used in documentation, prompts, paths and branches is **`website`**.
- Do not create or revive technical paths named `portfolio`.
- In normal product language, the site may still be described as a personal portfolio / personal website when useful to humans.

## Role of the website

- The website is a standalone product and must demonstrate strong normal web-development skill on its own.
- It is not merely a wrapper around Station.
- Station is the flagship case study and should dominate the content.
- SkateRoad is secondary and should appear briefly as proof of range, not as an equal narrative pillar.

## Main narrative

Approved backbone:

**LASER → PADS → SYNTH → SEQ / SONG → MIX → MASTER**

Meaning:

- LASER: decompose the finished product
- PADS: material, touch, direct interaction
- SYNTH: generation and transformation
- SEQ / SONG: hierarchy and reconstruction
- MIX: judgment, iteration, reduction and removal
- MASTER: final coherent product

## Opening and ending

- Open by showing Station as a finished object before explaining everything.
- Use LASER to cut the product apart and begin the deeper case study.
- Rebuild hierarchy during SEQ / SONG.
- Use MIX to show decisions, trade-offs and removed/reversed ideas.
- End MASTER with the complete Station product again.
- The final Station view should feel calmer than the major transformation scenes.

## Historical material

- Older Station screenshots recovered from GitHub are valuable.
- Do not reveal the weakest/earliest versions at the beginning.
- Show them late, especially around MIX, once the viewer already understands the final product.
- Frame them as evidence of iteration and judgment, not as a joke about bad old work.

## Product reduction story

The site should explicitly demonstrate that good product work includes removing things.

Current examples to verify and potentially use:

- STRINGS removed
- autotune removed
- GRAVITY returned to SIDECHAIN naming
- multiple UI concepts rejected/reworked when they felt too dashboard-like, too flat, too decorative or inconsistent

Core principle:

**Not everything that works belongs in the final product.**

## Interaction philosophy

- Everything important should have a reason.
- Major visual events should have consequences.
- Prefer continuity and transformation over disconnected section fades.
- A few strong setup/payoff moments are better than constant visual tricks.
- Example worth exploring: a line appears first as a graphic element and later reveals itself as waveform/wavetable.
- LASER flash should have semantic meaning: cut / reveal / decomposition.

## Visual philosophy

- Creative and authored, not a 1:1 Apple-style imitation.
- Modern and professional, but not generic.
- No SaaS-dashboard look as the default structure.
- No default AI dark-glow aesthetic.
- Synthwave influence should be abstract/structural rather than cliché iconography.
- The website should not simply reuse Station's hardware skin.

## Technical philosophy

- Keep the project relatively lightweight.
- Exploit native browser capabilities before adding heavy libraries.
- Prefer HTML/CSS/SVG/small JS when they can produce the desired effect cleanly.
- Do not pre-install a large creative animation or 3D stack.
- Media is expected to be the main payload; optimize it intentionally.
- Respect reduced motion and accessibility.
- Mobile is first-class and may use different compositions from desktop.

## First prototype

Before building the full page, prove the riskiest interaction:

**full Station → LASER IT → meaningful sliced layers**

Only after that should the implementation stack and motion architecture be considered stable.

## Deployment

No deployment target for `website` is assumed by this document yet.

Do not reuse Station's production deployment rules for this repository unless explicitly instructed.
