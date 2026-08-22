# Grid Bible — website

## Status

This file is a **binding layout specification** for the website, not a moodboard.

Its job is to create a specific contradiction:

> **The page should look loosely scattered at first glance and mathematically inevitable at second glance.**

Internal shorthand: **drunken dealer, Swiss engineer** (`pijany krupier`). Motion may look spontaneous. Final composition must not be random.

This system is intentionally not a generic dashboard grid. The grid is a hidden coordinate system for editorial composition, asymmetry, negative space and motion landing points.

The current desktop layout/export is designed at **1440 px wide**, so 1440 px is the canonical coordinate system for desktop decisions. Responsive layouts preserve the relationships, not every literal pixel.

---

## 1. Core units

Everything authored in layout geometry starts from one atomic unit:

- `u = 4px` — atomic unit
- `b = 8px = 2u` — baseline / micro rhythm
- `d = 16px = 4u` — dot-grid pitch and default gutter
- `r = 32px = 8u` — major rhythm unit
- `m = 56px = 14u` — canonical 1440 desktop outer rail
- `c = 96px = 24u` — canonical 1440 desktop column width
- `p = 112px = 28u` — macro pitch (`c + d`)

### Rule

Authored spacing, offsets, padding, gaps and deliberate fixed dimensions must be multiples of `4px` unless an exception is explicitly allowed later in this document.

Do not introduce values such as `37px`, `53px`, `117px` because they look right in one screenshot.

Prefer the project scale:

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 160 / 192 / 256`

Not every multiple of four is equally important. Reuse the scale above before inventing another multiple.

---

## 2. Canonical desktop grid: 1440 px

At 1440 px the macro grid is exact:

```text
1440 = 2m + 12c + 11d
     = 2(56) + 12(96) + 11(16)
     = 112 + 1152 + 176
```

Therefore:

- canvas: `1440px`
- left rail: `56px`
- right rail: `56px`
- columns: `12`
- column width: `96px`
- gutters: `11 × 16px`
- content width: `1328px`

The center of the 1440 canvas is `x = 720px`.

**Deliberately, that center line falls in the middle of the central gutter between columns 6 and 7.** The center is a seam, not a default content column. This helps the page remain balanced without reflexively centering every object.

### Column starts

1-indexed column start positions at 1440:

```text
01  56
02  168
03  280
04  392
05  504
06  616
07  728
08  840
09  952
10  1064
11  1176
12  1288
```

Each next column starts exactly `112px` after the previous one.

### Span formula

A block spanning `n` complete columns has width:

```text
W(n) = n·c + (n - 1)·d
     = 96n + 16(n - 1)
     = 112n - 16
