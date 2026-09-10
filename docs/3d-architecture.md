# 3D concept architecture

How concepts 09–12 are built, and where the line falls between shared code and a concept's own
work. Read this before adding or editing a 3D concept.

## Origin

The renderer defaults, the demand-driven render loop, the orbit rig, the named-view capture
contract and the lighting rig values follow the [3dviz-pro-max](https://github.com/viettranx/3dviz-pro-max)
agent skill's Vite + Three.js scaffold and `templates/rigs/`, adapted to this repository's
no-build, one-file-per-page shape. The workflow that skill prescribes — decide the subject and its
proportions before picking a template, tie behaviour to authoritative state, keep display
exaggeration explicit, then run the scene and inspect real frames — is the workflow these four
pages were built with.

What is *not* borrowed: there is no Vite scaffold, no `postprocessing` stack, no kit library and no
Blender step. Every scene here is procedural Three.js geometry authored in its own `scene.js`.

## Shape of a 3D concept

```text
concept-<n>/
  index.html    markup, CSS, the LOOK and VIEWS constants, and the page script that wires controls
  scene.js      createScene(): the subject, its authoritative state, its behaviour and its teardown
assets/klc3d/
  runtime.js    everything that should behave identically on every 3D page
  scene-kit.js  building blocks a concept composes: lighting rigs, materials, labels, geometry
```

The split is the point. `runtime.js` holds only what must not vary between pages — get it wrong
once and every concept is wrong. `scene.js` holds everything that makes one concept that concept.
If a change would look wrong on another page, it belongs in `scene.js`.

## Loading

Each 3D page declares an import map and pins Three.js to an exact version:

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"
  }
}
</script>
```

Keep the version identical across pages: `assets/klc3d/` is shared, so two pages on different
Three.js versions means one of them is running the shared modules against a build they were not
written for. Import maps and ES modules do not work over `file://` — serve over HTTP.

Nothing else is fetched at runtime except the Google Fonts stylesheet each concept already used.
Every texture is drawn into a canvas in JavaScript; there are no image, model or HDR assets.

## `runtime.js`

`start({ canvas, viewport, look, views, createScene, onUnavailable })` builds the renderer and
camera, calls `createScene`, wires the loop and lifecycle, and returns a handle with `setView`,
`reset`, `isPaused`, `setPaused`, `invalidate` and `dispose`, plus `world` — whatever `createScene`
returned.

Deliberate choices that should survive an edit:

- **sRGB output, tone mapping from `LOOK`, pixel ratio capped at 2, PCF soft shadows.** A page that
  wants no shadows sets `look.shadows = false` rather than turning them off per object.
- **Demand-driven loop.** A still scene schedules no animation frame, so the last frame drawn stays
  on screen and a screenshot is the frame you were looking at. Two rules keep "still" from meaning
  "dead", and both are load-bearing: the first frame after idle is charged one frame's worth of
  time rather than `dt = 0` (a zero `dt` makes `update()` answer "nothing moved", the loop parks,
  and the next wake-up is another zero-`dt` frame — frozen forever); and every wake-up source calls
  `invalidate()`. The orbit rig fires it on `start`/`change`/`end`, `setView` fires it, resize and
  visibility fire it. **If you add a control, wire it to `invalidate()`** or it will change the
  scene without drawing a frame.
- **`update(dt)` returns a boolean:** true while anything is still animating. That return value is
  what keeps the loop alive. Returning `true` unconditionally makes the page render forever.
- **Reduced motion starts paused.** `prefersReducedMotion()` seeds the paused flag, and pausing
  passes `dt = 0` into `update`, so a scene never has to check the media query itself. Interactions
  the visitor drives directly (a pointer parallax, a slider) may still respond while paused — see
  concept 12.
- **Tab visibility parks the loop; `pagehide` disposes everything.**
- **Named views and the capture contract.** `VIEWS` maps a Vietnamese view name to
  `{position, target}`; the first entry is home, which `reset()` returns to. The runtime publishes
  exactly two globals, `window.__sceneReady` and `window.__viewer = {views, setView(name)}` — the
  contract `3dviz-pro-max`'s `scripts/capture.py` reads. Do not add more globals. If a concept needs
  a view to mean something specific, wrap `window.__viewer.setView` so a capture gets what a
  visitor gets (concept 10 squares its turntable this way).
- **Orthographic cameras** are supported via `look.camera.kind = 'orthographic'` with a
  `frustumHeight`; the resize handler maintains the frustum instead of the aspect. Concept 11 uses
  it — a technical section belongs in a parallel projection.

## `scene-kit.js`

Composable pieces, not a framework:

- `createSunRig` / `createStudioRig` — directional key/fill/rim, and the three-panel product studio
  with one weak directional for the contact shadow. Change elevation and azimuth before intensity:
  they decide where every shadow points.
- `createMaterialCache` — one `MeshStandardMaterial` per distinct set of values, disposed together.
- `STEEL` — the surface identity of each product line (colour, roughness, metalness), so a material
  switch means something. `STEEL_DENSITY_KG_M3` is the 7850 every weight readout uses.
- `gradientSky` — a 1×256 canvas gradient for `scene.background`; cheap, tinted, never flat black.
- `makeRandom` — mulberry32, so a jittered arrangement is the same on every visit and screenshots
  compare.
- `createLabelLayer` — HTML labels pinned to world points, with an `align` so a callout to the left
  of an object ends at the anchor instead of covering it. Real DOM text stays selectable and
  readable by a screen reader, which an in-canvas sprite is not.
- `coilStripGeometry` — an Archimedean-spiral strip surface: the real shape a coil is wound from.

## Gotchas worth knowing

- **High `metalness` with no environment map renders black.** A `MeshStandardMaterial` at
  metalness 0.95 has almost no diffuse term, so no amount of light will make it read as steel.
  Every scene with metal adds a `RoomEnvironment` through `PMREMGenerator` and tunes
  `scene.environmentIntensity`. This was the first bug found on concept 09.
- **A coloured directional light colours the whole floor.** Concept 09's brand green is machine
  paint and a mark on the strip, not a green rim light, for exactly this reason.
- **A named view and a turntable fight each other.** If the subject rotates, a fixed
  `{position, target}` only frames the right face for the instant it was authored. Either stop and
  square the rotation when a view is taken, or do not rotate.
- **Real thinness is invisible.** Sheet products are millimetres thick next to metres of plan size.
  Pick one answer and say so on the page: move the camera in (concept 10) or scale the thickness
  axis with the factor on screen (concepts 09, 11).
- **`dt` is capped at 50 ms.** On a slow or software renderer a 0.8 s view tween takes several real
  seconds. That is the intended guard, not a bug — but it matters when scripting screenshots.

## Verifying a change

There are no unit tests; a 3D page is verified by looking at it. Serve the site, then for each page
you touched:

1. Open it and confirm the scene appears, not a blank canvas.
2. Check the browser console is clean.
3. Step through every named view and check each one frames what its label promises.
4. Move every control and confirm the geometry *and* the readouts both change.
5. Confirm motion actually happens, and that the pause control stops it.
6. Disable WebGL (or check the fallback branch) and confirm the page is still useful without it.
7. Check the page at ~400 px wide: the stage should shrink, controls should wrap, nothing should
   scroll sideways.

`window.__sceneReady` and `window.__viewer` exist so this can be scripted with a headless browser,
including `3dviz-pro-max`'s `scripts/capture.py`. Never describe a frame you have not looked at.
