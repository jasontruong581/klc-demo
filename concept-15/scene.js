// Mẫu 15 — "Chuỗi cung ứng liền mạch": đảo diorama tuyến cung ứng của K&C.
//
// Authoritative state: (1) journey stage — 0 nhà máy Tân Phước Khánh, 1 kho K&C, 2 công trình —
// and (2) the truck's arc-length progress along ONE closed CatmullRom road. Every number the page
// shows (chặng km, thời gian giao, toàn tuyến) is derived from that same curve through routeInfo(),
// so the readouts and the road the truck actually drives can never disagree.
import * as THREE from 'three';
import {
  createMaterialCache, createSunRig, createLabelLayer, gradientSky, makeRandom
} from '../assets/klc3d/scene-kit.js';

/** Stated on the page: 1 m mô hình ≈ 2 km thực tế (TPK → kho K&C → công trình vùng TP HCM). */
export const SCALE_KM_PER_M = 2;
/** Average delivery speed the time readout assumes, stated on the page. */
export const AVG_SPEED_KMH = 40;

const DECK_Y = 0.55;        // top surface of the island platform
const TRUCK_SPEED = 0.85;   // scene metres per second of ambient truck motion

// Closed road loop. Points 0, 2 and 4 are the kerbs of the three stations, in journey order.
const ROAD_POINTS = [
  [-4.2, -0.35], [-2.4, 1.25], [0.6, 0.95], [2.7, 1.5], [4.4, -0.3],
  [3.1, -2.35], [0.1, -2.85], [-3.0, -2.5]
].map(([x, z]) => new THREE.Vector3(x, DECK_Y + 0.02, z));
const road = new THREE.CatmullRomCurve3(ROAD_POINTS, true, 'catmullrom', 0.55);
const ROAD_LENGTH_M = road.getLength();

/**
 * The three stations: journey name, world anchor, the curve parameter of their kerb point,
 * and the named view the page's stage buttons fly the camera to.
 */
export const STATIONS = [
  { name: 'Nhà máy Tân Phước Khánh', at: [-4.2, DECK_Y, -1.9], t: 0 / 8,
    view: { position: [-9.8, 4.6, 4.4], target: [-4.2, DECK_Y + 0.5, -1.9] } },
  { name: 'Kho K&C', at: [0.6, DECK_Y, 2.35], t: 2 / 8,
    view: { position: [5.2, 3.8, -2.0], target: [0.6, DECK_Y + 0.4, 2.35] } },
  { name: 'Công trình', at: [4.4, DECK_Y, -1.7], t: 4 / 8,
    view: { position: [9.4, 4.4, 3.2], target: [4.4, DECK_Y + 0.9, -1.7] } }
];

/** Arc length between two curve parameters, by sampling. */
function lengthBetween(t0, t1, samples = 160) {
  let sum = 0;
  let previous = road.getPoint(t0);
  for (let i = 1; i <= samples; i++) {
    const point = road.getPoint(t0 + ((t1 - t0) * i) / samples);
    sum += point.distanceTo(previous);
    previous = point;
  }
  return sum;
}

/**
 * Derived route figures the page prints. Legs follow the journey: nhà máy → kho → công trình;
 * totalKm is the whole loop the truck drives (including the empty return stretch).
 */
export function routeInfo(avgKmh = AVG_SPEED_KMH) {
  const legs = [
    lengthBetween(STATIONS[0].t, STATIONS[1].t),
    lengthBetween(STATIONS[1].t, STATIONS[2].t)
  ].map((metres) => {
    const kmValue = metres * SCALE_KM_PER_M;
    return { km: kmValue, minutes: (kmValue / avgKmh) * 60 };
  });
  return {
    totalKm: ROAD_LENGTH_M * SCALE_KM_PER_M,
    legs,
    deliveryKm: legs[0].km + legs[1].km,
    deliveryMinutes: legs[0].minutes + legs[1].minutes
  };
}

/** Rounded-corner slab, extruded and laid flat: the island platform. */
function roundedSlabGeometry(width, depth, height, corner, bevel) {
  const shape = new THREE.Shape();
  const x = width / 2 - corner, z = depth / 2 - corner;
  shape.absarc(x, z, corner, 0, Math.PI / 2);
  shape.absarc(-x, z, corner, Math.PI / 2, Math.PI);
  shape.absarc(-x, -z, corner, Math.PI, Math.PI * 1.5);
  shape.absarc(x, -z, corner, Math.PI * 1.5, Math.PI * 2);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height, steps: 1, bevelEnabled: true,
    bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry; // spans y in [-bevel, height + bevel]
}