```

Canonical widths:

| Span | Width |
| ---: | ---: |
| 1 | 96px |
| 2 | 208px |
| 3 | 320px |
| 4 | 432px |
| 5 | 544px |
| 6 | 656px |
| 7 | 768px |
| 8 | 880px |
| 9 | 992px |
| 10 | 1104px |
| 11 | 1216px |
| 12 | 1328px |

Use these widths for major media whenever the composition allows it instead of arbitrary percentages.

---

## 3. The dot grid

The macro 12-column grid is not enough. Inside it is a finer invisible lattice:

- horizontal dot pitch: `16px`
- vertical dot pitch: `16px`
- micro baseline: `8px`

Think of a bullet-journal page: the eye should not see the dots in production, but the author should be able to reconstruct where every major object belongs.

### Vertical coordinates

Do **not** try to snap the entire infinite document to one global absolute Y coordinate. Responsive content would make that brittle.

Instead:

- every chapter/scene has a local origin;
- the scene origin starts on the major `32px` rhythm;
- important Y positions inside the scene land on `16px` rows;
- text baselines and micro spacing may use the `8px` rhythm.

This gives vertical order without turning the website into fixed-height slides.

---

## 4. What must snap and what may remain fluid

### Must be authored from the grid

- scene padding
- section gaps
- text-block X positions
- major media X positions
- deliberate fixed widths
- overlay/overlap offsets
- landing anchors for motion
- absolute/fixed composition coordinates when used
- breakpoint margins and gutters

### May be computed/fluid

- image height when preserving intrinsic aspect ratio
- CSS Grid fractional column widths below the canonical 1440 layout
- transform interpolation during animation
- subpixel rasterization produced by the browser
- fluid type produced by `clamp()`

Do not distort media merely to force its computed height onto a 4px boundary. Snap the **container width and placement**; preserve the media's aspect ratio.

The rule is about authored geometry, not about pretending the browser never produces fractional pixels.

---

## 5. Scale hierarchy

A viewport should normally contain no more than **three meaningful visual scales**:

1. `primary` — the object carrying the chapter
2. `supporting` — secondary explanatory object(s)
3. `detail` — labels, small controls, technical fragments

Do not create six nearly different object sizes. That reads as accidental inconsistency, not complexity.

For normal chapter composition, useful starting ranges are:

- detail: `1–3` columns
- supporting: `3–6` columns
- primary: `6–12` columns

These are ranges, not mandatory templates.

### Hero card scale

The hero deals fourteen cards across the table. They must not read as
fourteen thumbnails, so scale is a hierarchy, not a distribution.

Widths come from the span table `W(n)`. Because each card is a real crop of a
real panel, each carries its own aspect ratio, so **width alone does not
control weight** — the weight class is the rendered area:

- `primary` — one or two cards, roughly 3x the area of a small one
- `supporting` — three or four
- `small` — the rest

Heights vary far more than widths do, and that is what stops a row of `W(2)`
cards from reading as a grid of thumbnails: a step matrix, a bus strip and a
mono synth at the same width are 224, 42 and 255 tall.

The frozen assignment is in section 19.

---

## 6. Alignment economy: how chaos stays sterile

Every major object must have a mathematical reason for where it sits.

A major object must satisfy at least one of these:

- one vertical edge sits on a macro column rail;
- its center sits on a deliberate macro rail/seam;
- one horizontal edge/baseline sits on a `16px` row;
- it is explicitly anchored to another grid-snapped object.

Text blocks should normally start on a column rail.

### Dominant axes

Within one viewport-sized composition, choose roughly **2–4 dominant alignment axes**. Reuse them enough that the eye feels hidden order, but do not align every object to the same left edge.

A good target is that a clear majority of major visible objects participate in one of those axes while the remaining objects create counterweight.

This is the difference between editorial asymmetry and random placement.

---

## 7. Asymmetry rules

### Do not center by reflex

The intact Station hero and the final MASTER resolution may intentionally use strong centering.

Most intermediate chapter compositions should not place the primary object exactly on the page center merely because it is easy.

At 1440, remember that `x = 720` is a gutter seam. Use the seam as tension, not as the default place for every object center.

### Avoid fake symmetry

Do not build layouts that are almost mirrored but miss by a few pixels.

If a composition is asymmetric, make the asymmetry legible:

- shift by at least one dot (`16px`) for small relationships;
- shift by at least one macro pitch (`112px`) for large compositional decisions when space allows;
- change span family rather than scaling one object by an arbitrary 3–5%.

### No radial menu geometry

The dealt hero must **not** look like six items evenly distributed around a circle or compass.

Avoid:

- equal angular intervals;
- mirrored pairs around the center;
- one card exactly north, one south, one east, one west as a default scheme;
- identical travel distance for every card.

The final frame should look dealt, not generated by `justify-content: space-around`.

---

## 8. Negative space is a grid object

Empty space is not leftover space.

Use these minimum relationships unless a deliberate overlap rule applies:

- micro relation: `16px`
- normal separation between unrelated major boxes: `32px`
- strong chapter breathing room: `64–128px`
- major chapter transition: typically `96–256px`, chosen from the scale

Avoid accidental gaps smaller than `16px` between unrelated major elements. They read as collisions.

Large empty regions should be traceable to the same column and rhythm system as visible objects.

Do not fill a hole merely because a hole exists.

---

## 9. Overlap and bleed budget

Overlap is allowed because the page is editorial, not a dashboard. It must remain controlled.

For ordinary chapter scenes:

- normally no more than one major overlap/bleed gesture per viewport-sized composition;
- use overlap depths from the spacing scale (`8 / 16 / 24 / 32px`) rather than arbitrary offsets;
- never obscure body copy;
- never hide an interaction target;
- do not let a decorative overlap make component state ambiguous.

For the dealer hero, multiple rotated cards are part of the concept and are not counted as separate exceptions. Even there, avoid turning the final frame into a pile.

As a practical ceiling, a card overlap should normally cover **less than ~8% of the smaller card's visible area** unless a later deliberate composition proves a stronger overlap is necessary.

---

## 10. The dealt-table hero: geometry contract

This is the canonical idea for the opening interaction.

### Semantic model

The page opens on Station and nothing else: one closed instrument, centred,
with nothing showing from under the chassis and no card on the table.

`LASER IT` performs on Station the cut Station performs on a sample. One
flash; the machine delaminates along its own seams; and everything it was
holding goes across the table at once, fast, the way a dealer throws.

The point being made is quantity. A viewer who has never opened Station should
come out of the first second knowing that one browser tab holds far more than
they expected.

### A card is one thing

This is the rule that separates the scene from a screenshot gallery:

- one card is one instrument, one grid, one display, one control group;
- it is cut out of a real capture on that panel's own boundary, found by
  scanning for the flat rows that separate one panel from the next, so a cut
  never runs through a control;
- the chassis — transport, readout, project row, view tabs — is cut away.

A set of cards that all show the same chassis with a different tab open is the
failure this rule exists to prevent: it looks like fourteen pictures of one
screen instead of fourteen things inside one machine. Several cards in the
frozen set never appear on screen together in the real app, which is exactly
why they belong on the table together.

Do not invent a card. If the capture set has no evidence for a feature, the
card does not exist yet — ASSET_PLAN.md, "missing-content rule".

### The machine does not survive the cut

Its bands separate and fade while the first cards are still in the air. Nothing
of it is left standing in the middle of its own contents: no emptied frame, no
dimmed ghost, no fragment of chassis parked in a corner as though it were a
card. A strip of chassis is part of the machine's natural look and says nothing
on its own.

### Overlap is expected here

A dealt table is not a gallery. Cards may overlap, but only as a corner
catching a corner — a few percent, never a card sitting squarely on another.
The ceiling is 12% of the smaller card, and the frozen frame uses 0.4%.

### Final landing rules

At the canonical 1440 layout:

1. all landing anchors are deterministic;
2. no `Math.random()` or random CSS values for final position/rotation;
3. anchors snap to the `16px` dot lattice and preferably to macro rails where practical;
4. card widths come from the span table, `W(n) = 112n - 16`;
5. preserve each card's own aspect ratio — it comes from the panel that was cut;
6. the landed frame carries no rotation; rotation lives in the flight only;
7. use at least ten distinct landing rows and eight distinct landing columns,
   so a table of fourteen cards can never resolve into tidy rows;
8. no two cards may travel the same distance from the source;
9. at most four cards may bleed past an outer rail, and never so far that less
   than 70% of the card stays on the table;
10. card coverage of the canvas belongs between roughly 60% and 80%: below it
    the table looks half-dealt, above it the cards stop reading as separate
    objects.

### Global balance test

Local placement should be irregular, but the whole hero must not visually fall over.

After final positions are chosen, compute an approximate area-weighted centroid of the six dealt card bounding boxes:

```text
A_i  = width_i × height_i
Cx   = Σ(A_i × centerX_i) / ΣA_i
Cy   = Σ(A_i × centerY_i) / ΣA_i
```

For the canonical desktop hero, target:

```text
|Cx - heroCenterX| <= 56px
|Cy - heroCenterY| <= 32px
```

This does **not** mean individual cards should be symmetric. It means irregular local throws should produce stable global balance.

### Mirror-pair rejection test

For two cards `i` and `j`, do not accept a pair that is effectively a mirror around the hero center.

A simple rejection condition for the canonical desktop can be treated as:

```text
abs((xi + xj) - 2*heroCenterX) <= 32px
AND
abs((yi + yj) - 2*heroCenterY) <= 32px
```

If both are true and the two cards have similar size, move one of them. The composition is becoming diagrammatic.

### Collision test

Use unrotated bounding boxes first for layout solving, then verify rotated visual bounds.

- preferred clear distance between unrelated cards: `>= 16px`
- preferred clear distance around labels/copy: `>= 32px`
- deliberate overlap must follow the overlap budget above

---

## 11. The dealt-table hero: timing contract

Motion geometry and landing composition are one scene, so the clock is part of
this document.

The intended feeling is a dealer's hands: **bach-bach-bach**, not a slideshow.
The deal is deliberately faster than a card can be read. Nobody is meant to
study the table on the way past — the impression to leave is how much came out
of one object, and that only lands if it happens at once.

Targets:

- launch interval: `32–48ms` at fourteen cards; scale it so every card is in
  the air inside `500–650ms`
- individual flight: `320–420ms`
- launches overlap heavily; the next card starts long before the last one lands
- the machine starts coming apart on the flash and is gone before the third
  card lands
- complete deal and settle: `<= 1.1s` after the flash
- the scroll cue appears only once the table has resolved, typically
  `120–200ms` after the last card
- rotation exists only in flight. A dealer's hand is loose; the table is not.
  Every card is square when it lands.

Measured on the implemented scene, from the click: cut at `175ms`, fourteen
launches between `180ms` and `676ms`, everything settled at `995ms`, cue at
`1168ms`. Load `?audit` to read this trace back from `data-audit` on the stage.

Motion paths may leave the grid. **Landing state returns to it.**

---

## 12. Chapter composition after the hero

The page below the hero should not become `one chapter = one 100vh slide`.

Each chapter owns a compositional territory whose height follows content.

Use the same 12-column / 16px lattice, but vary the visual weight:

- one chapter may be left-heavy;
- the next may be right-heavy;
- another may use a 10–12 column primary object;
- another may split two substantial objects;
- a short chapter may resolve in roughly one viewport;
- a complex chapter may take two or more scrolls.

Do not repeat the same weight profile mechanically in consecutive chapters.

### Stable anchors across changing chapters

Variation needs recurring anchors. Preserve a small set of stable behaviors:

- chapter number/title obey the macro grid;
- body copy uses controlled column widths;
- labels/captions obey the 8/16px rhythm;
- media aligns to real rails even when the overall scene is asymmetrical;
- chapter transitions use spacing tokens, not arbitrary vertical gaps.

The viewer should feel the layout changing while the measuring system stays the same.

---

## 13. Typography as grid content

This document does not replace a future type bible, but type must obey the composition system.

- body-copy container widths should usually be `2–4` columns;
- prefer readable line lengths over filling available width;
- text block left edges normally sit on column rails;
- vertical spacing between kicker/title/body/list should use the 8/16/32 rhythm;
- optical glyph compensation of up to `4px` is allowed, but the text container remains grid-aligned;
- do not repair weak hierarchy by adding arbitrary boxes or borders.

---

## 14. Responsive grid

The **1440 grid is the master composition**, not a requirement to keep literal 96px columns on every device.

### Large desktop: `>= 1440px`

- max composition width: `1328px`
- 12 columns
- `16px` gutters
- composition centered
- at exactly 1440: `56px` side rails
- above 1440: extra width becomes additional outer field, not wider columns by default

### Desktop: `1200–1439px`

- 12 fluid columns
- `16px` gutters
- target side padding: `40px`
- preserve span relationships, hierarchy and asymmetry

### Tablet: `768–1199px`

- 8 fluid columns
- `16px` gutters
- target side padding: `32px`
- recomposition is allowed and expected

### Mobile: `< 768px`

- 4 fluid columns
- `12px` gutters
- target side padding: `20px`
- use an intentional mobile composition; do not mechanically shrink the desktop dealer map

All authored fixed spacing remains on the 4px system.

The dealer hero requires a **separate landing map per breakpoint family**. Do not scale the desktop coordinates down proportionally.

---

## 15. CSS implementation direction

A canonical desktop grid can be represented approximately as:

```css
:root {
  --u: 4px;
  --baseline: 8px;
  --dot: 16px;
  --rhythm: 32px;
  --grid-gap: 16px;
  --grid-max: 1328px;
  --desktop-rail: 56px;
}

