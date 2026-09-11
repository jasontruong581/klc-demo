// Mẫu 16 — Kiến trúc sóng tôn: parametric profile studio.
//
// Subject: one tôn lạnh (GL) roofing coupon, 1 m cover × 2 m long, floating gallery-style above
// a plaster pedestal. The cross-section POLYLINE is the authoritative source of everything:
// the extruded 3D surface, the fallback SVG, and every readout. Nothing is typed twice.
//
//   khổ hữu dụng   = maxX − minX of the polyline                     [mm]
//   chiều cao sóng = maxY − minY of the polyline                     [mm]
//   dài triển khai = Σ √(Δx² + Δy²) over the polyline segments       [mm]
//   khối lượng/m²  = (dài triển khai / khổ hữu dụng) × dày × 7 850   [kg/m² of covered roof]
//   khối lượng tấm = dài triển khai × dày × 7 850 × dài tấm          [kg]
//
// Display exaggeration is explicit: real gauges (0.35–0.50 mm) are invisible at panel scale, so
// the drawn sheet thickness is gauge × THICKNESS_EXAGGERATION and the factor is printed on-page.
import * as THREE from 'three';
import {
  createMaterialCache, createStudioRig, createLabelLayer,
  gradientSky, makeRandom, STEEL, STEEL_DENSITY_KG_M3
} from '../assets/klc3d/scene-kit.js';

export const PANEL_LENGTH_M = 2;
export const THICKNESS_EXAGGERATION = 15;
export const GAUGES_MM = [0.35, 0.45, 0.5];
const FLOAT_Y = 0.62;

/**
 * The three real Vietnamese roofing profiles. Each polyline() returns the cross-section as
 * {x, y} points in millimetres, left to right, y up from the pan line. Everything else —
 * geometry, SVG, readouts — derives from these points.
 */
export const PROFILES = {
  vuong5: {
    label: '5 sóng vuông', waves: 5, waveWord: 'sóng vuông',
    use: 'Mái nhà xưởng, kho — khẩu độ xà gồ lớn nhờ sóng cao cứng vững.',
    polyline() {
      const pitch = 200, pan = 72.5, run = 15, top = 25, h = 32;
      const pts = [{ x: 0, y: 0 }];
      for (let i = 0; i < 5; i++) {
        const x0 = i * pitch + pan;
        pts.push({ x: x0, y: 0 }, { x: x0 + run, y: h }, { x: x0 + run + top, y: h },
          { x: x0 + 2 * run + top, y: 0 }, { x: (i + 1) * pitch, y: 0 });
      }
      return pts;
    }
  },
  tron9: {
    label: '9 sóng tròn', waves: 9, waveWord: 'sóng tròn',
    use: 'Mái dân dụng, vách bao che — đường cong mềm, thoát nước đều.',
    polyline() {
      const pitch = 110, waves = 9, h = 24, seg = 22;
      const pts = [];
      for (let i = 0; i <= waves * seg; i++) {
        const x = i * (pitch / seg);
        pts.push({ x, y: (h / 2) * (1 - Math.cos((2 * Math.PI * x) / pitch)) });
      }
      return pts;
    }
  },
  cliplock: {
    label: 'Cliplock sóng đứng', waves: 3, waveWord: 'sóng đứng',
    use: 'Mái phẳng độ dốc thấp, công trình kiến trúc — khớp gài, không bắn vít xuyên tôn.',
    polyline() {
      const h = 41, half = 16, cap = 11;
      const pts = [];
      for (const c of [16, 480, 944]) {
        pts.push({ x: c - half, y: 0 }, { x: c - cap, y: h }, { x: c + cap, y: h }, { x: c + half, y: 0 });
      }
      return pts;
    }
  }
};

/**
 * Every readout, computed from the profile polyline — never typed by hand.
 * @param {{profileId: keyof typeof PROFILES, gaugeMm: number}} state
 */
