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

### Hero module scale

The hero releases six modules from one machine. They must not read as six
equally important screenshots, so scale is a hierarchy, not a distribution.

Widths come from the span table `W(n)`. Because each module is a real crop of a
real capture, each carries its own aspect ratio, so **width alone does not
control weight** — the weight class is the rendered area:

- `primary` — one module only, roughly 3-4x the area of a detail module
- `supporting` — two modules
- `detail` — three modules

Do not make all six the same size, do not let more than three share one width
family, and do not let a supporting module out-weigh the primary.

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

## 10. The opened-instrument hero: geometry contract

This is the canonical idea for the opening interaction.

### Semantic model

Station starts intact: one closed object, with nothing showing from under the
chassis before the trigger.

The central mode area behaves like a **magazine of states**:

`LASER → PADS → SYNTH → SEQ → SONG → MIX`

When the current module leaves the centre, the next is revealed underneath.

**The outgoing module must not remain duplicated inside Station.** The viewer
must read one physical object leaving one stack.

### Every cut is horizontal, and lands on a real seam

This is the rule that separates decomposition from decoration:

- the seven cuts across the chassis fall in real gaps between Station's chassis
  modules, measured off the capture;
- each module is released at **its own** internal panel boundary, found by row
  variance in that module's capture — the waveform display, the eight loaded
  pads, the wavetable screen, the step matrix, the arrangement lanes, the
  channel bank.

A module is therefore a meaningful part rather than a strip, and it is far more
legible at hero size than a whole mode screen shrunk to fit. Do not invent a cut
position because it improves the composition; move the module instead.

### The chassis closes

After the last module clears the slot, the chassis closes over its own empty bay
and its foot, and withdraws. It keeps its full width and its view-tab row — the
row that names the six pieces now lying around it — so the machine remains the
evidence that all of this came out of one object.

It must not remain as a tall frame with a hole in it, and it must not become a
dimmed ghost of the whole instrument. Both readings restore the dominant dark
mass this contract exists to remove.

### Final landing rules

At the canonical 1440 layout:

1. all landing anchors are deterministic;
2. no `Math.random()` or random CSS values for final position/rotation;
3. anchors snap to the `16px` dot lattice and preferably to macro rails where practical;
4. card widths come from the `S/M/L` families above;
5. preserve each component's aspect ratio;
6. rotation is authored and fixed, normally within `-5deg … +5deg`; `0deg` on
   every module is a legitimate and currently preferred choice, because
   axis-aligned pieces read as parts of a machine while tilted ones read as
   cards, and because a tilted piece breaks the horizontal-cut language above;
7. do not use symmetrical `+x / -x` angle pairs as a pattern;
8. no more than one card should land close to an exact cardinal direction from the source deck without a specific reason;
9. use at least five distinct landing rows/columns across the six cards so the result does not become a neat two-row gallery;
10. at most one card may intentionally bleed beyond the normal outer rail in the canonical hero frame.

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

## 11. The opened-instrument hero: timing contract

This is included here because motion geometry and landing composition are one scene.

The intended feeling is a professional dealer: **bach-bach-bach**, not a slideshow.

Starting timing targets:

- launch interval between cards: `90–120ms`
- individual flight: roughly `360–520ms`
- launches overlap heavily; the next card starts before the previous one lands
- all six launches should happen in roughly `450–650ms`
- complete visible deal + settling should normally finish in `<= 1.2s`
- the next mode should become visible in the central deck almost immediately as the outgoing card clears it
- no multi-second pause to present each mode
- the chassis begins closing roughly `90ms` after the last module clears the
  slot and takes about `380ms`; it must not wait for every module to settle,
  because a chassis still standing open around an empty bay reads as a hole
- the down-arrow/scroll cue appears only after the scene has visibly resolved, typically `120–200ms` after the last meaningful settle

These are tuning targets, not a demand for one exact easing curve.

Measured on the implemented scene, from the click: cut at `171ms`, six launches
between `179ms` and `656ms`, chassis closing at `756ms`, everything settled at
`1126ms`, cue at `1291ms`. Load `?audit` to re-read this trace from the
`data-audit` attribute on the stage.

Motion paths may leave the grid while in flight. **Landing state returns to the grid.**

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
- [ ] There are 2–4 identifiable dominant alignment axes.
- [ ] Asymmetry is deliberate, not nearly-symmetrical drift.
- [ ] Negative space is intentional and uses the same spacing language.
- [ ] No accidental gap below 16px exists between unrelated major objects.
- [ ] Any overlap/bleed is deliberate and limited.
- [ ] Hero final positions are deterministic; no random landing state exists.
- [ ] The dealer hero does not resemble a radial menu or neat gallery.
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

### Opened-instrument hero contract — canonical desktop

