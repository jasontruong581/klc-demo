# Phase 02 — Catalogue normalization in Concepts 13–16

## Overview

- Priority: P1
- Status: Complete
- Effort: 3h
- Goal: brand 13–16 as K&C and align product claims to the supplied manufacturer catalogue without inheriting manufacturer-only claims.

## Files

- Modify exclusively: `concept-13/index.html`, `concept-13/scene.js`, …, `concept-16/index.html`, `concept-16/scene.js`.

## Data contract

- Six families: PO, CRC, GI, GL, ZM, PPGI/PPGL.
- CRC: 0.18–0.30 mm only to 1250 mm; 0.30–2.50 mm to 1550 mm.
- GI: 0.16–0.40/≤1300; 0.40–2.50/≤1550; 2.50–3.00/≤1250 mm.
- GL: 0.16–0.40/≤1300; 0.40–2.00/≤1550 mm.
- PO: 1.4–4.5 mm, 850–1550 mm; catalogue coil ID 610 mm. Qualify variants by lot.
- PPGI/PPGL: BMT 0.16–1.0 mm, 850–1300 mm; ASTM A755, JIS G3312/G3322, EN10169, AS/NZS2728; up to four coats and 20–50 μm total DFT.
- ZM: supplier-confirmed/on request only; no fabricated dimension matrix.
- Disclosure: reference specifications; final acceptance follows CO/CQ and stock lot.

## Steps

1. Rebrand logo, title, visible copy, labels, and accessibility text.
2. Add ZM to product navigation/cards/scene state with a safe descriptive surface.
3. Replace misleading combined min/max ranges with capability matrices above.
4. Add high-value standards, finishes, coating classes/colors where the layout supports them.
5. Remove or qualify manufacturer-specific non-aging warranty, plant capacity, equipment, certification, and guarantee claims.
6. Add practical storage/QC/label guidance without claiming K&C manufacturing ownership.
7. Keep formulas, selectors, scene state, cards, and displayed figures synchronized.

## Acceptance

- [x] All four concepts show six families and K&C identity.
- [x] CRC/GI/GL capability matrices cannot imply unsupported width at extreme gauges.
- [x] No third-party brand/factory/capacity/warranty claim is presented as K&C's.
- [x] ZM explicitly requires supplier confirmation.
- [x] Product controls and 3D scenes remain functional at implementation handoff; final browser QA remains in Phase 05.

Implementation note: ZM appears as a sixth catalogue family in Concepts 13–16, but remains catalogue-only in their legacy 3D selectors. The source catalogue provides no dimensional matrix, so modelling it as a selectable stock item would imply unsupported availability. Concept 17 exposes ZM as a disabled, supplier-confirmation state.

## Risks

- Repeated inline content can drift. Use the exact data contract above in every page, adapted only in presentation.
- Scene code may assume five products. Update arrays, index bounds, materials, labels, and controls together.
