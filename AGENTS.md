<!-- bmad:context -->
<!-- Verified 2026-09-26 against the current repo state: BMAD scaffold present under _bmad and .agents, no app source tree yet. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## MinanTrack

This repository is currently a BMAD-enabled workspace with tooling and generated workflow assets, not a filled-in application codebase yet. Planning and project guidance live under `_bmad/` and the installed skills under `.agents/skills/`.

## Policy

- Keep repo-level AI instructions in this AGENTS.md block and avoid duplicating them in ad hoc docs.
- Treat `_bmad/` and `_bmad-output/` as BMAD-managed directories; do not hand-edit those files unless the task explicitly calls for a BMAD workflow change.
- Do not claim project behavior or commands without verifying the repo state or the tool output first.
- Never commit or push without explicit user approval.

## Where things are

- BMAD install and config: `_bmad/`
- BMAD generated outputs: `_bmad-output/`
- Installed BMAD skills: `.agents/skills/`
- Repo editor settings: `.vscode/`
- GitHub automation: `.github/`
- Project knowledge to add when the product starts: `docs/` (create only when needed)

## Running and verifying

- Resolve BMAD config with: `uv run _bmad/scripts/resolve_config.py --project-root .`
- Keep `uv` available on PATH; current BMAD setup depends on it for Python-backed skills.
- If a BMAD command is being re-run, prefer the current installed CLI form: `npx bmad-method install ...` rather than deprecated `init` usage.
- Validate file and directory paths before writing instructions or commands that depend on them.

## Conventions that differ from defaults

- Prefer evidence-driven repo guidance over generic coding advice; this repo is not yet a mature application codebase.
- Use the BMAD workflow order before implementation: project context, PRD, architecture, epics/stories, then build.
- Keep instructions small and specific to the repo state; avoid copying broad stack assumptions into this file before the product is defined.

## Known pitfalls

- `npx bmad-method init` is not valid for the installed CLI version; the working command is `npx bmad-method install ...`.
- BMAD requires `uv`; without it, the Python-backed skill scripts fail or halt.
- This repo currently has workflow scaffolding and no evidence of a live product implementation, so avoid writing product assumptions as fact.

<!-- /bmad:context -->
