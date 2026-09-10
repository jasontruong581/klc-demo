// Mẫu 09 — Industrial Dark 3D.
//
// Subject: a mill coil on a decoiler mandrel paying strip out over pinch rolls onto a run-out
// table. Line speed and strip gauge are the authoritative state; coil rotation, strip travel,
// coil weight and the strip length held in the coil are all derived from them, so no readout can
// disagree with what is on screen.
//
// Real dimensions in metres: coil ID 0.508, OD 1.50, width 1.25 — a standard mill coil.
// Two deliberate display exaggerations, both stated on the page: the end-face spiral draws 46
// coarse wraps instead of the ~400 that 1.2 mm strip really makes, and strip thickness is drawn
// 6x scale so a 1.2 mm edge is visible at this camera distance.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createMaterialCache, createSunRig, gradientSky, coilStripGeometry } from '../assets/klc3d/scene-kit.js';

const COIL = { bore: 0.254, radius: 0.75, width: 1.25, standHeight: 0.32 };
const CROSS_SECTION_M2 = Math.PI * (COIL.radius ** 2 - COIL.bore ** 2);
const STEEL_DENSITY_KG_M3 = 7850;
const RUNOUT_LENGTH = 6.4;
const GAUGE_DRAW_SCALE = 6;

export const COIL_FACTS = {
  massKg: CROSS_SECTION_M2 * COIL.width * STEEL_DENSITY_KG_M3,
  outerDiameterMm: COIL.radius * 2000,
  boreDiameterMm: COIL.bore * 2000,
  widthMm: COIL.width * 1000,
  /** Strip length held in this coil at a given gauge: L = π(R² − r²) / t. */
  lengthM: (gaugeMm) => CROSS_SECTION_M2 / (gaugeMm / 1000)
};

/** Brushed strip surface: fine lines along the rolling direction plus one transverse gauge mark. */
function stripTexture() {
  const canvas = Object.assign(document.createElement('canvas'), { width: 64, height: 256 });
  const context = canvas.getContext('2d');
  context.fillStyle = '#8c98a3';
  context.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 130; i++) {
    const x = (i * 7.31) % 64;
    const bright = i % 3 === 0;
    context.strokeStyle = bright ? 'rgba(255,255,255,.10)' : 'rgba(40,48,55,.12)';
    context.lineWidth = 0.5 + (i % 3) * 0.4;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 256);
    context.stroke();
  }
  context.fillStyle = 'rgba(35,160,79,.85)';
  context.fillRect(0, 5, 64, 3);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 14);
  return texture;
}

/** Archimedean spiral drawn in the plane of a coil end face (local YZ, axis along local X). */
function endFaceSpiral(turns, color) {
  const points = [];
  const steps = turns * 26;
  const growth = (COIL.radius - COIL.bore) / (turns * Math.PI * 2);
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * turns * Math.PI * 2;
    const radius = COIL.bore + growth * theta;
    points.push(new THREE.Vector3(0, Math.cos(theta) * radius, Math.sin(theta) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }));
}

