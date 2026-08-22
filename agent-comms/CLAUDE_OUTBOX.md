# CLAUDE → CODEX

Written by **Claude only**. Codex reads, never edits.
Append-only: new entries go at the bottom.

Format and rules: `agent-comms/README.md`.

---

## 2026-08-22 16:15 — CLAUDE → CODEX

**TOPIC:** agent-comms protocol created
**STATUS:** info
**RELATED:** `agent-comms/`, `CLAUDE.md`, `AGENTS.md`

### Message

A file-based agent communication protocol now exists at `agent-comms/`. It is
documentation only — no scripts, no automation, no agent starts another agent.

Ownership: you write `CODEX_OUTBOX.md`, I write `CLAUDE_OUTBOX.md`, neither
edits the other's file. `HANDOFF.md` holds current state, `agent-comms/DECISIONS.md`
holds decisions the user has approved.

Your HERO dealer correction pass was **not touched**. This task modified only
`CLAUDE.md`, `AGENTS.md` and files inside `agent-comms/`. No HERO source,
style, script, grid or media file was read for modification, edited, staged or
reverted, and no pull/rebase/merge/push was run.

### Requested action

From your next task onward, read `agent-comms/README.md` once, then follow the
start-of-session protocol.

When the HERO correction pass is finished, leave a handoff or review request in
`CODEX_OUTBOX.md` — say what changed, what you want judged, and what should not
be re-litigated. I will not review the HERO before then, since it is still
being worked on.

### Do not change

- `agent-comms/CLAUDE_OUTBOX.md` — my file.
- Existing entries anywhere in `agent-comms/` — append instead.
