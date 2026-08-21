# Technical Principles — website

## 1. Native web first

Before adding a dependency, check whether the platform already solves the problem well enough.

Preferred building blocks include:

- semantic HTML
- modern CSS Grid and Flexbox
- container queries
- `clamp()` and fluid sizing
- CSS custom properties
- SVG
- `position: sticky`
- transforms and opacity
- Intersection Observer where useful
- native scroll / view-transition features where browser support and UX justify them
- small, focused JavaScript for orchestration

A library is acceptable when it materially reduces complexity or improves robustness. It must not be added merely because creative websites commonly use it.

## 2. No animation-stack cargo cult

Do not begin by installing Three.js, React Three Fiber, GSAP, Lenis, a shader stack or multiple motion libraries.

First prototype the actual interaction with the lightest appropriate tools.

Use WebGL/Canvas only when the visual genuinely requires a realtime raster/3D environment or a very large number of dynamic elements.

## 3. Progressive enhancement

The core content and navigation must remain usable if advanced motion is unavailable or reduced.

The base experience should still provide:

- project story
- readable content
- links
- navigation
- contact

Advanced motion enhances continuity; it must not be the only way information exists.

## 4. Reduced motion

Respect `prefers-reduced-motion`.

Provide alternatives for major transformations, parallax-like movement and the LASER flash.

Never use repeated rapid flashing or strobing.

## 5. Performance is a product feature

The website should demonstrate that visual ambition does not require waste.

Track at minimum:

- LCP
- INP
- CLS
- JavaScript bundle size
- total initial media weight

Avoid preventable layout shifts and input latency.

## 6. Media is the likely weight budget

Station screenshots and video will probably outweigh application code.

Therefore:

- export images at realistic display sizes
- use modern formats when appropriate
- provide responsive sources
- lazy-load non-critical media
- avoid giant source PNGs in production delivery
- keep autoplay video short, compressed and optional
- prefer recreating simple visual motion with DOM/CSS/SVG instead of video

Source/archive assets may remain higher quality outside the production path if needed.

## 7. Animate cheap properties by default

Prefer compositor-friendly properties such as:

- `transform`
- `opacity`

Avoid continuously animating layout-heavy geometry across many elements unless measurement proves it acceptable.

## 8. Scroll is input, not a timeline prison

Scroll-linked storytelling is allowed, but the page must not feel like the user is fighting a locked presentation.

Avoid excessive scroll-jacking.

Native scrolling should remain predictable. If a section uses a pinned composition, provide clear progress and a reasonable exit.

## 9. Mobile is a separate composition problem

Do not simply shrink the desktop storyboard.

For every signature interaction, define:

- desktop behavior
- touch/mobile behavior
- reduced-motion behavior

If the desktop version relies on width, pointer precision or multiple simultaneous layers, redesign the mobile expression of the same idea rather than forcing parity.

## 10. Accessibility fundamentals

Use semantic elements and native controls whenever possible.

Ensure:

- keyboard navigation
- visible focus
- meaningful heading structure
- text alternatives for significant media
- reasonable contrast
- controls with adequate touch targets
- no critical hover-only content
- no animation required to understand content

Custom visual controls must not silently discard native interaction semantics.

## 11. Component architecture should follow concepts

Do not prematurely make every rectangle a reusable component.

Extract components where there is real repeated behavior, structure or semantic identity.

Narrative scenes may legitimately contain bespoke composition code.

## 12. Keep narrative state understandable

If scroll progress or interaction changes the meaning/state of a scene, represent that state explicitly rather than scattering unrelated DOM mutations throughout the code.

Prefer a small number of named narrative states such as:

- intact
- slicing
- sliced
- reorganizing
- mixing
- mastered

The final names can change after prototyping.

## 13. Asset boundaries

Keep original/source assets separate from production-optimized assets.

Recommended direction:

- `public/media/station/final/`
- `public/media/station/history/`
- `public/media/station/details/`
- `public/media/other/`

Do not create technical folders or branches named `portfolio`.

## 14. Stack is not frozen yet

Do not choose a framework simply to create activity in the repository.

The first implementation task should prove the hardest narrative interaction — likely the intact Station → LASER cut → meaningful separated layers transition.

Once that prototype establishes the needs, choose the smallest sensible application stack around it.

If React + TypeScript + Vite is selected, it should be because it improves state/component development and continuity with the builder's workflow, not because React is required for a creative page.

## 15. Prove risky ideas before building page volume

Technical order of operations:

1. establish minimal project foundation
2. prototype the LASER transformation
3. validate desktop/mobile/reduced-motion variants
4. measure performance
5. decide animation/tooling needs
6. build the remaining narrative architecture
7. polish and optimize media

Do not build a full static page and postpone the central interaction risk until the end.
