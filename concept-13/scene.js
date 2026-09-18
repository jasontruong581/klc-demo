// Mẫu 13 — "Sàn giao dịch thép": a holographic steel coil floating above a glowing pedestal
// in a dark HUD space — wireframe ground grid, a counter-rotating data ring with tick marks.
//
// Authoritative state: the selected product line (po | crc | gi | gl | ppgi — the five distributed
// flat-steel lines) and the coil weight target in tonnes. Geometry is derived, never typed in: mass = π(R² − r²)·w·ρ solved for R gives the coil
// outer radius, and every readout on the page comes from the same annulus (see deriveCoil).
// The drawn winding is exaggerated: DRAWN turns stand in for the hundreds of real wraps a strip
// gauge implies, and the page states this next to the model.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createMaterialCache, coilStripGeometry, gradientSky, STEEL, STEEL_DENSITY_KG_M3
} from '../assets/klc3d/scene-kit.js';

/** Real coil proportions in metres: bore Ø508 mm, width 1200 mm. OD is derived from mass. */
export const COIL = { boreRadius: 0.254, width: 1.2, drawnTurns: 14 };

/** Catalogue order of the five distributed lines — the page builds its switches from this. */
export const LINE_ORDER = ['po', 'crc', 'gi', 'gl', 'ppgi'];

/** Representative strip gauge per product line (mm) — stated next to the length readout. */
export const GAUGE_MM = { po: 3.0, crc: 1.2, gi: 0.5, gl: 0.45, ppgi: 0.45 };



/**
 * Surface identity of the five lines. scene-kit's STEEL only knows crc/hrc/gl, so the three
 * newcomers are concept-owned art direction: PO is dark oiled hot-rolled strip, GI a bright
 * spangled zinc coat, PPGI/PPGL an organic paint film (barely metallic) in a deep moss green
 * from the brand palette. CRC and GL reuse the shared presets unchanged.
 */
export const SURFACES = {
  po: { color: '#565d63', roughness: 0.5, metalness: 0.75 },
  crc: STEEL.crc,
  gi: { color: '#d9e0e3', roughness: 0.26, metalness: 0.9 },
  gl: STEEL.gl,
  ppgi: { color: '#2e5c40', roughness: 0.55, metalness: 0.15 }
};

/** Holographic emissive tint per product line. Intensity is tuned per surface: PO's dark oiled
 *  strip needs the gold to stay legible, GI's bright zinc and PPGI's paint film need very little. */
export const TINT = {
  po: { color: '#f2c33d', intensity: 0.1 },
  crc: { color: '#8fd8ff', intensity: 0.2 },
  gi: { color: '#dfe8e3', intensity: 0.12 },
  gl: { color: '#2fe08a', intensity: 0.24 },
  ppgi: { color: '#2fe08a', intensity: 0.08 }
};

/**
 * Single source of truth for every number the page shows.
 * mass = π(R² − r²) · w · ρ  →  R = √(r² + m / (π·w·ρ))
 * strip length ≈ π(R² − r²) / t at the stated gauge t; real wrap count ≈ (R − r) / t.
 */
export function deriveCoil(productKey, tonnes) {
  const kg = tonnes * 1000;
  const r = COIL.boreRadius;
  const annulus = kg / (Math.PI * COIL.width * STEEL_DENSITY_KG_M3); // R² − r² in m²
  const R = Math.sqrt(r * r + annulus);
  const gauge = GAUGE_MM[productKey] / 1000;
  return {
    kg,
    outerRadiusM: R,
    odMm: R * 2000,
    lengthM: (Math.PI * annulus) / gauge,
    realWraps: (R - r) / gauge
  };
}

const COIL_CENTER_Y = 1.5;
const TICK_COUNT = 48;

