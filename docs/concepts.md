# Concept catalogue

What each concept is proposing, so a review can argue about the direction instead of the details.
Concepts 01–12 retain their original three-line placeholder catalogue for visual comparison.
Concepts 13–17 use the expanded six-line K&C catalogue and add supplier-confirmation disclosures.

Shared content spine, in the order it appears on every page:

1. Hero with the positioning line and the primary quote CTA.
2. A product catalogue appropriate to the concept: three placeholder lines in 01–12; PO, CRC,
   GI, GL, ZM and PPGI/PPGL in 13–17.
3. The Tôn Tân Phước Khanh partnership as the sourcing proof.
4. Capability figures or an ordering process.
5. Contact footer.

## Flat concepts

### 01 — Industrial Dark ([concept-1/](../concept-1/))

Oswald display type at up to 118 px over a foundry-dark palette, one hollow outlined line, a
rotating coil diagram in SVG and a scrolling spec ticker. Products are a three-up zero-gutter grid
that reads like a steel plate divided by weld lines. Sells scale and capability.

### 02 — Corporate Light ([concept-2/](../concept-2/))

Light, high-legibility B2B layout: utility topbar with hotline and a price date, a quote card
pinned beside the hero, product cards with a striped visual standing in for surface finish, and a
four-up "why us" band. The most conversion-shaped of the four.

### 03 — Technical Blueprint ([concept-3/](../concept-3/))

The whole page is a drawing sheet: a 32 px coordinate grid behind everything, 2 px ink borders,
IBM Plex Mono labels, an annotated SVG cross-section of galvalume with dimension lines, a spec
sheet as a bordered table, and a title block in the footer. Aimed at buyers who read drawings.

### 04 — Modern Green ([concept-4/](../concept-4/))

Deep green radial gradients, a floating glass navbar, a metallic gradient headline and
frosted-glass cards. Centred hero, marketing-led rather than spec-led.

## 3D concepts (05–17)

Concepts 05–12 reinterpret the first four visual systems with WebGL; Concepts 13–17 are independent
3D directions. Their common rule is that 3D must explain product, stock, specification or supply —
not exist as decoration. Where a page presents numeric geometry, its readout is derived from the
same state as the scene. Every page keeps useful HTML content when WebGL is unavailable.

### 09 — Industrial Dark 3D ([concept-9/](../concept-9/))

**Subject:** a mill coil on a decoiler mandrel paying strip out over pinch rolls onto a run-out
table, in a dark hall lit by overhead bars.

**Authoritative state:** line speed (m/min) and strip gauge. Coil rotation is derived as ω = v/R,
strip surface travel matches the payout exactly, coil mass is π(R²−r²)·w·7850, and the strip
length held in the coil is π(R²−r²)/t. Change the gauge and the length readout changes because the
arithmetic changes, not because a number was swapped.

**Real dimensions:** coil ID 508 mm, OD 1500 mm, width 1250 mm — a standard mill coil at 15.4 t.

**Stated exaggerations:** strip thickness is drawn at 6× so a 1.2 mm edge is visible at the camera
distance, and the end-face spiral draws 46 coarse wraps rather than the ~400 that 1.2 mm strip
really makes. Both are printed on the page.

**Controls:** gauge (0.5 / 1.2 / 2.0 mm), line speed (10–90 m/min), run/stop, three named views.

### 10 — Corporate Light 3D ([concept-10/](../concept-10/))

**Subject:** a bundle of cut sheets on a display turntable in a bright product studio.

**Authoritative state:** the quote form. Product line, gauge, width, length and sheet count rebuild
the bundle at true scale; the cut edge carries one lamination line per ordered sheet, so the drawn
edge always shows the count that was ordered. Sheet mass, total mass and bundle height come from
`quoteFor()` in `scene.js`, which the form and the scene both call — the figure in the form and the
block on screen cannot disagree.

**No exaggeration.** A 1.2 mm sheet is drawn 1.2 mm thin. That is why the "Cạnh bó" view exists: it
moves the camera down to the cut edge instead of inflating the geometry, and it re-aims itself as
the ordered bundle changes height and width. Taking a named view stops and squares the turntable,
so the framing means what it says.

**Controls:** product, gauge, width, length, sheet count, turntable stop/start, three named views.

### 11 — Technical Blueprint 3D ([concept-11/](../concept-11/))

**Subject:** an orthographic, explodable section through a galvalume sheet — top coating, cold-rolled
steel base, bottom coating — with a section hatch on the core and a callout per layer.

**Authoritative state:** total coated thickness (TCT) and the AZ coating class, which is what a
buyer actually orders. Every layer thickness is derived:

```text
coating mass per side      = AZ class / 2            [g/m², AZ is a both-faces designation]
coating thickness per side = mass per side / 3750 kg/m³   [55% Al – 43.4% Zn – 1.6% Si]
base steel                 = TCT − 2 × coating thickness
sheet mass                 = base × 7850 kg/m³ + coating mass
```

AZ150 lands at 20 µm per side, AZ100 at 13.3 µm, AZ50 at 6.7 µm — the figures the mill data sheets
quote.

**Stated exaggeration:** the thickness axis only. The plan size of the coupon (240 × 160 mm) is true
scale; the thickness scale is a control with ×1 (true scale) included, and the current factor is
stamped on the drawing. Closed up, the per-layer callouts hide and only the total dimension shows,
because a shut section is one edge with one dimension.

**Controls:** TCT, AZ class, explode 0–100%, thickness exaggeration, rotation stop/start, three
named views (perspective, section elevation, plan).

### 12 — Modern Green 3D ([concept-12/](../concept-12/))

