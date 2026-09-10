# Concept catalogue

What each concept is proposing, so a review can argue about the direction instead of the details.
Every page carries the same underlying content — three product lines, the Tân Phước Khanh
partnership, capability figures, a quote path — and differs in how that content is framed.

Shared content spine, in the order it appears on every page:

1. Hero with the positioning line and the primary quote CTA.
2. The three product lines: CRC (cán nguội), HRC (cán nóng), GL (tôn lạnh), each with real
   thickness ranges, widths and grades.
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

## 3D concepts

Each 3D concept takes one flat concept's visual system unchanged and replaces its hero graphic
with a real WebGL scene. The rule they all follow: the scene must be worth rotating. Every one has
a subject with correct proportions, a control that changes the represented state, named views, a
readout computed from the geometry rather than typed in, and a no-WebGL fallback that keeps the
page useful.

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
