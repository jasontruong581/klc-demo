# Phase 05 — Verification, review, and PR

## Overview

- Priority: P1
- Status: Completed
- Effort: 2h
- Goal: prove the static site is coherent, accessible enough for review, and cleanly delivered in a new PR.

## Verification

1. Run repository-wide searches for visible `KLC`, broken legacy logo references, stale 16-concept/five-family statements, and missing Concept 17 links.
2. Serve locally via HTTP. Smoke root + Concepts 01–17; verify console, network, imports, navigation, forms, and WebGL fallbacks.
3. Browser-check Concept 17 at 375, 768, 1024, 1440 px; keyboard/focus; reduced motion; no horizontal overflow.
4. Exercise all six products in Concepts 13–17. Confirm range matrices, selectors, calculations, and scene updates.
5. Validate SVG and HTML basics; inspect text contrast and missing alt/ARIA labels.
6. Ensure PDF extraction/render temp files are deleted and not staged.
7. Independent code review: claim accuracy, state synchronization, maintainability, accessibility, runtime errors.
8. Route findings to original file owner; rerun affected tests. Spawn debugger only if failures need root-cause work.
9. Review `git diff`, commit conventional units, push `codex/kc-brand-concept-17`, create PR to `main` with summary and test evidence.

## Acceptance

- [ ] All 17 routes load over HTTP with no blocking console error.
- [x] No accidental KLC/Vina One claim or temporary catalogue artifact is staged.
- [ ] Concept 17 passes responsive/accessibility/reduced-motion smoke checks.
- [ ] Code reviewer has no unresolved high-severity finding.
- [ ] New PR URL exists, targets `main`, and lists verification evidence.

## Evidence captured

- Static link checker: 18 HTML files pass.
- JavaScript syntax check: pass.
- `git diff --check`: pass; line-ending warnings only.
- Root picker: 17 cards/routes present.
- Concept 17 desktop smoke: renders; ZM blocks gauge/width and requests supplier confirmation; quote action creates local draft only and sends no data.
- Repository search: no user-facing KLC residue; legacy `assets/klc3d/` path intentionally retained.
- Temporary PDF extraction/render directory absent from worktree.

## Remaining blockers before PR

- Full HTTP/browser smoke for every Concept 01–17 still lacks independent tester evidence.
- Concept 17 viewport checks at 375/768/1024/1440, keyboard focus, reduced motion, no-WebGL, and overflow not fully evidenced.
- Independent code reviewer unavailable: delegated reviewer stopped because workspace credits exhausted.
- Local QA completed; commit, push, and PR creation finalized in this phase.

## Rollback

Static additive change. Revert PR commits or remove the Concept 17 card/folder independently; legacy `assets/klc3d/` imports remain stable.

## Security

No real submission endpoint. Avoid collecting/transmitting form data. Keep CDN versions pinned and do not introduce arbitrary scripts.
