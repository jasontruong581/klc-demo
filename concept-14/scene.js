// Mẫu 14 — Kho hàng thông minh (smart-warehouse hero).
//
// Subject: one bay of a KLC warehouse from a 3/4 view — a floor slab, two steel racks with coils
// resting in V-cradles, two banded sheet-stack pallets, and a small AGV drifting down the aisle
// as the ambient motion. Authoritative state: the selected product line
// (po | crc | gi | gl | ppgi — the five distributed flat-steel lines) and the
// stock level (4–16 coils). Every readout is derived from the drawn geometry:
//   tồn kho (kg)  = Σ π(R² − r²) · w · 7850           over the visible coils
//   mét dài (m)   = Σ π(R² − r²) / t                   at the stated gauge per product line
//   số cuộn       = the number of coil groups actually visible.
//
// Real coil proportions: bore ID 508 mm, OD 1.200–1.500 mm, width 1.000–1.250 mm. Placement
// jitter comes from makeRandom, so every visit draws the same warehouse.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createMaterialCache, createSunRig, gradientSky, makeRandom,
  coilStripGeometry, STEEL, STEEL_DENSITY_KG_M3
} from '../assets/klc3d/scene-kit.js';

export const MAX_COILS = 16;
export const MIN_COILS = 4;
/** Stated strip gauge per product line, in mm — the t in "mét dài = π(R² − r²) / t". */
export const GAUGE_MM = { po: 3.0, crc: 1.2, gi: 0.5, gl: 0.45, ppgi: 0.45 };

/**
 * Surface identity of the five distributed lines. scene-kit's STEEL only knows crc/hrc/gl, so
 * the three newcomers are concept-owned art direction: PO is dark oiled hot-rolled strip, GI a
 * bright spangled zinc coat, PPGI/PPGL an organic paint film (barely metallic) in a deep moss
 * green from the brand palette. CRC and GL reuse the shared presets unchanged.
 */
export const SURFACES = {
  po: { label: 'Thép cán nóng tẩy gỉ (PO)', color: '#565d63', roughness: 0.5, metalness: 0.75 },
  crc: STEEL.crc,
  gi: { label: 'Tôn kẽm (GI)', color: '#d9e0e3', roughness: 0.26, metalness: 0.9 },
  gl: STEEL.gl,
  ppgi: { label: 'Tôn mạ màu (PPGI/PPGL)', color: '#2e5c40', roughness: 0.55, metalness: 0.15 }
};

const BORE = 0.254; // 508 mm ID
const RACK_X = 1.7; // rack centreline distance from the aisle
const LEVEL_Y = [0.34, 1.92]; // top of the beam pair each coil level rests on
const SLOT_PITCH = 1.47;

/**
 * The sixteen coil berths, filled in reading order: level 0 of both racks, then level 1.
 * Dimensions are real coil proportions with deterministic jitter (same arrangement every visit).
 */
export const COIL_SLOTS = (() => {
  const random = makeRandom(140924);
  const slots = [];
  for (const level of [0, 1]) {
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        slots.push({
          radius: 0.6 + random() * 0.15, // OD 1.20–1.50 m
          width: 1.0 + random() * 0.25, // 1.000–1.250 m
          bore: BORE,
          x: side * RACK_X,
          level,
          z: -2.2 + i * SLOT_PITCH + (random() - 0.5) * 0.06,
          seam: random() * Math.PI * 2
        });
      }
    }
  }
  return slots;
})();

/**
 * Pure inventory maths over the first `count` berths — the exact figures the 3D scene reports,
 * so the no-WebGL fallback computes the same numbers from the same slot data.
 */
export function inventoryFor(count, gaugeMm) {
  let massKg = 0, lengthM = 0;
  for (const slot of COIL_SLOTS.slice(0, count)) {
    const crossM2 = Math.PI * (slot.radius ** 2 - slot.bore ** 2);
    massKg += crossM2 * slot.width * STEEL_DENSITY_KG_M3;
    lengthM += crossM2 / (gaugeMm / 1000);
  }
  return { coils: count, massKg, lengthM };
}