.layout-grid {
  width: min(var(--grid-max), calc(100% - 2 * var(--desktop-rail)));
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--grid-gap);
}
```

This is a direction, not a requirement to force every bespoke scene into one shared DOM grid. Narrative scenes may use CSS variables and absolute transforms when that better preserves continuity.

### No magic-number drift

If a layout value repeats or expresses a system rule, promote it to a named token/custom property.

Do not scatter slightly different versions of the same spacing through multiple files.

---

## 16. Debug overlay requirement

Before the final motion/layout pass, add a development-only grid overlay that can show:

1. 12 macro columns
2. 16px dot lattice
3. center seam
4. outer rails
5. optional major 32px rows

Preferred access: a dev/query/debug toggle, not production-visible UI.

The overlay exists to answer one question:

> If the page looks chaotic with the overlay off, does it suddenly look rigorously constructed with the overlay on?

If the answer is no, the composition is not finished.

---

## 17. Allowed exceptions

The system is strict, not dogmatic.

Allowed exceptions:

- intrinsic media height after a snapped width is chosen;
- transform interpolation and subpixel animation;
- rotation angles;
- optical text adjustment up to `4px`;
- one deliberate large bleed/overlap gesture in an ordinary viewport composition;
- browser-generated fractional dimensions in fluid responsive grids.

Any authored positional exception larger than `4px` that cannot be explained by these rules should be treated as suspicious.

If a real design reason requires breaking the grid, leave a short code comment beginning with:

```text
GRID-EXCEPTION:
```

The point is not bureaucracy. The point is to stop accidental magic numbers from becoming the visual system.

---

## 18. Review checklist

Before accepting a scene at 1440 desktop:

- [ ] Major authored dimensions and offsets come from the 4px system.
- [ ] Macro placement uses the 12-column rails/spans where practical.
- [ ] The composition uses no more than three meaningful scale levels.
- [ ] Every hero card is one thing, cut on a real panel boundary — never the
      same chassis again with a different tab open, and never a strip of chassis.
- [ ] Asymmetry is deliberate, not nearly-symmetrical drift.
- [ ] Negative space is intentional and uses the same spacing language.
- [ ] No accidental gap below 16px exists between unrelated major objects.
- [ ] Any overlap/bleed is deliberate and limited.
- [ ] Hero final positions are deterministic; no random landing state exists.
- [ ] The hero table does not resemble a radial menu, a neat gallery or a wall.
- [ ] Nothing shows from under the chassis before the trigger, and nothing of
      the machine is left standing after it.
- [ ] The area-weighted hero centroid remains globally balanced.
- [ ] The grid overlay makes the hidden order obvious.
- [ ] With the overlay off, the composition still feels free rather than dashboard-like.
- [ ] Responsive behavior recomposes instead of merely scaling down.
- [ ] Reduced-motion content remains understandable.

---

## 19. The frozen hero contract

The six components have been measured, so the canonical frame is no longer
open. This section is the executable hero-layout contract; `styles/station.css`
implements it and nothing else may re-derive it.

### Superseded — dealer visual-correction contract, 2026-08-22

The dealer frame recorded here on 2026-08-22 (`f3da8f9`, `6f1ef0a`) was not
accepted: it read as six equally weighted screenshots distributed around a
dimmed chassis. It is superseded by the opened-instrument contract below and
must not be re-derived. Its landing table remains in git history.

---

### Opened-instrument hero contract — superseded, 2026-08-22

An intermediate pass released six modules from the slot, each cut at one
horizontal seam, and closed the emptied chassis into a control strip docked in
the corner. It was rejected for the same reason as the dealer frame before it:
six panels is not richness, a module cropped to a band reads as a scrap of
screenshot, and a parked strip of chassis carries no information. Superseded by
the contract below. Its table is in git history.

---

### Dealt-table hero contract — canonical desktop

**Canvas.** `1328 x 800` — the binding 12-column content width at 1440, and 50
rows of the 16px lattice. Coordinates are canonical canvas units with the
origin at the canvas top-left. `--u` converts one unit to pixels; the table
scales as one plate and never reflows into a second composition. `--u` is
`1.000` wherever the viewport can give the canvas its full height.

**Source.** Station intact, span 3, `320 x 638.58`, at `504 / 80` — dead centre
of the canvas. Its centre `664 / 399` is the point every card comes out of.

**The cards.** Fourteen, each a measured rectangle of a real capture. The
rectangles and how they were found are in `tools/derive-cards.mjs`; what was
cut is recorded in `media/station/cards/MANIFEST.json`.

| card | source | span | x | y | w × h | launch |
|---|---|---|---:|---:|---:|---:|
| laser-waveform | laser-sliced | W(5) | 0 | 16 | 544 × 188 | 1 |
| synth-zola-x | zola-x-idle | W(3) | 672 | 400 | 320 × 382 | 2 |
| pads-grid | pads-active | W(2) | 224 | 288 | 208 × 203 | 3 |
| mix-channels | mix-active | W(3) | 1120 | 304 | 320 × 259 | 4 |
| seq-matrix | seq | W(2) | 784 | 128 | 208 × 224 | 5 |
| synth-bassic | bassic-idle | W(2) | 1008 | 48 | 208 × 259 | 6 |
| laser-slices | laser-sliced | W(3) | 336 | 624 | 320 × 162 | 7 |
| synth-monogorg | monogorg-idle | W(2) | 0 | 432 | 208 × 255 | 8 |
| song-arrangement | song | W(2) | 1008 | 592 | 208 × 162 | 9 |
| synth-drum | drum-synth-kick | W(2) | 448 | 352 | 208 × 193 | 10 |
| synth-picker | synth-picker | W(2) | 560 | 64 | 208 × 230 | 11 |
| laser-source | laser-overview | W(2) | 112 | 688 | 208 × 86 | 12 |
| laser-cut | laser-sliced | W(3) | -112 | 224 | 320 × 67 | 13 |
| mix-bus | mix-active-02 | W(3) | 1120 | 0 | 320 × 42 | 14 |

**Measured validation** at `1920 x 1080`, where the canvas gets its full
height. Every number was read back off the live DOM, not intended:

- `--u` resolves to `1.000`; every card lands within a pixel of its authored
  coordinate;
- area-weighted centroid `665.6 / 400.1`, i.e. `+1.6 / +0.1` from the canvas
  centre;
- worst overlap `0.4%` (mix-channels against synth-bassic), against a 12%
  ceiling — the table reads dealt, not piled;
- fourteen distinct landing rows and eleven distinct landing columns;
- card coverage `66.6%`, so the table is covered without becoming a wall;
- three cards bleed past a rail — laser-cut off the left, mix-channels and
  mix-bus off the right;
- no rotation in the landed frame, no runtime RNG, no per-viewport fudging.

Two control-row cards, `laser-cut` and `mix-bus`, are placed within `420` units
of the display they belong to. Alone in a corner they read as a scrap; beside
the thing they control they read as part of it. Everything else is scattered.

### Dealt-table hero contract — tablet and mobile

Each family owns its own canvas and its own deal. Neither is a scaled copy.

- **Tablet, 768–1199.** Canvas `960 x 1320`; 8 columns, step `122`,
  `W(n) = 122n - 16`. Station at `330 / 210`, `300` wide. The throw runs down a
  three-column table rather than across a wide one. Taller than the viewport by
  design.
- **Mobile, < 768.** Canvas `350 x 1560`; 4 columns, step `90.5`,
  `W(n) = 90.5n - 12`. Station at `60 / 40`, `230` wide. Three full-width cards
  lead, then the rest fall in two columns, alternating which rail they hold.

---

## 20. One-sentence test

When in doubt:

> **It may look as if a drunk dealer threw the pieces onto the page, but every place they land must survive inspection with a ruler.**
