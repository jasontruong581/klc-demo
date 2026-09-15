# Phase 03 — Build Concept 17: K&C Steel Supply Desk

## Overview

- Priority: P1
- Status: Complete
- Effort: 4h
- Goal: final executive B2B direction combining Concept 14's supply trust with Concept 10's live quote configurator.

## Files

- Create exclusively: `concept-17/index.html`, `concept-17/scene.js`.
- Reuse: `assets/brand/kc-steel-mark.svg`, `assets/klc3d/runtime.js`, `assets/klc3d/scene-kit.js`.

## Experience contract

- Audience: Vietnamese B2B decision-makers, age 35–55, companies with assets over VND 30B.
- Style: bright executive industrial; paper `#F5F7F6`, ink `#14231A`, K&C green `#0B5C2A`, restrained brass `#B58A2A`; Manrope + IBM Plex Mono.
- Headline: “Đúng quy cách. Rõ nguồn hàng. Chủ động tiến độ.”
- Journey: trust/value → warehouse/product 3D → six-family specification → theoretical calculation → company/contact/delivery → transparent demo quote outcome.

## Architecture

One authoritative JS state drives product, gauge, dimensions, quantity, computed mass, UI readouts, and scene geometry/material. Use steel density 7850 kg/m³ only for valid theoretical calculations and label estimates clearly. Demand-driven rendering, DPR cap, `ResizeObserver`, `IntersectionObserver`, WebGL fallback, reduced motion.

## Steps

1. Build semantic, keyboard-accessible page with 44 px controls, 3 px focus, clear labels/errors.
2. Implement responsive layout: desktop split stage/configurator; 375 px text → scene → form; no horizontal overflow; sticky mobile quote CTA.
3. Create restrained daylight scene: warehouse bays plus selected coil/bundle. “Kho hàng/Sản phẩm” view switch; no default auto-spin.
4. Implement six-family selectors using Phase 02 data contract; invalid combinations disabled or corrected explicitly.
5. Add theoretical mass calculation and fields: company, contact, phone, email, province, delivery date/note.
6. Since no backend exists, make submit behavior explicitly demo—never imply a quote was delivered.
7. Provide useful HTML fallback with the same core catalogue/quote path when WebGL fails.

## Acceptance

- [x] Concept 17 clearly reflects both Concepts 14 and 10 without copying their markup wholesale.
- [x] UI, calculation, and 3D geometry share the same product/gauge/width state.
- [x] Six families and supplier/CO-CQ disclosure present.
- [ ] Keyboard, reduced-motion, no-WebGL, and 375/768/1024/1440 layouts pass final browser QA (Phase 05).
- [x] No invented backend success, inventory, pricing, or compliance claim.

## Risks

- 3D can obscure conversion. Keep it one bounded proof element, not a full-page gimmick.
- Formula misuse across coil/sheet products. Calculate only supported shapes; explain assumptions.
- CDN outage/WebGL loss. Keep static content and form usable.