**Canvas.** `1328 × 656` — the binding 12-column content width at 1440, and 41
rows of the 16px lattice. All coordinates below are canonical canvas units with
the origin at the canvas top-left, which at `1440 × 900` is page `x 56` and
resolves at exactly `1px` per unit. Below that size the canvas scales as one
plate; it never reflows into a second, unauthored composition.

**Source.** Station intact on column 5, `320 × 638.58`, top at `y 8`. The core
slot — the box all six modules occupy while the machine is closed — is
`x 448 / y 165 / 320 × 410.67`.

**Cut fractions.** Where the laser releases each module, as a fraction of the
`720 × 924` plate, found by row variance in that module's own capture:

| module | cut | what the cut keeps | visible aspect |
|---|---:|---|---:|
| LASER | `.2911` | waveform display, eight slice markers | 2.68 |
| PADS  | `.3750` | the eight loaded pads, rows 1-2 | 2.08 |
| SYNTH | `.3271` | the ZOLA-X wavetable screen | 2.38 |
| SEQ   | `.8452` | the full step matrix | 0.92 |
| SONG  | `.6169` | six arrangement lanes | 1.26 |
| MIX   | `.6450` | the eight channel strips | 1.21 |

**Landing frame.** Scale is `W(n) / 320`; rotation is `0deg` throughout.

| module | span / scale | x | y | w × h | weight | z | launch | landing note |
|---|---|---:|---:|---:|---|---:|---:|---|
| LASER | W(6) / 2.05 | 768 | 48 | 656 × 245 | primary | 6 | 1 / 0ms | Starts on the slot's own right edge and runs off the page. The one sanctioned bleed. |
| PADS | W(4) / 1.35 | 0 | 240 | 432 × 208 | supporting | 4 | 2 / 95ms | Holds the left rail under the chassis. Eight pads answer the eight markers above them. |
| SYNTH | W(4) / 1.35 | 448 | 464 | 432 × 181 | supporting | 3 | 3 / 190ms | Starts on the slot's own left edge, one band below it. |
| SEQ | W(2) / 0.65 | 448 | 0 | 208 × 226 | detail | 5 | 4 / 285ms | The one near-square piece, on the slot's left edge at the top of the canvas. |
| SONG | W(2) / 0.65 | 112 | 480 | 208 × 165 | detail | 2 | 5 / 380ms | Lower-left counterweight; its right edge shares the chassis' right edge. |
| MIX | W(2) / 0.65 | 1120 | 448 | 208 × 172 | detail | 7 | 6 / 475ms | The far throw, and the only mass in the lower right. |

**The chassis** closes to its head — `320 × 157`, the top `.24589` of the frame —
and docks at `0 / 0`, under the wordmark.

**Measured validation** of the rendered frame at `1440 × 900`. Every number
below was read back off the live DOM, not intended:

- `--u` resolves to `1.000`; every piece lands within a pixel of its authored
  coordinate;
- area-weighted centroid `713.1 / 329.7`, i.e. `+49.1 / +1.7` from the canvas
  centre — inside the `±56 / ±32` balance envelope;
- minimum clear distance `21.5px` (PADS/SEQ, corner to corner); every pair that
  actually faces another across a corridor clears `32px` or more;
- three shared alignment axes: `x 0` (chassis, PADS), `x 320` (chassis right
  edge, SONG right edge), `x 448` (SEQ, SYNTH — the slot's own left edge);
- six distinct landing rows and five distinct landing columns;
- throw distances `195 / 263 / 393 / 437 / 509 / 637` — no two within `40px`,
  so no two pieces read as the same throw;
- throw angles clump right-and-down instead of spreading evenly; one throw
  (PADS) lands within 10° of a cardinal, which is the permitted maximum;
- mirror-pair rejection passes for every pair;
- object coverage `50.1%`; nothing overlaps, so the overlap budget is unused;
- one bleed past the right rail (LASER, `616` of `656` visible at 1440);
- no rotation, no runtime RNG, no per-viewport coordinate fudging.

### Opened-instrument hero contract — tablet and mobile

Each family owns its own canvas and its own map, per section 14. Neither is a
scaled copy of the desktop frame.

- **Tablet, 768–1199.** Canvas `960 × 900`; 8 columns, step `122`,
  `W(n) = 122n - 16`. Station on column 3, `350` wide. LASER at `W(4)` flush to
  the right rail; SEQ and PADS hold the left; SYNTH crosses the middle; MIX and
  SONG fall to the right. The canvas is taller than a 768px viewport by design.
- **Mobile, < 768.** Canvas `350 × 1170`; 4 columns, step `90.5`,
  `W(n) = 90.5n - 12`. Station takes all four columns. The modules fall down the
  page in a staggered cascade, alternating which rail they hold, with SEQ and
  SONG paired across the gutter. Labels hang above their piece at this size.

---

## 20. One-sentence test

When in doubt:

> **It may look as if a drunk dealer threw the pieces onto the page, but every place they land must survive inspection with a ruler.**
