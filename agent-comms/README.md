# agent-comms

A file-based communication channel between the agents working on `website`
(currently Claude and Codex).

This is **not** an autonomous multi-agent system. No agent starts, schedules or
controls another. The repository is only a durable, shared place to leave notes
so the user does not have to retype context between sessions.

---

## Purpose

Answers five questions across sessions:

- what was done,
- what needs review,
- what one agent wants to ask the other,
- which decisions are already approved,
- what must **not** be rebuilt again.

---

## Files and ownership

| File | Writer | Reader | Rules |
|---|---|---|---|
| `CODEX_OUTBOX.md` | Codex only | Claude | append-only |
| `CLAUDE_OUTBOX.md` | Claude only | Codex | append-only |
| `HANDOFF.md` | both | both | current state only, overwrite in place |
| `DECISIONS.md` | both | both | approved decisions only, append-only |
| `README.md` | both | both | change only when the protocol changes |

Ownership rules:

- Never write to the other agent's outbox.
- Never edit, reword, correct or delete another agent's entry.
- Outbox entries are **append-only**. Add new entries at the bottom.
- Do not delete a message because it has been read. Archiving old entries is
  allowed later, but is not needed now.

### Scope note: two `DECISIONS.md` files

- `/DECISIONS.md` (repo root) — canonical **product** decision record.
- `agent-comms/DECISIONS.md` — decisions confirmed **during agent sessions**,
  so an agent does not re-litigate them next session.

The root file wins on conflict. If an agent-session decision turns out to be a
real product decision, it belongs in the root file too.

---

## Two message forms

### 1. Close entry — the default

Written by the task owner after the user accepts and closes a task. Normally
3–6 lines. This is what most entries look like.

````md
## YYYY-MM-DD — CODEX → CLAUDE

**CLOSED:** what was closed
**COMMIT:** SHA
**KNOW:** what the other agent should know; what not to rebuild; what is next
````

`KNOW` is the only field that carries judgment. Use it for intent, constraint,
risk, or "this is settled, do not touch it". Leave it out if there is genuinely
nothing to add.

### 2. Full message — only when something is open

Use this **only** for `review`, `question`, `blocked` or `USER DECISION NEEDED`.
Do not use it to report finished work.

````md
## YYYY-MM-DD HH:MM — CLAUDE → CODEX

**TOPIC:** short subject
**STATUS:** review | question | blocked | USER DECISION NEEDED
**RELATED:** commit SHA / file / feature

### Message

What the other agent needs to know. Short.

### Requested action

What the other agent should actually do or judge.

### Do not change

Optional. Things the other agent should leave alone.
````

Rules for both forms:

- One entry per topic. Do not merge unrelated topics.
- `COMMIT` / `RELATED` must point at something verifiable — a real SHA, a real
  file path, a named feature. Never invent a SHA.
- If an entry is obsolete, do not delete it. Post a new one that supersedes it
  and say so.

---

## Start-of-session protocol

Before starting any meaningful work, read:

1. `agent-comms/HANDOFF.md` — what is active and who owns it
2. the other agent's outbox — `CODEX_OUTBOX.md` (Claude) / `CLAUDE_OUTBOX.md` (Codex)
3. `agent-comms/DECISIONS.md` — what is settled

Then read the product documents named in `CLAUDE.md` / `AGENTS.md`.

If `HANDOFF.md` says the other agent owns the active task, do not modify that
task's files. Work on something else or ask the user.

---

## End-of-task protocol

Triggered by the user accepting and closing a task — **not** by an agent
deciding it is finished.

1. The task owner appends a **close entry** to their own outbox.
2. Update `HANDOFF.md` **only** if the active task or its owner changed.
3. Add to `DECISIONS.md` **only** what the user explicitly approved.

Work the user rejected, or is still iterating on, is **never** recorded as
closed. Recording it would put a false state into the channel.

---

## Decision protocol

A line goes into `agent-comms/DECISIONS.md` only when the user has clearly
accepted it.

Do not record:

- brainstorms,
- proposals awaiting approval,
- an agent's own interpretation of what the user probably meant,
- anything whose status is uncertain.

If unsure, leave it out and mark the open message `STATUS: USER DECISION NEEDED`.

---

## Handoff protocol

`HANDOFF.md` is the current state, not a log and not a chat.

Update it when:

- the active task changes,
- ownership moves between agents,
- something becomes blocked,
- a new stable checkpoint exists.

Do not update it to say work is "in progress" with no state change. A stale
`HANDOFF.md` is worse than none, because the other agent trusts it.

---

## Anti-noise rules

Do not write:

- "finished", "done", "looks good", "acknowledged",
- test logs, build output or full reports pasted in without a reason,
- restatements of changes already readable in the commit,
- status updates that change nothing,
- long prose where three lines would do.

If the diff already says it, do not repeat it. Say what the diff cannot: intent,
risk, constraint, open question.

---

## No conversation loops

The protocol must not produce `Claude → Codex → Claude → Codex …`.

- If the other agent already answered sufficiently, do not reply.
- Do not confirm receipt.
- If a product-level decision is needed, mark `STATUS: USER DECISION NEEDED`,
  stop the exchange, and let the user decide.

Two exchanges on one topic is normally the limit. Beyond that, escalate to the
user instead of continuing.

---

## Agent roles

Default strengths. These are routing hints, **not** hard limits.

**Codex** — implementation, engineering, interaction mechanics, motion
implementation, geometry implementation, testing, performance.

**Claude** — visual review, composition critique, editorial/layout review,
second-opinion design analysis.

Claude may implement. Codex may critique design. The point of listing this is so
that when work is handed over, it is clear *why* the other agent is being asked.

---

## User remains final authority

> Agent-to-agent messages are recommendations and implementation context. They
> do not override explicit user decisions.

If Codex proposes something, Claude agrees, and the user has said otherwise —
the user's decision wins. Agents cannot approve a change of product direction
between themselves. Anything that changes product direction requires the user.