/** Flat ribbon following the curve: the road surface, built once. */
function roadRibbonGeometry(curve, width, segments = 240) {
  const up = new THREE.Vector3(0, 1, 0);
  const positions = [];
  const indices = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const side = curve.getTangentAt(t).cross(up).setY(0).normalize().multiplyScalar(width / 2);
    positions.push(point.x - side.x, point.y, point.z - side.z,
      point.x + side.x, point.y, point.z + side.z);
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 3, a, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createScene({ scene, camera, look, invalidate, viewport }) {
  const materials = createMaterialCache();
  const geometries = [];
  const track = (geometry) => { geometries.push(geometry); return geometry; };
  const flat = (color, extra = {}) =>
    materials.get({ color, roughness: 0.85, metalness: 0, flatShading: true, ...extra });

  scene.background = gradientSky(look.sky.zenith, look.sky.horizon);
  const sun = createSunRig(scene, look.light);

  const box = (parent, w, h, d, material, x, y, z) => {
    const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  // Four-sided cone squared up 45°: the classic low-poly hip roof, stretched to the footprint.
  const roof = (parent, w, d, h, material, y) => {
    const mesh = new THREE.Mesh(track(new THREE.ConeGeometry(0.707, 1, 4)), material);
    mesh.rotation.y = Math.PI / 4;
    mesh.scale.set(w * 1.1, h, d * 1.1);
    mesh.position.set(0, y + h / 2, 0);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  // Low metalness on purpose: there is no environment map here, and standard-material metal
  // without one renders near-black (see docs/3d-architecture.md gotchas).
  const steel = flat('#ccd4da', { roughness: 0.45, metalness: 0.3 });
  const coil = (parent, x, y, z, r = 0.3) => {
    const mesh = new THREE.Mesh(track(new THREE.TorusGeometry(r * 0.62, r * 0.38, 8, 20)), steel);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // ---- The island: sand base plus a grass top the road sits on.
  const base = new THREE.Mesh(track(roundedSlabGeometry(13.6, 9.4, 0.34, 1.5, 0.16)), flat('#e6dcc3'));
  base.position.y = DECK_Y - 0.05 - 0.5;
  base.castShadow = base.receiveShadow = true;
  scene.add(base);
  const grass = new THREE.Mesh(track(roundedSlabGeometry(13.1, 8.9, 0.06, 1.4, 0.05)), flat('#9cc178'));
  grass.position.y = DECK_Y - 0.11;
  grass.receiveShadow = true;
  scene.add(grass);
  const asphalt = new THREE.Mesh(track(roadRibbonGeometry(road, 0.62)), flat('#5c6157', { roughness: 0.95 }));
  asphalt.receiveShadow = true;
  scene.add(asphalt);

  // ---- Station 1: nhà máy Tôn Tân Phước Khánh — hall, stack, two coils at the gate.
  const factory = new THREE.Group();
  factory.position.set(...STATIONS[0].at);
  scene.add(factory);
  box(factory, 2.3, 0.95, 1.5, flat('#efe6d0'), 0, 0.475, 0);
  roof(factory, 2.3, 1.5, 0.55, flat('#c4694f'), 0.95);
  const stack = new THREE.Mesh(track(new THREE.CylinderGeometry(0.12, 0.16, 1.3, 8)), flat('#a5573f'));
  stack.position.set(-0.82, 1.3, -0.38);
  stack.castShadow = true;
  factory.add(stack);
  box(factory, 0.55, 0.5, 0.03, flat('#3a423c'), 0.35, 0.25, 0.76);
  coil(factory, -1.0, 0.24, 1.25, 0.24);
  coil(factory, -0.42, 0.24, 1.3, 0.24);

  // ---- Station 2: kho K&C — warehouse under the brand-green roof, coil rows outside.
  const depot = new THREE.Group();
  depot.position.set(...STATIONS[1].at);
  scene.add(depot);
  box(depot, 2.5, 0.85, 1.55, flat('#f3efe4'), 0, 0.425, 0);
  roof(depot, 2.5, 1.55, 0.5, flat('#0d7a3a'), 0.85);
  box(depot, 0.7, 0.55, 0.03, flat('#3a423c'), 0, 0.275, -0.79);
  for (let i = 0; i < 4; i++) {
    coil(depot, 1.7 + (i % 2) * 0.6, 0.26, -0.5 + Math.floor(i / 2) * 0.65, 0.26);
  }

  // ---- Station 3: công trình — two slabs on columns, scaffolding facing the road.
  const site = new THREE.Group();
  site.position.set(...STATIONS[2].at);
  scene.add(site);
  const concrete = flat('#d9d4c6');
  const scaffold = flat('#d99a3d');
  box(site, 1.7, 0.16, 1.2, concrete, 0, 0.08, 0);
  box(site, 1.7, 0.16, 1.2, concrete, 0, 0.9, 0);
  box(site, 1.3, 0.14, 0.95, concrete, 0, 1.62, 0);
  for (const [cx, cz] of [[-0.7, -0.45], [0.7, -0.45], [-0.7, 0.45], [0.7, 0.45]]) {
    box(site, 0.1, 0.66, 0.1, flat('#bdb7a6'), cx, 0.49, cz);
    box(site, 0.09, 0.56, 0.09, flat('#bdb7a6'), cx * 0.78, 1.26, cz * 0.78);
  }
  for (let i = 0; i < 5; i++) box(site, 0.045, 1.5, 0.045, scaffold, -0.8 + i * 0.4, 0.75, 0.72);
  box(site, 1.74, 0.045, 0.045, scaffold, 0, 0.55, 0.72);
  box(site, 1.74, 0.045, 0.045, scaffold, 0, 1.15, 0.72);

  // ---- Station highlight rings, swapped by the authoritative stage.
  const ringActive = materials.get({
    color: '#17843f', emissive: '#17843f', emissiveIntensity: 0.55, roughness: 0.6, metalness: 0
  });
  const ringIdle = materials.get({
    color: '#c9c0a9', roughness: 0.9, metalness: 0, transparent: true, opacity: 0.55
  });
  const rings = STATIONS.map((station) => {
    const ring = new THREE.Mesh(track(new THREE.RingGeometry(1.18, 1.42, 40)), ringIdle);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(station.at[0], DECK_Y + 0.012, station.at[2]);
    scene.add(ring);
    return ring;
  });

  // ---- Trees: deterministic jitter so every visit draws the same island.
  const random = makeRandom(150915);
  const leaves = [flat('#4f9e5f'), flat('#3c7f52')];
  const trunk = flat('#8a6a48');
  const SPOTS = [[-5.7, 1.9], [-6.0, -3.1], [-1.4, -1.15], [-1.9, 3.4], [3.9, 3.5],
    [5.9, 1.7], [6.1, -3.0], [1.8, -1.3], [-4.2, 3.2], [5.0, -3.3], [-6.1, -0.6], [-3.1, 3.6]];
  for (const [sx, sz] of SPOTS) {
    const s = 0.75 + random() * 0.55;
    const x = sx + (random() - 0.5) * 0.5, z = sz + (random() - 0.5) * 0.5;
    const cone = new THREE.Mesh(track(new THREE.ConeGeometry(0.3 * s, 0.8 * s, 7)), leaves[random() > 0.5 ? 0 : 1]);
    cone.position.set(x, DECK_Y + 0.24 * s + 0.4 * s, z);
    cone.castShadow = true;
    const stem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.045 * s, 0.06 * s, 0.24 * s, 6)), trunk);
    stem.position.set(x, DECK_Y + 0.12 * s, z);
    stem.castShadow = true;
    scene.add(cone, stem);
  }

  // ---- The truck: cab, flatbed, one coil strapped across the bed, four wheels. Faces +Z.
  const truck = new THREE.Group();
  scene.add(truck);
  box(truck, 0.34, 0.3, 0.32, flat('#0d7a3a'), 0, 0.36, 0.42);
  box(truck, 0.36, 0.1, 1.06, flat('#3a423c'), 0, 0.2, 0);
  const load = new THREE.Mesh(track(new THREE.TorusGeometry(0.13, 0.08, 8, 18)), steel);
  load.rotation.y = Math.PI / 2; // coil axis across the bed
  load.position.set(0, 0.37, -0.2);
  load.castShadow = true;
  truck.add(load);
  const tyre = flat('#252a22');
  for (const [wx, wz] of [[-0.2, 0.38], [0.2, 0.38], [-0.2, -0.32], [0.2, -0.32]]) {
    const wheel = new THREE.Mesh(track(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10)), tyre);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, 0.09, wz);
    wheel.castShadow = true;
    truck.add(wheel);
  }

  // ---- Pinned station labels: real DOM text, screen-reader readable.
  const labels = createLabelLayer(viewport, camera);
  STATIONS.forEach((station, index) => {
    labels.add(`<b>${index + 1}</b>${station.name}`,
      () => [station.at[0], DECK_Y + 2.05, station.at[2]], 'station-label');
  });

  const state = { stage: 0, progress: 0.03 };
  const tangent = new THREE.Vector3();
  function placeTruck() {
    road.getPointAt(state.progress, truck.position);
    road.getTangentAt(state.progress, tangent);
    truck.rotation.y = Math.atan2(tangent.x, tangent.z);
  }
  function setStage(index) {
    state.stage = index;
    rings.forEach((ring, i) => { ring.material = i === index ? ringActive : ringIdle; });
    invalidate();
  }
  setStage(0);
  placeTruck();

  return {
    state,
    setStage,
    /** @returns {boolean} true only while the truck is actually moving (dt = 0 when paused). */
    update(dt) {
      labels.update();
      if (dt <= 0) return false;
      state.progress = (state.progress + (dt * TRUCK_SPEED) / ROAD_LENGTH_M) % 1;
      placeTruck();
      return true;
    },
    dispose() {
      sun.dispose();
      labels.dispose();
      for (const geometry of geometries) geometry.dispose();
      materials.dispose();
      scene.background?.dispose?.();
    }
  };
}
