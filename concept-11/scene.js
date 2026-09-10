// Mẫu 11 — Technical Blueprint 3D.
//
// Subject: an orthographic, explodable section through a galvalume (tôn lạnh) sheet.
//
// Grounding. Total coated thickness (TCT) and the coating class are what a buyer actually orders,
// so those two are the authoritative state and every layer thickness is derived from them:
//   coating mass per side = AZ class / 2                       [g/m², both-sides designation]
//   coating thickness per side = mass per side / 3 750 kg/m³   [55% Al – 43.4% Zn – 1.6% Si]
//   base steel = TCT − 2 × coating thickness
// AZ150 therefore lands at 20 µm per side, AZ100 at 13.3 µm, AZ50 at 6.7 µm — the figures the
// mill data sheets quote. Sheet mass adds the steel base at 7 850 kg/m³ to the two coatings.
//
// Display exaggeration is a control, not a hidden fudge: at true scale a 0.40 mm sheet on a
// 240 mm coupon is a hairline, so the thickness axis is scaled and the factor is always shown.
import * as THREE from 'three';
import { createMaterialCache, createSunRig, createLabelLayer } from '../assets/klc3d/scene-kit.js';

const COUPON = { width: 0.24, depth: 0.16 };
const COATING_DENSITY_KG_M3 = 3750;
const STEEL_DENSITY_KG_M3 = 7850;
const EXPLODE_GAP = 0.055;

/** AZ designation → coating mass in g/m², counted over both faces. */
export const COATING_CLASSES = { AZ50: 50, AZ100: 100, AZ150: 150 };
export const TCT_OPTIONS = [0.25, 0.30, 0.35, 0.40, 0.45, 0.50];

/**
 * Layer thicknesses and masses for one ordered spec.
 * @param {{tctMm: number, coatingClass: keyof typeof COATING_CLASSES}} spec
 */
export function sectionFor({ tctMm, coatingClass }) {
  const massPerSideGm2 = COATING_CLASSES[coatingClass] / 2;
  // g/m² → kg/m², ÷ kg/m³ gives metres, ×1000 gives mm. AZ150 → 0.0200 mm per side.
  const coatingMm = ((massPerSideGm2 / 1000) / COATING_DENSITY_KG_M3) * 1000;
  const baseMm = tctMm - 2 * coatingMm;
  return {
    coatingMm,
    baseMm,
    tctMm,
    coatingMassGm2: COATING_CLASSES[coatingClass],
    sheetMassKgM2: (baseMm / 1000) * STEEL_DENSITY_KG_M3 + (COATING_CLASSES[coatingClass] / 1000)
  };
}