export function createScene({ renderer, scene, look, invalidate }) {
  const materials = createMaterialCache();
  const geometries = [];
  const track = (geometry) => { geometries.push(geometry); return geometry; };

  // Near-black green-tinted void with fog so the wireframe grid dissolves into the dark.
  const sky = gradientSky(look.sky.zenith, look.sky.horizon);
  scene.background = sky;
  scene.fog = new THREE.FogExp2(look.sky.fog, 0.052);

  // Metal is invisible without something to reflect (docs/3d-architecture.md gotcha #1).
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = look.environmentIntensity ?? 0.5;

  // One cool key shapes the steel; one emerald rim is the terminal's own glow; faint hemi fill.
  const key = new THREE.DirectionalLight('#d7ecff', 1.7);
  key.position.set(4.5, 6.5, 3.5);
  const rim = new THREE.DirectionalLight('#2fd47f', 1.3);
  rim.position.set(-5, 2.2, -4.2);
  const fill = new THREE.HemisphereLight('#28503c', '#020c07', 0.5);
  scene.add(key, rim, fill);

  // Wireframe ground grid — the trading-floor motif.
  const grid = new THREE.GridHelper(30, 60, '#1a8a4c', '#0b3d23');
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  scene.add(grid);

  // Pedestal: dark disc, a pulsing emerald halo ring and a faint glow disc on top.
  const pedestal = new THREE.Mesh(
    track(new THREE.CylinderGeometry(1.5, 1.62, 0.12, 64)),
    materials.get({ color: '#0a221a', roughness: 0.55, metalness: 0.35 }));
  pedestal.position.y = 0.06;
  const haloMaterial = new THREE.MeshStandardMaterial({
    color: '#17843f', emissive: '#2fe08a', emissiveIntensity: 1.8, roughness: 0.4, metalness: 0.2
  });
  const halo = new THREE.Mesh(track(new THREE.TorusGeometry(1.34, 0.02, 12, 128)), haloMaterial);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 0.13;
  const glowDisc = new THREE.Mesh(
    track(new THREE.CircleGeometry(1.28, 64)),
    materials.get({
      color: '#0b5c2a', emissive: '#17843f', emissiveIntensity: 0.7,
      transparent: true, opacity: 0.4
    }));
  glowDisc.rotation.x = -Math.PI / 2;
  glowDisc.position.y = 0.125;
  scene.add(pedestal, halo, glowDisc);

  // The coil floats above the pedestal, axis horizontal like a coil presented on a cradle.
  // coilStripGeometry winds around +Y. Tilt and spin live on separate nested groups: animating
  // rotation.y on the same object that holds rotation.z would precess the axis around world Y
  // (Euler XYZ), and a wandering axis breaks every named view.
  const coilGroup = new THREE.Group();
  coilGroup.position.y = COIL_CENTER_Y;
  scene.add(coilGroup);
  const coilTilt = new THREE.Group();
  coilTilt.rotation.z = Math.PI / 2; // winding axis now along world X
  coilGroup.add(coilTilt);
  const coilSpin = new THREE.Group(); // local Y = winding axis: this one animates
  coilTilt.add(coilSpin);

  const coilMaterial = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide });
  const ribbon = new THREE.Mesh(undefined, coilMaterial);
  coilSpin.add(ribbon);

  // Mandrel bore so the spiral has a centre instead of a hole.
  const bore = new THREE.Mesh(
    track(new THREE.CylinderGeometry(COIL.boreRadius * 0.96, COIL.boreRadius * 0.96, COIL.width + 0.01, 48, 1, true)),
    materials.get({ color: '#3a4a42', roughness: 0.5, metalness: 0.9, side: THREE.DoubleSide }));
  coilSpin.add(bore);

  // Data ring: a thin torus plus tick marks, built at unit radius and scaled with the coil,
  // slowly counter-rotating against the coil's spin.
  const dataRing = new THREE.Group();
  dataRing.position.y = COIL_CENTER_Y;
  scene.add(dataRing);
  const ringMaterial = materials.get({
    color: '#2fe08a', emissive: '#2fe08a', emissiveIntensity: 1.4,
    roughness: 0.4, metalness: 0.2, transparent: true, opacity: 0.75
  });
  const torus = new THREE.Mesh(track(new THREE.TorusGeometry(1, 0.006, 8, 160)), ringMaterial);
  torus.rotation.x = Math.PI / 2;
  dataRing.add(torus);
  const tickGeometry = track(new THREE.BoxGeometry(0.008, 0.012, 0.05));
  for (let i = 0; i < TICK_COUNT; i++) {
    const tick = new THREE.Mesh(tickGeometry, ringMaterial);
    const angle = (i / TICK_COUNT) * Math.PI * 2;
    tick.position.set(Math.cos(angle), 0, Math.sin(angle));
    tick.rotation.y = -angle;
    if (i % 8 === 0) tick.scale.z = 2.4;
    dataRing.add(tick);
  }

  // ---- Authoritative state → geometry and material ----
  const state = { product: null, tonnes: null };

  function rebuildCoil(outerRadiusM) {
    ribbon.geometry?.dispose();
    ribbon.geometry = coilStripGeometry({
      innerRadius: COIL.boreRadius, outerRadius: outerRadiusM,
      width: COIL.width, turns: COIL.drawnTurns, segmentsPerTurn: 96
    });
    dataRing.scale.setScalar(outerRadiusM + 0.38);
  }

  function applyProduct(productKey) {
    const surface = SURFACES[productKey];
    coilMaterial.color.set(surface.color);
    coilMaterial.roughness = surface.roughness;
    coilMaterial.metalness = surface.metalness;
    coilMaterial.emissive.set(TINT[productKey].color);
    coilMaterial.emissiveIntensity = TINT[productKey].intensity;
  }

  let time = 0;
  return {
    /**
     * The page's single entry point: pass the whole state, the scene derives the rest.
     * @param {{product: 'po'|'crc'|'gi'|'gl'|'ppgi', tonnes: number}} next
     */
    setState(next) {
      if (next.product !== state.product) { state.product = next.product; applyProduct(state.product); }
      if (next.tonnes !== state.tonnes) {
        state.tonnes = next.tonnes;
        rebuildCoil(deriveCoil(state.product, state.tonnes).outerRadiusM);
      }
      invalidate();
    },
    /** @returns {boolean} true while ambient motion is running (dt = 0 while paused). */
    update(dt) {
      if (dt <= 0) return false;
      time += dt;
      coilSpin.rotation.y += dt * 0.28;
      dataRing.rotation.y -= dt * 0.14;
      coilGroup.position.y = COIL_CENTER_Y + Math.sin(time * 0.7) * 0.05;
      dataRing.position.y = coilGroup.position.y;
      haloMaterial.emissiveIntensity = 1.8 + Math.sin(time * 2.1) * 0.5;
      return true;
    },
    dispose() {
      for (const light of [key, rim, fill]) { light.parent?.remove(light); light.dispose?.(); }
      for (const geometry of geometries) geometry.dispose();
      ribbon.geometry?.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      coilMaterial.dispose();
      haloMaterial.dispose();
      materials.dispose();
      sky.dispose();
      scene.environment = null;
      scene.background = null;
      scene.fog = null;
      environment.dispose();
      pmrem.dispose();
    }
  };
}