export function createScene({ renderer, scene, look, invalidate }) {
  const materials = createMaterialCache();
  const geometries = [];
  const track = (geometry) => { geometries.push(geometry); return geometry; };

  const sky = gradientSky(look.sky.zenith, look.sky.horizon);
  scene.background = sky;
  scene.fog = new THREE.FogExp2(new THREE.Color(look.fog.color), look.fog.density);

  // Bright steel still needs something to reflect: without the environment map every coil at
  // metalness ~0.9 renders near black no matter how strong the daylight rig is.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = look.environmentIntensity ?? 0.55;

  const sun = createSunRig(scene, look.light);

  const mesh = (geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], parent = scene) => {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    object.rotation.set(...rotation);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };

  // Sealed light-grey concrete slab plus two gold aisle markings: the "smart warehouse" floor
  // graphics live on physical paint, not on a coloured light.
  const floor = new THREE.Mesh(
    track(new THREE.PlaneGeometry(46, 46)),
    materials.get({ color: look.palette.floor, roughness: 0.95, metalness: 0.02 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const lineGeometry = track(new THREE.BoxGeometry(0.06, 0.006, 9.4));
  for (const x of [-0.95, 0.95]) {
    mesh(lineGeometry, materials.get({ color: look.palette.gold, roughness: 0.7 }), [x, 0.003, 0.6]);
  }

  // --- Two racks: three post frames each, two beam levels running the length of the rack. ---
  const paintGreen = materials.get({ color: look.palette.rack, roughness: 0.62, metalness: 0.35 });
  const paintDark = materials.get({ color: look.palette.rackDark, roughness: 0.75, metalness: 0.3 });
  const postGeometry = track(new THREE.BoxGeometry(0.11, 3.4, 0.11));
  const footGeometry = track(new THREE.BoxGeometry(0.3, 0.05, 0.3));
  const beamGeometry = track(new THREE.BoxGeometry(0.09, 0.12, 6.3));
  for (const side of [-1, 1]) {
    for (const dz of [-2.95, 0, 2.95]) {
      for (const dx of [-0.72, 0.72]) {
        mesh(postGeometry, paintGreen, [side * RACK_X + dx, 1.7, dz]);
        mesh(footGeometry, paintDark, [side * RACK_X + dx, 0.025, dz]);
      }
    }
    for (const levelY of LEVEL_Y) {
      for (const dx of [-0.62, 0.62]) {
        mesh(beamGeometry, paintDark, [side * RACK_X + dx, levelY - 0.06, 0]);
      }
    }
  }

  // --- Coils. All sixteen berths are built once; the stock slider only toggles visibility, so
  // the mesh count on screen is exactly the coil count the panel reports. ---
  const cradleGeometry = track(new THREE.BoxGeometry(1.42, 0.07, 0.2));
  const coilEntries = [];
  for (const slot of COIL_SLOTS) {
    const group = new THREE.Group();
    group.position.set(slot.x, LEVEL_Y[slot.level] + 0.07 + slot.radius * 0.82, slot.z);
    group.rotation.x = slot.seam;
    scene.add(group);

    // Cradle bars sit on the beams (outside the spinning-seam group so they never tilt).
    for (const sign of [-1, 1]) {
      mesh(cradleGeometry, paintGreen,
        [slot.x, LEVEL_Y[slot.level] + 0.04, slot.z + sign * slot.radius * 0.45],
        [sign * -0.32, 0, 0]);
    }

    const axis = [0, 0, Math.PI / 2]; // coil axis along world X, faces toward the aisle camera
    const shell = mesh(track(coilStripGeometry({
      innerRadius: slot.bore, outerRadius: slot.radius,
      width: slot.width, turns: 20, segmentsPerTurn: 48
    })), paintDark, [0, 0, 0], axis, group);

    const rings = [];
    const ringGeometry = track(new THREE.RingGeometry(slot.bore, slot.radius, 48));
    for (const sign of [-1, 1]) {
      rings.push(mesh(ringGeometry, paintDark,
        [sign * (slot.width / 2 - 0.006), 0, 0], [0, sign * Math.PI / 2, 0], group));
    }
    mesh(track(new THREE.CylinderGeometry(slot.bore, slot.bore, slot.width + 0.02, 24, 1, true)),
      materials.get({ color: look.palette.boreShadow, roughness: 0.8, metalness: 0.6, side: THREE.BackSide }),
      [0, 0, 0], axis, group);
    const bandGeometry = track(new THREE.TorusGeometry(slot.radius + 0.004, 0.012, 6, 48));
    for (const offset of [-0.28, 0.28]) {
      mesh(bandGeometry, materials.get({ color: '#7d868f', roughness: 0.4, metalness: 0.9 }),
        [offset * slot.width, 0, 0], [0, Math.PI / 2, 0], group);
    }
    coilEntries.push({ slot, group, shell, rings });
  }

  // --- Two banded sheet-stack pallets waiting in the staging zone by the aisle mouth. ---
  const palletGeometry = track(new THREE.BoxGeometry(1.45, 0.13, 1.15));
  const stackGeometry = track(new THREE.BoxGeometry(1.25, 0.3, 2.05));
  const strapGeometry = track(new THREE.BoxGeometry(1.29, 0.34, 0.03));
  const wood = materials.get({ color: '#b08d5e', roughness: 0.9 });
  const sheetSteel = materials.get({ color: STEEL.crc.color, roughness: 0.3, metalness: 0.9 });
  for (const [x, z, spin] of [[-1.35, 4.35, 0.12], [1.3, 4.5, -0.18]]) {
    const pallet = new THREE.Group();
    pallet.position.set(x, 0, z);
    pallet.rotation.y = spin;
    scene.add(pallet);
    mesh(palletGeometry, wood, [0, 0.065, 0], [0, 0, 0], pallet);
    mesh(stackGeometry, sheetSteel, [0, 0.28, 0], [0, 0, 0], pallet);
    for (const dz of [-0.55, 0.55]) {
      mesh(strapGeometry, paintDark, [0, 0.28, dz], [0, 0, 0], pallet);
    }
  }

  // --- The AGV: a low cart with a gold beacon stripe drifting the aisle. It is the ambient
  // motion the pause control stops, and the light that sells "smart" without tinting the hall. ---
  const agv = new THREE.Group();
  scene.add(agv);
  mesh(track(new THREE.BoxGeometry(0.95, 0.26, 0.62)), paintDark, [0, 0.16, 0], [0, 0, 0], agv);
  mesh(track(new THREE.BoxGeometry(0.97, 0.05, 0.64)),
    materials.get({ color: look.palette.gold, roughness: 0.4, emissive: look.palette.gold, emissiveIntensity: 1.6 }),
    [0, 0.31, 0], [0, 0, 0], agv);
  const beacon = new THREE.PointLight(look.palette.gold, 3, 3.5, 2);
  beacon.position.set(0, 0.6, 0);
  agv.add(beacon);

  // --- Authoritative state. ---
  let productId = 'gl';
  let coilCount = 10;
  let agvPhase = 0;

  function applyProduct(id) {
    if (!SURFACES[id]) return;
    productId = id;
    const preset = SURFACES[id];
    const shellMaterial = materials.get({
      color: preset.color, roughness: preset.roughness, metalness: preset.metalness, side: THREE.DoubleSide
    });
    const faceMaterial = materials.get({
      color: preset.color, roughness: Math.min(1, preset.roughness + 0.18), metalness: preset.metalness - 0.05
    });
    for (const entry of coilEntries) {
      entry.shell.material = shellMaterial;
      for (const ring of entry.rings) ring.material = faceMaterial;
    }
    invalidate();
  }

  function applyCount(count) {
    coilCount = Math.max(MIN_COILS, Math.min(MAX_COILS, Math.round(count)));
    coilEntries.forEach((entry, index) => { entry.group.visible = index < coilCount; });
    invalidate();
  }

  applyProduct(productId);
  applyCount(coilCount);

  return {
    get product() { return productId; },
    get count() { return coilCount; },
    get gaugeMm() { return GAUGE_MM[productId]; },
    setProduct: applyProduct,
    setCount: applyCount,
    /** Inventory summed over the coil groups actually visible on screen. */
    inventory() {
      let coils = 0, massKg = 0, lengthM = 0;
      for (const { slot, group } of coilEntries) {
        if (!group.visible) continue;
        coils += 1;
        const crossM2 = Math.PI * (slot.radius ** 2 - slot.bore ** 2);
        massKg += crossM2 * slot.width * STEEL_DENSITY_KG_M3;
        lengthM += crossM2 / (GAUGE_MM[productId] / 1000);
      }
      return { coils, massKg, lengthM };
    },
    /** @returns {boolean} true while the AGV is patrolling — what keeps the loop awake. */
    update(dt) {
      if (dt <= 0) return false;
      agvPhase += dt * 0.3;
      const previousZ = agv.position.z;
      agv.position.set(0, 0, Math.sin(agvPhase) * 3.4 + 0.6);
      agv.rotation.y = agv.position.z >= previousZ ? 0 : Math.PI;
      return true;
    },
    dispose() {
      sun.dispose();
      beacon.parent?.remove(beacon);
      beacon.dispose();
      for (const geometry of geometries) geometry.dispose();
      materials.dispose();
      sky.dispose();
      scene.environment = null;
      environment.dispose();
      pmrem.dispose();
    }
  };
}
