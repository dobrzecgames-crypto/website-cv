# CLAUDE.md — working rules for website

## Project identity

This repository is `website-cv`, but the technical project name used inside prompts, documentation, paths and branches is **`website`**.

Do **not** create, restore, search for or migrate technical paths named `portfolio` unless explicitly instructed to inspect a historical artifact. Do not report irrelevant discoveries about old `portfolio` paths. The current project is `website`.

## Read before implementation

Before changing code, read:

1. `PROJECT_BRIEF.md`
2. `DESIGN_PRINCIPLES.md`
3. `STORYBOARD.md`
4. `CONTENT_STRUCTURE.md`
5. `TECHNICAL_PRINCIPLES.md`
6. `ASSET_PLAN.md`
7. `DECISIONS.md`

Treat these files as product requirements, not decorative notes.

## Product priority

The website itself must demonstrate strong modern web-development skill.

Station is the flagship case study and demonstrates range beyond standard web work, but it must not compensate for a weak website.

A useful test:

> If Station media were temporarily removed, would the website still demonstrate strong responsive frontend, typography, interaction quality, accessibility and performance?

If not, improve the website itself.

## Narrative backbone

The current approved story is:

**LASER → PADS → SYNTH → SEQ / SONG → MIX → MASTER**

Interpretation:

- LASER = decomposition
- PADS = material / touch / direct interaction
- SYNTH = generation / transformation
- SEQ / SONG = hierarchy / reconstruction
- MIX = judgment / reduction / iteration
- MASTER = final integrated product

Do not replace this with generic sections such as `About / Skills / Projects / Contact` without a strong product reason.

## Major interaction principle

Do not treat sections as unrelated slides.

Prefer transformations where one state meaningfully becomes the next.

A line, grid, light or object may be introduced before its later meaning becomes clear. This setup/payoff language is encouraged, but it must remain sparse and intentional.

Do not force every object to return later.

## LASER

A likely first signature interaction is **LASER IT**.

The user starts with Station intact, explicitly triggers the cut, sees a short controlled laser flash, and Station separates into meaningful narrative pieces.

Do not make the slices arbitrary merely to create visual motion.

The LASER flash means cut / reveal / decomposition. Do not reuse it as generic transition decoration.

## MIX / removal

The website should demonstrate that product work includes destruction and reversal, not only accumulation.

Current examples include:

- STRINGS removed
- autotune removed
- GRAVITY returned to SIDECHAIN naming
- UI ideas repeatedly rejected/rebuilt when they harmed clarity or made the product look too dashboard-like

Before final publication, verify exact historical wording against repository evidence.

Never fabricate project history.

## Visual direction

Avoid:

- generic developer templates
- Apple imitation as the main design idea
- SaaS dashboard layout
- excessive cards
- AI-style dark gradients and glow
- generic neon synthwave clichés
- effect-demo aesthetics where every viewport performs a different trick

Prefer:

- editorial composition
- strong type hierarchy
- meaningful spatial transitions
- a small visual grammar
- restrained but memorable signature moments
- contemporary use of signal/music concepts

## Technical philosophy

**Native web first.**

Before installing a library, determine whether semantic HTML, CSS, SVG and a small amount of JavaScript can do the job cleanly.

Do not install a creative-web stack by default.

Three.js, GSAP, smooth-scroll libraries, WebGL and similar tools are allowed only when the actual interaction justifies them.

Prefer high perceived complexity over high implementation complexity.

## First implementation objective

Do not build the whole page first.

Prototype the riskiest interaction:

**intact Station → LASER IT → sliced meaningful layers**

Validate it for:

- desktop
- mobile/touch
- reduced motion
- reasonable performance

Only then lock the broader implementation/animation approach.

## Performance

Treat performance as part of the portfolio claim.

Avoid making an impressive-looking site that demonstrates poor frontend engineering.

Watch media weight, layout shifts, input responsiveness and unnecessary JavaScript.

## Accessibility

No essential information may depend only on:

- hover
- animation
- color
- precision pointer input

Use semantic controls, keyboard access and visible focus states.

Respect `prefers-reduced-motion`.

## Mobile

Do not compress the desktop experience mechanically.

Every signature scene should have an intentional mobile version. It may use a different composition while preserving the same meaning.

## Git workflow

Default branch: `main`.

Do not create a new branch unless explicitly asked or the task specifically requires isolated experimentation.

Before writing:

- inspect current repository state
- preserve unrelated user changes
- do not delete or reset work merely to simplify the task

After meaningful implementation work:

- run available tests/checks
- report what changed
- report any known limitations
- do not deploy unless explicitly requested

## Agent behavior

Do not silently reinterpret the project into a standard portfolio template.

If an implementation detail is ambiguous, prefer the option that preserves:

1. narrative logic
2. usability
3. performance
4. maintainability
5. visual originality

When those conflict, explain the trade-off in the work summary rather than hiding it.