/** 45° section hatch: how a steel core is drawn on a technical section. */
function hatchTexture(ink) {
  const size = 32;
  const canvas = Object.assign(document.createElement('canvas'), { width: size, height: size });
  const context = canvas.getContext('2d');
  context.fillStyle = '#a8b7ac';
  context.fillRect(0, 0, size, size);
  context.strokeStyle = ink;
  context.lineWidth = 1.4;
  for (let offset = -size; offset < size * 2; offset += 8) {
    context.beginPath();
    context.moveTo(offset, 0);
    context.lineTo(offset + size, size);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(9, 1);
  return texture;
}

export function createScene({ scene, camera, look, invalidate, viewport }) {
  const materials = createMaterialCache();
  const geometries = [];
  const track = (geometry) => { geometries.push(geometry); return geometry; };

  scene.background = new THREE.Color(look.palette.paper);
  const sun = createSunRig(scene, look.light);

  // Blueprint grid the coupon sits above: the drawing's coordinate paper, in 3D.
  const grid = new THREE.GridHelper(1.2, 24, look.palette.gridStrong, look.palette.grid);
  grid.position.y = -0.12;
  scene.add(grid);

  const hatch = hatchTexture(look.palette.ink);
  const coatingMaterial = materials.get({ color: look.palette.coating, roughness: 0.35, metalness: 0.55 });
  const baseMaterial = new THREE.MeshStandardMaterial({ map: hatch, roughness: 0.75, metalness: 0.2 });
  const unitBox = track(new THREE.BoxGeometry(1, 1, 1));
  const edgeGeometry = track(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)));
  const edgeMaterial = new THREE.LineBasicMaterial({ color: look.palette.ink, transparent: true, opacity: 0.75 });

  /** One drawn layer: a solid box plus the ink outline that makes it read as a drawing. */
  function layer(material) {
    const group = new THREE.Group();
    const solid = new THREE.Mesh(unitBox, material);
    const outline = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    group.add(solid, outline);
    return { group, solid, outline };
  }

  const stack = new THREE.Group();
  scene.add(stack);
  const layers = {
    top: layer(coatingMaterial),
    base: layer(baseMaterial),
    bottom: layer(coatingMaterial)
  };
  for (const part of Object.values(layers)) stack.add(part.group);

  const labels = createLabelLayer(viewport, camera);
  const micron = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });
  const twoDecimals = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const spec = { tctMm: 0.4, coatingClass: 'AZ100', explode: 0.55, thicknessScale: 160 };
  let section = sectionFor(spec);
  const drawn = { top: 0, base: 0, bottom: 0, topY: 0, baseY: 0, bottomY: 0 };

  // Label anchors sit on the drawing, so they have to turn with it: the stack's own Y rotation is
  // applied to each anchor rather than letting the callout drift off its layer.
  const anchor = (x, y, z) => () => {
    const a = stack.rotation.y;
    return [x * Math.cos(a) + z * Math.sin(a), y, z * Math.cos(a) - x * Math.sin(a)];
  };
  const edge = COUPON.width / 2 + 0.03;
  const front = COUPON.depth / 2;
  const labelTop = labels.add('', () => anchor(-edge, drawn.topY, front)(), 'ink', 'right');
  const labelBase = labels.add('', () => anchor(-edge, drawn.baseY, front)(), 'ink', 'right');
  const labelBottom = labels.add('', () => anchor(-edge, drawn.bottomY, front)(), 'ink', 'right');
  const labelTotal = labels.add('', () => anchor(edge + 0.01, 0, -front)(), 'green', 'left');

  function apply(next = {}) {
    Object.assign(spec, next);
    section = sectionFor(spec);
    const scale = spec.thicknessScale;
    drawn.top = (section.coatingMm / 1000) * scale;
    drawn.bottom = drawn.top;
    drawn.base = (section.baseMm / 1000) * scale;

    const gap = EXPLODE_GAP * spec.explode;
    drawn.baseY = 0;
    drawn.topY = drawn.base / 2 + drawn.top / 2 + gap;
    drawn.bottomY = -(drawn.base / 2 + drawn.bottom / 2 + gap);

    for (const [name, part] of Object.entries(layers)) {
      part.group.position.y = drawn[`${name}Y`];
      const height = drawn[name];
      part.solid.scale.set(COUPON.width, height, COUPON.depth);
      part.outline.scale.copy(part.solid.scale);
    }

    labelTop.element.innerHTML = `<b>${micron.format(section.coatingMm * 1000)} µm</b><i>Mạ nhôm-kẽm mặt trên</i>`;
    labelBase.element.innerHTML = `<b>${micron.format(section.baseMm * 1000)} µm</b><i>Thép nền cán nguội (SPCC)</i>`;
    labelBottom.element.innerHTML = `<b>${micron.format(section.coatingMm * 1000)} µm</b><i>Mạ nhôm-kẽm mặt dưới</i>`;
    labelTotal.element.innerHTML =
      `<b>${twoDecimals.format(section.tctMm)} mm</b><i>Dày toàn phần · ${spec.coatingClass}</i>`;

    // Closed up, the three coating/base callouts land on top of each other and on the drawing.
    // A shut section is one solid edge, so it gets one dimension: the total.
    const separated = spec.explode > 0.12;
    for (const label of [labelTop, labelBottom]) {
      label.element.style.display = separated ? '' : 'none';
    }

    invalidate();
    return section;
  }
  apply();

  return {
    spec,
    get section() { return section; },
    apply,
    /** @returns {boolean} true while the drawing is turning on its vertical axis. */
    update(dt) {
      labels.update();
      if (dt <= 0) return false;
      stack.rotation.y += dt * 0.12;
      return true;
    },
    dispose() {
      sun.dispose();
      labels.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
      for (const geometry of geometries) geometry.dispose();
      edgeMaterial.dispose();
      baseMaterial.dispose();
      hatch.dispose();
      materials.dispose();
    }
  };
}
