# Archive notice

This repository is **frozen at commit `c3e8ad8`** as of 2026-05-25.

Authoritative tag: **`v1-archived`** — `git checkout v1-archived` to see the
exact state at freeze.

## What's in v1

A research / writing directory site for Chanw (Field Notes · 田野笔记),
hand-iterated from an anthropic.com-flavored editorial layout into a
maggieappleton.com-flavored layout over several passes. Live build keeps
serving at `https://lambenthan.github.io/field-notes/`; the 6-hour cron in
`.github/workflows/deploy.yml` still refreshes data snapshots in place.

Top-level surfaces still wired up:

- `/skills` — 130 Claude Code skills across 14 categories
- `/ai` — 43 AI open-source repos across 6 groups
- `/reading` — 12 curated research long-form articles
- `/notes` — 10 longform book drafts (Chanw's own writing)
- `/latest` — live 6h refresh feed (~2,600 items from 24 lab sources)
- `/` — home page composed in maggieappleton.com section order
  (Hero → "The Field" → Essays | Notes → Patterns → Library)

## Why v2 is being built fresh

v1's structural bones still carry anthropic-era assumptions (component
layout, page rhythm, hero composition) under the maggie repaint. To get a
clean Maggie-style rebuild without dragging that history forward, v2 will
be built from scratch using JCodesMore/ai-website-cloner-template's
`/clone-website` pipeline.

## Where v2 lives (work in progress)

`~/Desktop/AI_Plan/2026LLM/maggie-clone/` — JCodesMore template clone with
Phase 1 reconnaissance already complete (see `docs/research/` and
`docs/design-references/` in that directory). The rebuild has not started
yet at the time of this archive.

## What this means for this repo

- **No further code commits.** Cron still pushes `chore: refresh data
  snapshots` automatically; that's the only ongoing activity expected on
  main.
- **Don't open PRs against this repo.** Take new work to v2.
- The full reading-list / skill-list / repo-list data lives in
  `content/*.yml` and is the canonical reference if v2 needs to replay
  it.

## Restore points

- Tag `v1-archived` → exact frozen state.
- Branch `main` → continues to receive cron data refreshes; code-wise
  identical to `v1-archived` until a deliberate change is pushed.
