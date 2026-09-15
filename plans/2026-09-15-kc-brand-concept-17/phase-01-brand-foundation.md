# Phase 01 — K&C brand foundation and Concepts 01–12

## Overview

- Priority: P1
- Status: Complete
- Effort: 2h
- Goal: create one original K&C mark and replace visible KLC branding without redesigning Concepts 01–12.

## Files

- Create: `assets/brand/kc-steel-mark.svg`.
- Modify: root `index.html`; `concept-1/index.html` through `concept-12/index.html`; existing scene/shared JS only where strings are user-facing.
- Do not rename `assets/klc3d/` or internal APIs solely for branding.

## Steps

1. Design compact SVG: deep green, restrained brass, recognizable K/C or coil motif; readable at favicon/avatar scale.
2. Replace visible `KLC`, `KLC Steel`, titles, metadata, footer, alt/ARIA text, demo emails/domains with K&C equivalents.
3. Add Concept 17 card, route, thumbnail style, and 17-concept count to the root picker.
4. Preserve each concept's DOM/layout and 3D behavior; avoid global search/replace in dependency paths.
5. Search remaining `KLC` occurrences and classify intentional internal path/API names versus defects.

## Acceptance

- [x] SVG renders and has accessible title/label strategy.
- [x] Root and Concepts 01–12 show K&C consistently.
- [x] Root links to all 17 concepts.
- [x] Existing 3D module imports still resolve.
- [x] No layout redesign in Concepts 01–12.

## Risks

- Ampersand escaping: use `K&amp;C` in HTML text/attributes where required.
- Blind rename breaks module URLs: preserve legacy directory and non-visible identifiers.

## Security/performance

Inline/vector logo only; no tracking, remote asset, or added runtime dependency.
