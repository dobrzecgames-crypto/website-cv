# Station Micro-Interaction Lab

An isolated, dependency-free playground for five visual feedback experiments:

- PADS — short rubber travel and edge-constrained under-light
- ZOLA-X — one Station-derived display control per view
- MIXER — deterministic signal envelopes with fast attack and slow release
- LASER — pointer playhead and concise slicing confirmation
- SEQ — focused step toggles with an optional visual playhead

This directory is not imported by the production website. It has no audio,
storage, project state, samples or sequencing engine.

## Run

From the repository root:

```powershell
node tools/serve.mjs --root prototypes/station-interactions --port 4180
```

Then open `http://localhost:4180/`.

The files can also be served by any static HTTP server. No install or build step
is required.