export function createScene({ renderer, scene, look, invalidate }) {
  const materials = createMaterialCache();
  const geometries = [];
  const track = (geometry) => { geometries.push(geometry); return geometry; };

  const sky = gradientSky(look.sky.zenith, look.sky.horizon);
  scene.background = sky;
  scene.fog = new THREE.FogExp2(new THREE.Color(look.fog.color), look.fog.density);

  // Steel at metalness 0.95 has almost no diffuse term: without something to reflect it renders
  // near black however bright the lamps are. The environment map is what makes it read as steel.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = look.environmentIntensity ?? 0.4;

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

  // Hall floor. Dark troweled concrete: it has to read as a surface, not as the void.
  const floor = new THREE.Mesh(
    track(new THREE.PlaneGeometry(200, 200)),
    materials.get({ color: look.palette.floor, roughness: 0.94, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // --- Coil on its mandrel. The group spins about world X, so every part inside it turns with
  // the coil and the wound face reads from a 3/4 view. ---
  const spinner = new THREE.Group();
  const axleY = COIL.radius + COIL.standHeight;
  spinner.position.set(0, axleY, 0);
  scene.add(spinner);

  const steelBright = materials.get({ color: look.palette.steel, roughness: 0.28, metalness: 0.95 });
  const steelDark = materials.get({ color: look.palette.steelDark, roughness: 0.55, metalness: 0.85 });
  const axis = [0, 0, Math.PI / 2];

  mesh(track(new THREE.CylinderGeometry(COIL.radius, COIL.radius, COIL.width, 128, 1, true)),
    steelBright, [0, 0, 0], axis, spinner);

  mesh(track(new THREE.CylinderGeometry(COIL.bore, COIL.bore, COIL.width + 0.02, 64, 1, true)),
    materials.get({ color: look.palette.steelDark, roughness: 0.7, metalness: 0.8, side: THREE.BackSide }),
    [0, 0, 0], axis, spinner);

  for (const sign of [-1, 1]) {
    mesh(track(new THREE.RingGeometry(COIL.bore, COIL.radius, 128)),
      steelDark, [(sign * COIL.width) / 2, 0, 0], [0, (sign * Math.PI) / 2, 0], spinner);
    const spiral = endFaceSpiral(46, look.palette.groove);
    spiral.position.x = sign * (COIL.width / 2 + 0.004);
    spinner.add(spiral);
    geometries.push(spiral.geometry);
  }

  // Strapping bands. A mill coil is always banded; without them it reads as a machined billet.
  for (const offset of [-0.34, 0.34]) {
    mesh(track(new THREE.TorusGeometry(COIL.radius + 0.005, 0.014, 8, 96)),
      materials.get({ color: '#6f7a83', roughness: 0.45, metalness: 0.9 }),
      [offset, 0, 0], [0, Math.PI / 2, 0], spinner);
  }

  // The wrap lifting off the coil: one partial turn of real strip surface, so wound mass and flat
  // strip are one continuous piece of steel rather than two unrelated objects.
  const liftOffPivot = new THREE.Group();
  liftOffPivot.rotation.z = Math.PI / 2;
  spinner.add(liftOffPivot);
  const liftOff = mesh(
    track(coilStripGeometry({
      innerRadius: COIL.radius + 0.006, outerRadius: COIL.radius + 0.022,
      width: COIL.width, turns: 0.44, segmentsPerTurn: 96
    })),
    materials.get({ color: look.palette.steel, roughness: 0.3, metalness: 0.94, side: THREE.DoubleSide }),
    [0, 0, 0], [0, Math.PI * 1.28, 0], liftOffPivot);
  liftOff.receiveShadow = false;

  mesh(track(new THREE.CylinderGeometry(0.11, 0.11, 2.5, 32)),
    materials.get({ color: '#565f68', roughness: 0.5, metalness: 0.9 }),
    [0, 0, 0], axis, spinner);

  // Stands: the mandrel has to be held up by something the eye can trace to the floor. The green
  // is painted machine steel, which is where a works colour actually lives.
  const standGeometry = track(new THREE.BoxGeometry(0.26, axleY, 0.72));
  const footGeometry = track(new THREE.BoxGeometry(0.46, 0.09, 0.98));
  const panelGeometry = track(new THREE.BoxGeometry(0.2, 0.34, 0.03));
  for (const sign of [-1, 1]) {
    mesh(standGeometry, materials.get({ color: look.palette.machine, roughness: 0.7, metalness: 0.5 }),
      [sign * 1.12, axleY / 2, 0]);
    mesh(footGeometry, materials.get({ color: look.palette.machineDark, roughness: 0.8, metalness: 0.4 }),
      [sign * 1.12, 0.045, 0]);
    mesh(panelGeometry, materials.get({ color: look.palette.paint, roughness: 0.55, metalness: 0.25 }),
      [sign * 1.12, axleY * 0.62, 0.375]);
  }

  // --- Strip leaving the coil at the top tangent and running out in +Z. ---
  const stripMap = stripTexture();
  const stripMaterial = new THREE.MeshStandardMaterial({
    map: stripMap, color: '#ffffff', roughness: 0.32, metalness: 0.92
  });
  const strip = new THREE.Mesh(track(new THREE.BoxGeometry(COIL.width, 1, RUNOUT_LENGTH)), stripMaterial);
  strip.castShadow = true;
  strip.receiveShadow = true;
  scene.add(strip);

  let gaugeMm = 1.2;
  function applyGauge(value) {
    gaugeMm = value;
    const drawn = (gaugeMm / 1000) * GAUGE_DRAW_SCALE;
    strip.scale.y = drawn;
    strip.position.set(0, axleY + COIL.radius + drawn / 2, RUNOUT_LENGTH / 2 - 0.1);
    invalidate();
  }
  applyGauge(gaugeMm);

  // Pinch rolls: the pair that grips the strip and sets the line speed.
  for (const sign of [-1, 1]) {
    mesh(track(new THREE.CylinderGeometry(0.1, 0.1, COIL.width + 0.24, 32)),
      materials.get({ color: '#77828b', roughness: 0.38, metalness: 0.92 }),
      [0, strip.position.y + sign * 0.104, 1.55], axis);
  }

  // Run-out table rollers, one instanced draw. Real spacing, no jitter: a roller table is a grid.
  const rollerCount = 9;
  const rollers = new THREE.InstancedMesh(
    track(new THREE.CylinderGeometry(0.075, 0.075, COIL.width + 0.3, 20)),
    materials.get({ color: '#5f696f', roughness: 0.55, metalness: 0.8 }), rollerCount);
  const matrix = new THREE.Matrix4();
  const rollerRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
  const unit = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < rollerCount; i++) {
    matrix.compose(new THREE.Vector3(0, strip.position.y - 0.077, 2.1 + i * 0.5), rollerRotation, unit);
    rollers.setMatrixAt(i, matrix);
  }
  rollers.castShadow = true;
  rollers.receiveShadow = true;
  scene.add(rollers);

  // Overhead light bars: the only surfaces authored bright, so the hall has a visible source for
  // the light that falls on the coil.
  const barMaterial = materials.get({
    color: '#dfe9f2', roughness: 0.4, metalness: 0,
    emissive: look.palette.lamp, emissiveIntensity: 2.4
  });
  const housingMaterial = materials.get({ color: look.palette.machineDark, roughness: 0.8, metalness: 0.3 });
  const barGeometry = track(new THREE.BoxGeometry(3.4, 0.08, 0.22));
  const housingGeometry = track(new THREE.BoxGeometry(3.5, 0.14, 0.3));
  const stemGeometry = track(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 10));
  const lamps = [];
  for (let i = 0; i < 3; i++) {
    const z = -1.4 + i * 3.1;
    mesh(barGeometry, barMaterial, [0, 4.5, z]);
    mesh(housingGeometry, housingMaterial, [0, 4.61, z]);
    for (const x of [-1.4, 1.4]) mesh(stemGeometry, housingMaterial, [x, 5.48, z]);
    const point = new THREE.PointLight(look.palette.lamp, 30, 16, 2);
    point.position.set(0, 4.3, z);
    scene.add(point);
    lamps.push(point);
  }

  // --- State. Line speed in m/min is what the visitor sets; everything else follows it. ---
  const state = { lineSpeedMpm: 45, paidOutM: 0 };
  let angle = 0;

  return {
    facts: COIL_FACTS,
    get gaugeMm() { return gaugeMm; },
    get paidOutM() { return state.paidOutM; },
    get lineSpeedMpm() { return state.lineSpeedMpm; },
    setGauge: applyGauge,
    setLineSpeed(mpm) { state.lineSpeedMpm = mpm; invalidate(); },
    /** @returns {boolean} true while the line is feeding, which is what keeps the loop awake. */
    update(dt) {
      if (dt <= 0) return false;
      const metresPerSecond = state.lineSpeedMpm / 60;
      const advance = metresPerSecond * dt;
      state.paidOutM += advance;
      // Coil angular speed is derived from the line speed: ω = v / R.
      angle += (metresPerSecond / COIL.radius) * dt;
      spinner.rotation.x = -angle;
      // The strip surface travels at exactly the speed the coil pays it out.
      stripMap.offset.y = (stripMap.offset.y - (advance / RUNOUT_LENGTH) * stripMap.repeat.y) % 1;
      return true;
    },
    dispose() {
      sun.dispose();
      for (const lamp of lamps) { lamp.parent?.remove(lamp); lamp.dispose(); }
      for (const geometry of geometries) geometry.dispose();
      stripMaterial.dispose();
      stripMap.dispose();
      materials.dispose();
      sky.dispose();
      scene.environment = null;
      environment.dispose();
      pmrem.dispose();
    }
  };
}