export function deriveSpecs({ profileId, gaugeMm }) {
  const pts = PROFILES[profileId].polyline();
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, developedMm = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    if (i > 0) developedMm += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
  }
  const coverMm = maxX - minX;
  const massKgM2 = (developedMm / coverMm) * (gaugeMm / 1000) * STEEL_DENSITY_KG_M3;
  return {
    coverMm, developedMm, gaugeMm,
    waveHeightMm: maxY - minY,
    waveCount: PROFILES[profileId].waves,
    massKgM2,
    sheetMassKg: (developedMm / 1000) * (gaugeMm / 1000) * STEEL_DENSITY_KG_M3 * PANEL_LENGTH_M
  };
}

/**
 * SVG path of one profile cross-section, for the no-WebGL fallback and the section diagrams.
 * Height is fit to the box (a schematic, not a scale drawing).
 */
export function svgPathFor(profileId, width = 320, height = 96, pad = 10) {
  const pts = PROFILES[profileId].polyline();
  const { coverMm, waveHeightMm } = deriveSpecs({ profileId, gaugeMm: 0.45 });
  const sx = (width - 2 * pad) / coverMm;
  const sy = (height - 2 * pad) / Math.max(waveHeightMm, 1);
  return pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(pad + p.x * sx).toFixed(1)} ${(height - pad - p.y * sy).toFixed(1)}`)
    .join(' ');
}

/** Offset a polyline by ±distance along its miter-compensated point normals. */
function offsetPolyline(pts, distance) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let d1 = { x: p.x - a.x, y: p.y - a.y }, d2 = { x: b.x - p.x, y: b.y - p.y };
    if (i === 0) d1 = d2;
    if (i === pts.length - 1) d2 = d1;
    const l1 = Math.hypot(d1.x, d1.y) || 1, l2 = Math.hypot(d2.x, d2.y) || 1;
    d1 = { x: d1.x / l1, y: d1.y / l1 }; d2 = { x: d2.x / l2, y: d2.y / l2 };
    let nx = -(d1.y + d2.y), ny = d1.x + d2.x;
    const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len;
    const miter = Math.max(0.5, nx * -d1.y + ny * d1.x); // clamp so sharp corners never spike
    out.push({ x: p.x + (nx * distance) / miter, y: p.y + (ny * distance) / miter });
  }
  return out;
}

/** Extrude the profile polyline, stroked to the drawn thickness, into the 2 m coupon. */
function buildPanelGeometry(profileId, gaugeMm) {
  const raw = PROFILES[profileId].polyline();
  const { coverMm } = deriveSpecs({ profileId, gaugeMm });
  const pts = raw.map((p) => ({ x: (p.x - coverMm / 2) / 1000, y: p.y / 1000 }));
  const half = (gaugeMm * THICKNESS_EXAGGERATION) / 2000;
  const top = offsetPolyline(pts, half);
  const bottom = offsetPolyline(pts, -half);
  const shape = new THREE.Shape();
  shape.moveTo(top[0].x, top[0].y);
  for (let i = 1; i < top.length; i++) shape.lineTo(top[i].x, top[i].y);
  for (let i = bottom.length - 1; i >= 0; i--) shape.lineTo(bottom[i].x, bottom[i].y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: PANEL_LENGTH_M, bevelEnabled: false, steps: 1 });
  geometry.translate(0, 0, -PANEL_LENGTH_M / 2);
  return geometry;
}

/** Faint aluminium-zinc spangle: deterministic flecks so every visit reflects the same way. */
function spangleTexture() {
  const size = 256;
  const canvas = Object.assign(document.createElement('canvas'), { width: size, height: size });
  const context = canvas.getContext('2d');
  context.fillStyle = '#eef2f1';
  context.fillRect(0, 0, size, size);
  const random = makeRandom(16);
  for (let i = 0; i < 900; i++) {
    const shade = 226 + Math.floor(random() * 26);
    context.fillStyle = `rgba(${shade}, ${shade + 2}, ${shade + 3}, ${0.35 + random() * 0.4})`;
    const r = 1.5 + random() * 5;
    context.beginPath();
    context.ellipse(random() * size, random() * size, r, r * (0.4 + random() * 0.6), random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  return texture;
}

export function createScene({ renderer, scene, camera, look, invalidate, viewport }) {
  const materials = createMaterialCache();
  const sky = gradientSky(look.palette.skyTop, look.palette.skyBottom);
  scene.background = sky;
  const studio = createStudioRig(scene, renderer, {
    subject: [0, FLOAT_Y, 0], environmentIntensity: 0.55, distance: 3.6
  });

  // Gallery floor and plinth: warm plaster, all reflection kept on the steel.
  const floorGeometry = new THREE.CircleGeometry(7, 48);
  const floor = new THREE.Mesh(floorGeometry, materials.get({ color: look.palette.floor, roughness: 0.96 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  const plinthGeometry = new THREE.CylinderGeometry(0.8, 0.86, 0.12, 64);
  const plinth = new THREE.Mesh(plinthGeometry, materials.get({ color: look.palette.plinth, roughness: 0.9 }));
  plinth.position.y = 0.06;
  plinth.castShadow = plinth.receiveShadow = true;
  scene.add(floor, plinth);

  const spangle = spangleTexture();
  const steel = new THREE.MeshStandardMaterial({
    color: STEEL.gl.color, roughness: STEEL.gl.roughness, metalness: STEEL.gl.metalness,
    map: spangle, side: THREE.DoubleSide
  });

  const turntable = new THREE.Group();
  turntable.position.y = FLOAT_Y;
  scene.add(turntable);
  const panel = new THREE.Mesh(undefined, steel);
  panel.castShadow = true;
  turntable.add(panel);

  const state = { profileId: 'vuong5', gaugeMm: 0.45 };
  let specs = deriveSpecs(state);

  // Callout anchors sit on the coupon, so they turn with the turntable.
  const anchor = (x, y, z) => () => {
    const a = turntable.rotation.y;
    return [x * Math.cos(a) + z * Math.sin(a), FLOAT_Y + y, z * Math.cos(a) - x * Math.sin(a)];
  };
  const labels = createLabelLayer(viewport, camera);
  const format = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
  const fine = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const labelCover = labels.add('', () => anchor(0, -0.09, PANEL_LENGTH_M / 2)(), 'dim', 'center');
  const labelHeight = labels.add('', () => anchor(specs.coverMm / 2000 + 0.04, specs.waveHeightMm / 1000, 0.4)(), 'dim', 'left');
  const labelGauge = labels.add('', () => anchor(-(specs.coverMm / 2000) - 0.04, 0.01, -0.4)(), 'dim gold', 'right');

  function apply(next = {}) {
    Object.assign(state, next);
    specs = deriveSpecs(state);
    panel.geometry?.dispose();
    panel.geometry = buildPanelGeometry(state.profileId, state.gaugeMm);
    labelCover.element.innerHTML = `<b>${format.format(specs.coverMm)} mm</b><i>Khổ hữu dụng</i>`;
    labelHeight.element.innerHTML = `<b>${format.format(specs.waveHeightMm)} mm</b><i>Cao sóng</i>`;
    labelGauge.element.innerHTML =
      `<b>${fine.format(state.gaugeMm)} mm</b><i>Dày TCT · vẽ ×${THICKNESS_EXAGGERATION}</i>`;
    invalidate();
    return specs;
  }
  apply();

  return {
    state,
    get specs() { return specs; },
    apply,
    /** Snap the coupon square to the axes so an edge-on or top view frames what it promises. */
    square() { turntable.rotation.y = 0; invalidate(); },
    /** @returns {boolean} true while the coupon is turning. */
    update(dt) {
      labels.update();
      if (dt <= 0) return false;
      turntable.rotation.y = (turntable.rotation.y + dt * 0.22) % (Math.PI * 2);
      return true;
    },
    dispose() {
      studio.dispose();
      labels.dispose();
      panel.geometry?.dispose();
      floorGeometry.dispose();
      plinthGeometry.dispose();
      spangle.dispose();
      steel.dispose();
      sky.dispose();
      scene.background = null;
      materials.dispose();
    }
  };
}
