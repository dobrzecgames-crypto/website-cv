# Asset Plan — website

The goal is to collect only the material that helps tell the story. Do not dump every Station screenshot into production.

## Folder direction

Recommended production-facing structure:

- `public/media/station/final/`
- `public/media/station/history/`
- `public/media/station/details/`
- `public/media/other/`

If higher-resolution archival/source files are needed, keep them outside the initial production load path.

Never create technical folders named `portfolio`.

## Priority A — final Station views

Collect a small, curated set:

- full Station overview / strongest hero view
- LASER final view
- PADS final view
- ZOLA-X / strongest synth view
- SEQ or SONG final view
- MIX final view
- any MASTER/final presentation view if distinct

Aim for roughly 6–10 genuinely useful final images before adding more.

## Priority B — interaction/details

Only collect close-ups that support a specific story point, for example:

- LASER slicing markers / waveform
- pad pressed/unpressed state
- synth waveform/wavetable
- sequencer hierarchy/timeline
- mixer channels/meters
- selected touch/control states

Avoid redundant crops that communicate the same thing.

## Priority C — Station history

Recovered GitHub screenshots are valuable, but should be curated.

Select a few stages that visibly demonstrate meaningful change:

1. very early / primitive Station
2. one or two intermediate versions with a clear design/product shift
3. later pre-final version
4. current final direction

Do not publish a chronological image dump.

For each historic image, record if possible:

- approximate date or commit
- what changed next
- why the change mattered
- whether the change was visual, interaction, architecture or product scope

## Priority D — removed / reversed ideas

Gather visual or repository evidence for decisions that may appear in MIX:

- STRINGS removal
- autotune removal
- GRAVITY → SIDECHAIN reversal/rename
- rejected dashboard-like UI versions
- major control/slider/pad redesigns

If visual evidence is weak, do not fabricate a before/after graphic. Text plus a real commit/history reference is preferable.

## Priority E — secondary work

For SkateRoad, gather only what is needed for a concise secondary section:

- one strongest image or short clip
- official project URL
- itch.io URL
- optional GitHub/source URL if suitable

## Media production rules

Before production use:

- crop intentionally
- remove irrelevant browser chrome where appropriate
- export at realistic sizes
- create mobile-appropriate variants if needed
- use modern image formats where they give real savings
- preserve enough quality for large editorial presentation

Do not optimize source assets destructively before the final compositions are known.

## Motion assets

Prefer native animation when the visual can be reconstructed cheaply.

Use short video only when it communicates real product behavior that would be expensive or misleading to fake.

Potential short clips:

- LASER behavior
- pad response
- synth interaction
- sequencer behavior

Do not autoplay multiple heavy clips simultaneously.

## Asset metadata

As assets are added, maintain a small manifest or clear filenames.

Good filename examples:

- `station-final-overview`
- `station-laser-final`
- `station-pads-pressed`
- `station-zolax-final`
- `station-early-2026-07`

Avoid filenames such as `final2-new-real-final.png`.

## Missing-content rule

If the storyboard requires an asset that does not exist, mark it as missing in documentation or a task. Do not generate fake historical evidence or silently substitute an unrelated screenshot.
