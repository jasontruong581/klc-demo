---
title: "K&C rebrand, catalogue normalization, and Concept 17"
description: "Rebrand 16 concepts, normalize product content, add the final 14+10 hybrid, document the comparison, and ship a reviewed PR."
status: completed
priority: P1
effort: 13h
branch: codex/kc-brand-concept-17
tags: [feature, frontend, docs, threejs]
created: 2026-09-15
---

# K&C rebrand and Concept 17

## Outcome

One reviewable PR: all 16 concepts display K&C; 13–16 carry accurate six-family catalogue content; Concept 17 combines Concept 14 trust/logistics with Concept 10 quote configuration; decision report and project docs are current.

## Guardrails

- PDF is reference data only. Do not copy the reference publisher's identity, capacity, factory claims, certifications, warranty, or guarantees.
- Preserve 01–12 layouts and comparison purpose; brand copy only.
- Keep `assets/klc3d/` path to avoid needless import churn. Rename only user-facing strings.
- Product figures are reference capability, qualified by supplier CO/CQ and lot availability.
- ZM gets no invented dimensions: mark available/on request after supplier confirmation.
- Static architecture remains: no build system, backend, analytics, or new framework.

## Phases

| # | Phase | Status | Effort | Dependency | Detail |
|---|---|---|---:|---|---|
| 1 | K&C brand foundation + concepts 01–12 | Complete | 2h | None | [Phase 01](./phase-01-brand-foundation.md) |
| 2 | Catalogue normalization in concepts 13–16 | Complete | 3h | Logo contract from 1 | [Phase 02](./phase-02-catalogue-normalization.md) |
| 3 | Build Concept 17 | Complete | 4h | Logo contract from 1 | [Phase 03](./phase-03-concept-17.md) |
| 4 | Comparison report + docs | Complete | 2h | Content contracts from 2–3 | [Phase 04](./phase-04-report-and-docs.md) |
| 5 | Verification, review, PR | Completed | 2h | 1–4 | [Phase 05](./phase-05-verify-and-pr.md) |

## Parallel execution and ownership

| Owner | Exclusive files | Can run |
|---|---|---|
| Brand | `assets/brand/kc-steel-mark.svg`, root `index.html`, `concept-1`–`concept-12` HTML/scene files, user-facing strings in shared JS | First; publish logo interface early |
| Catalogue | `concept-13`–`concept-16` HTML/scene files | Parallel after logo path fixed |
| Concept 17 | `concept-17/index.html`, `concept-17/scene.js` | Parallel after logo path fixed |
| Docs | `README.md`, `docs/concepts.md`, `docs/bao-cao-danh-gia-16-concept.md`, plan status files | After content contracts stabilize |
| QA/review/git | Read-only validation; source fixes return to original owner | Final sequential gate |

Conflict prevention: one phase owns each source file. Root picker includes the Concept 17 card in Phase 1. Test/review findings are routed back to the file owner; no broad formatting rewrites.

## Dependency graph

```text
Phase 1 logo contract ─┬─> Phase 2 catalogue 13–16 ─┐
                       └─> Phase 3 Concept 17 ───────┼─> Phase 4 docs ─> Phase 5 QA/PR
Phase 1 concepts 1–12/root ──────────────────────────┘
```

## Definition of done

- No user-facing `KLC` remains across root and Concepts 01–17; deliberate legacy path names excluded.
- Original K&C SVG is legible at small size and used consistently where image logos appear.
- Concepts 13–17 expose PO, CRC, GI, GL, ZM, PPGI/PPGL with corrected matrices and disclosure.
- Concept 17 remains useful without WebGL and on 375 px screens; reduced-motion honored.
- Report scores all 16 concepts and explains why 14 + 10 is the final direction.
- Link/static checks, browser smoke tests, code review pass; branch pushed and new PR targets `main`.

## Unresolved questions

None blocking. Exact K&C legal/contact data is preserved from current site unless the repository lacks a verified value; do not invent it.