**Subject:** a full-bleed marketing hero. A steel strip unwinding as one continuous spiral surface,
with cut plates drifting around it and a green rim for the brand.

**Authoritative state:** material identity only. Switching product line switches the hero's colour,
roughness and metalness to that line's surface, because cold-rolled, hot-rolled and galvalume
genuinely do not reflect light the same way; the note under the switch says what changed and why.
The product cards further down switch it too. The scene asserts no dimension — the numbers on this
page live in the copy and the spec chips.

**Motion:** slow hero rotation plus pointer parallax and a small scroll lift. Parallax and scroll
stay live when ambient motion is paused, because they are visitor-driven rather than ambient.

**Controls:** three surface switches, three named views, motion stop/start.

## K&C Brand Edition (13–16)

Four independent directions built from the proposed K&C identity, green palette and expanded
catalogue — deliberately **not** derived from concepts 01–12. Unlike 01–12, these four carry six
flat-steel lines (PO, CRC, GI, GL, ZM, PPGI/PPGL) with capability matrices, packing, trader QC and
ordering sections. Figures are references only and require confirmation by CO/CQ and current lot
availability. Each follows the same 3D rules: an authoritative state, readouts computed from the
geometry, named Vietnamese views, a no-WebGL fallback that keeps the page useful.

### 13 — Sàn giao dịch thép ([concept-13/](../concept-13/))

Futuristic trading-terminal: near-black green void, neon-emerald glassmorphism HUD, scanline
overlay, Space Grotesk + JetBrains Mono.

**Subject:** a holographic coil floating over a pulsing pedestal disc on a gridded trading floor,
with a counter-rotating data ring.

**Authoritative state:** product line and coil weight target (5–20 t). The radius is solved from
the mass — R = √(r² + m/(π·w·ρ)) — so the slider physically grows the coil; OD, strip length
π(R²−r²)/t, real wrap count and demo lot value are all derived from the same formula. Drawn wraps
(14) vs real wraps (hundreds) is stated on the stage.

**Controls:** five modeled product switches (PO/CRC/GI/GL/PPGI), weight slider, run/pause and views
"Toàn cảnh", "Mặt cuộn", "Sàn giao dịch". ZM remains catalogue-only until geometry inputs are
confirmed by a supplier.

### 14 — Kho hàng thông minh ([concept-14/](../concept-14/))

Bright logistics dashboard: white/light-gray cards, deep green primary, gold accents, Manrope +
IBM Plex Mono.

**Subject:** one warehouse bay — two green racks with coils in cradles, sheet-stack pallets, an
AGV cart drifting the aisle as ambient motion.

**Authoritative state:** product line and stock level (4–16 coils). Inventory readouts are summed
over the drawn coils — tồn kho Σ π(R²−r²)·w·7850, mét dài Σ π(R²−r²)/t at a stated gauge, coil
count = mesh count — so the slider and the panel cannot disagree.

**Controls:** five modeled product switches (PO/CRC/GI/GL/PPGI), stock slider, run/pause and views
"Toàn kho", "Dãy kệ", "Cận cuộn". ZM remains catalogue-only pending supplier confirmation.

### 15 — Chuỗi cung ứng liền mạch ([concept-15/](../concept-15/))

Warm-paper corporate: rounded cards, organic shapes, Be Vietnam Pro.

**Subject:** a low-poly island diorama of the supply route — mill → K&C warehouse
→ construction site — with a flatbed truck looping the road.

**Authoritative state:** journey stage and truck progress on the road curve. Leg distances are
sampled from the same CatmullRom curve the truck drives (stated scale 1 m ≈ 2 km) and delivery
minutes derived at 40 km/h. Station buttons swap the story panel, the 3D highlight and the
matching named view together.

**Controls:** three station buttons, truck run/pause, views "Toàn cảnh", "Nhà máy", "Kho K&C",
"Công trình".

### 16 — Kiến trúc sóng tôn ([concept-16/](../concept-16/))

Gallery-editorial: near-white background, emerald ink, hairline rules, Fraunces display serif.

**Subject:** a 1 × 2 m tôn lạnh coupon floating over a plinth, built parametrically from a
cross-section polyline per profile — 5 sóng vuông, 9 sóng tròn, cliplock sóng đứng.

**Authoritative state:** profile and gauge (0,35/0,45/0,50 mm). Cover width, wave height,
developed length and kg/m² are integrated from the actual polyline (developed length ×
gauge × 7850); thickness is drawn ×15 with the factor printed on the stage. The no-WebGL fallback
renders the same polylines as SVG.

**Controls:** three profile switches, three gauge chips, turntable run/pause, views "Phối cảnh",
"Mặt cắt sóng", "Trên mái".

## Final direction

### 17 — K&C Steel Supply Desk ([concept-17/](../concept-17/))

A bright executive-industrial experience combining Concept 14's source, stock, QC and logistics
trust signals with Concept 10's live specification and quote workflow.

**Subject:** one restrained daylight warehouse stage whose selected bay and product sample respond
to the same product state as the catalogue and quote desk. Visitors can switch between warehouse
and product views; ambient auto-spin is off by default.

**Authoritative state:** the selected family, gauge and width drive the visible sample and
theoretical kg/m readout. The calculation uses a flat-strip assumption and is labelled
theoretical. ZM has no dimension matrix: its specification is explicitly supplier-confirmed.

**Controls:** six product families, warehouse/product view, capability-matrix selector, gauge,
width and intended tonnage, plus a demo enquiry form that never claims a real submission without
a backend. The page includes reduced-motion behaviour, keyboard focus, responsive cards and a
no-WebGL content fallback.
