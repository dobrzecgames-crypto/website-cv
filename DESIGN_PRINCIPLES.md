# Design Principles — website

## 1. Meaning before effect

Every major animation or visual transition must communicate a change in content, state or meaning. Do not add motion solely because it looks impressive.

A useful test: if an animation is removed, what information or narrative connection is lost? If the answer is "nothing", the animation probably does not belong.

## 2. Setup and payoff

The website may introduce objects before revealing their full meaning.

Example: a line can first read as a graphic composition element and later reveal itself as a waveform or wavetable.

Use this sparingly. Two or three memorable payoffs are stronger than constant tricks.

## 3. Continuity instead of slides

Major chapters should feel causally connected.

Prefer:

`state A → transformation → state B`

instead of:

`section A → fade out → section B → fade in`

The viewer should feel that the page remembers what happened earlier.

## 4. LASER means cut / reveal / decomposition

The LASER flash and slicing language have semantic meaning.

Use them when something is genuinely being separated, opened or transformed into inspectable parts. Do not reuse the flash as a generic transition.

The first major interaction may use a deliberate **LASER IT** trigger to let the viewer actively cut Station open.

## 5. PADS mean material / touch / direct interaction

When the LASER-created pieces transition toward PADS, their organization should begin to suggest a playable grid or tactile structure.

This chapter is about immediacy and interaction, not merely a screenshot of pads.

## 6. SYNTH means generation / transformation

The synth chapter may use signal, waveform, wavetable, modulation, envelope and controlled morphing as visual concepts.

Avoid generic neon oscilloscopes and decorative glow. The visual language should feel contemporary and authored rather than "AI synthwave".

## 7. SEQ / SONG means hierarchy

This is the point where previously separated content begins to regain order.

Elements may align to a grid, form groups, establish rhythm, acquire order or converge into a larger system.

This chapter should visually begin the reconstruction of Station.

## 8. MIX means judgment

MIX is not only about audio mixing. It represents product judgment.

Use mixing language to show:

- what was retained
- what was reduced
- what was renamed
- what was removed
- what was rebuilt

An overloaded mix can metaphorically represent feature excess. Muting or pulling channels down can represent deliberate removal.

## 9. MASTER means resolution

MASTER should be calmer than the preceding chapters.

The final Station product should reappear as a coherent whole. Avoid another giant spectacle after the narrative has already resolved.

The emotional payoff is clarity: the viewer now understands the finished object more deeply than when it first appeared.

## 10. Contrast creates impact

Do not animate everything.

Quiet sections create the conditions for major moments to feel major. A strong LASER cut has more impact after a composed, stable section than after twenty preceding effects.

## 11. Motion must respect reduced-motion preferences

The narrative must remain understandable without large animated transitions.

Provide reduced-motion alternatives for:

- rapid transformations
- flash effects
- parallax-like movement
- large scroll-linked motion

Never rely on repeated flashing or strobing.

## 12. No generic portfolio grammar

Avoid default portfolio patterns unless they are genuinely the clearest solution:

- grids of identical project cards
- skill percentage bars
- "Hello, I'm X" template hero sections
- decorative tech-logo clouds
- feature cards used merely to fill space

## 13. No dashboard reflex

Do not put information into cards merely because components are easy to build that way.

Use composition, typography, grouping and spatial hierarchy first. Cards should exist only where a bounded object is conceptually appropriate.

## 14. Station influences behavior, not the entire skin

The website can borrow concepts from Station but should not simply copy Station's hardware/instrument UI.

The site needs to demonstrate range: editorial composition, modern responsive web design and creative interaction outside the instrument aesthetic.

## 15. Synthwave without cliché

If synthwave influence appears, extract structural qualities rather than icons:

- depth
- horizon
- perspective
- controlled light
- dark space
- signal
- geometry

Avoid default neon sunsets, palms, DeLoreans, VHS overlays and purple grids unless a later concept gives one of them real meaning.

## 16. A visual object should obey its own semantics

If a light indicates "active", do not later use the same light randomly as decoration.

If a line represents continuity or signal, transformations of that line should remain understandable.

The site should develop a small visual grammar rather than a collection of unrelated tricks.

## 17. Typography is part of the composition

Use type scale, line length, spacing and rhythm intentionally. Do not compensate for weak hierarchy with borders and boxes.

Large type can act as structure. Small labels may support technical detail. Both need a clear reason to exist.

## 18. White space must be intentional

Empty space should create hierarchy, tension or focus. Avoid accidental dead zones that feel like missing content.

## 19. Perceived complexity > implementation complexity

Prefer simple underlying mechanics that create rich visual results.

Examples:

- SVG path instead of a 3D scene for a signal line
- transform/opacity instead of layout-heavy animation
- layered media instead of unnecessary realtime rendering
- native CSS features instead of JavaScript listeners where practical

## 20. The website itself must pass the hiring test

If every Station screenshot were temporarily removed, the remaining site should still demonstrate strong web-development judgment through layout, responsive behavior, accessibility, interaction quality and performance.
