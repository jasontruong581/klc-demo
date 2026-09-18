# K&C Steel — website design concepts

A static demo site that presents 17 complete website design directions for **K&C Steel**, a
Vietnamese B2B flat-steel supplier. The root page is a picker; each concept is a full,
self-contained landing page the client can click through and compare.

All content is in Vietnamese. Company figures and prices are **placeholder demo data**. Concepts
13–17 use the proposed K&C identity and a catalogue structure intended for supplier-confirmed
B2B enquiries.

## Concepts

| # | Concept | Direction |
| --- | --- | --- |
| 01 | [Industrial Dark](concept-1/) | Dark foundry palette, oversized display type, high visual impact |
| 02 | [Corporate Light](concept-2/) | Bright and clean, quote form above the fold, B2B conversion focus |
| 03 | [Technical Blueprint](concept-3/) | CAD drawing language: coordinate grid, annotated section, spec sheet |
| 04 | [Modern Green](concept-4/) | Deep green gradient, metallic type, frosted-glass cards, marketing-led |
| 05 | [Industrial Steel Studio](concept-5/) | 01 as an immersive dark studio around a procedural PBR coil |
| 06 | [Corporate Product Stage](concept-6/) | 02 as a bright product stage for the three lines |
| 07 | [Exploded Blueprint 3D](concept-7/) | 03 with the material layers separated in 3D space |
| 08 | [Metal Ribbon Experience](concept-8/) | 04 as an immersive metal-ribbon sculpture |
| 09 | [Industrial Dark 3D](concept-9/) | 01 with a live WebGL decoiler line |
| 10 | [Corporate Light 3D](concept-10/) | 02 with the quote form driving a true-scale bundle |
| 11 | [Technical Blueprint 3D](concept-11/) | 03 with an explodable orthographic section |
| 12 | [Modern Green 3D](concept-12/) | 04 with a full-bleed WebGL hero |
| 13 | [Sàn giao dịch thép](concept-13/) | New direction: futuristic HUD trading terminal, holographic coil configurator |
| 14 | [Kho hàng thông minh](concept-14/) | New direction: bright logistics dashboard, warehouse bay with geometry-derived inventory |
| 15 | [Chuỗi cung ứng liền mạch](concept-15/) | New direction: low-poly supply-route diorama, mill → K&C warehouse → site |
| 16 | [Kiến trúc sóng tôn](concept-16/) | New direction: architectural editorial, parametric roofing-profile studio |
| 17 | [K&C Steel Supply Desk](concept-17/) | Final direction: Concept 14 supply trust + Concept 10 quote configurator, full six-line spec sheet |

Concepts 05–08 and 09–12 are 3D takes on 01–04 in the same order. Concepts 13–16 are the **K&C
Brand Edition**: four independent directions built from the proposed company identity. They carry
the six-line distribution catalogue (PO, CRC, GI, GL, ZM, PPGI/PPGL) with packing, QC and
ordering sections; all capability figures require confirmation by CO/CQ and lot availability.
K&C does not publish prices: every page routes pricing to the sales line.
Concept 17 combines the most suitable directions for the target B2B audience. See
[docs/concepts.md](docs/concepts.md) for what each one is trying to prove, and
[docs/3d-architecture.md](docs/3d-architecture.md) for how the 3D pages are built.

## Layout

```text
index.html            the picker page: every concept as a card
concept-<n>/          one concept per folder
  index.html            the whole page — markup, CSS and page script inline
  scene.js              3D concepts only: the subject, its state and its behaviour
assets/brand/         the proposed K&C logo mark
assets/img/           legacy image assets retained for reference
assets/klc3d/         shared 3D modules (concepts 09+ only)
  runtime.js            renderer, render loop, orbit rig, named-view contract, lifecycle
  scene-kit.js          lighting rigs, material cache, steel surfaces, labels, coil geometry
docs/                 concept catalogue and 3D architecture notes
```

Links between pages are absolute (`/concept-1/`), so the site must be served from a domain root,
not from a subdirectory.

## Running it locally

The flat concepts (01–04) open straight from disk. The 3D concepts use ES modules and an import
map, which browsers refuse over `file://`, so serve the folder over HTTP:

```sh
python -m http.server 4181 --bind 127.0.0.1
# then open http://127.0.0.1:4181/
```

There is no build step, no package manifest and no dependency install. Three.js is loaded from a
CDN at runtime through the import map in each 3D page, pinned to an exact version.

## Conventions

- **One folder per concept, one page per folder.** A flat concept is a single HTML file with its
  CSS and content inline. Keep it that way: each concept has to be readable and movable on its own.
- **Each concept owns its own visual system.** Fonts, palette and component styles are declared in
  that page's `<style>` block and are deliberately not shared between concepts — a concept is a
  proposal, not a component library.
- **Vietnamese copy, `lang="vi"`,** and Vietnamese number formatting (`.` thousands separator,
  `,` decimal separator) in body text and in any figure rendered by script.
- **Demo data stays obviously demo.** Prices and capability figures are marked as reference data;
  final orders require supplier confirmation, CO/CQ and availability for the selected lot.
- **Only the 3D pages share code**, and only through `assets/klc3d/`. See the architecture notes
  for the boundary between the shared runtime and a concept's own `scene.js`.

## Adding a concept

1. Pick the next free number (18 onwards).
2. Create `concept-<n>/index.html`. For a flat concept, copy the nearest existing one and replace
   the palette, type and layout. For a 3D concept, follow
   [docs/3d-architecture.md](docs/3d-architecture.md).
3. Add a card to `index.html`: a thumbnail class (`.t<n>`) in the stylesheet plus an entry in the
   matching group grid.
4. Add a row to the table above and an entry in [docs/concepts.md](docs/concepts.md).
