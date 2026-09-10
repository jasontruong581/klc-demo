// Mẫu 10 — Corporate Light 3D.
//
// Subject: the quote form is the model. Product, gauge, width, length and sheet count are the
// authoritative state; the bundle on the turntable is rebuilt from them at true scale, and the
// weight, bundle height and dimension labels are computed from the same numbers the form holds.
// Nothing here is exaggerated: a 1.2 mm sheet really is that thin, which is why the "Cạnh bó"
// view exists — it moves the camera in instead of inflating the geometry.
import * as THREE from 'three';
import {
  createMaterialCache, createStudioRig, createLabelLayer, gradientSky, STEEL, STEEL_DENSITY_KG_M3
} from '../assets/klc3d/scene-kit.js';

/** Real catalogue limits per product line; the form reads its options from here. */
export const PRODUCTS = {
  crc: { ...STEEL.crc, code: 'CRC · SPCC', gauges: [0.4, 0.6, 0.8, 1.0, 1.2, 1.6, 2.0, 3.0], widths: [1000, 1250] },
  hrc: { ...STEEL.hrc, code: 'HRC · SS400', gauges: [1.5, 2.0, 3.0, 4.5, 6.0, 8.0, 12.0], widths: [1250, 1500] },
  gl: { ...STEEL.gl, code: 'GL · AZ100', gauges: [0.25, 0.3, 0.35, 0.4, 0.45, 0.5], widths: [1000, 1200] }
};

const BEARER = 0.1;          // 100 x 100 mm timber bearers under the bundle
const TABLE_TOP = 0.06;      // turntable disc thickness

/** Height of the bundle's underside above the floor, in metres. The page needs it to aim the
 *  close-up view at the cut edge, which moves as the ordered bundle gets taller. */
export const STACK_BASE_Y = TABLE_TOP + BEARER;

/**
 * Theoretical weights and bundle height for one spec. The page and the scene both read this, so
 * the number in the form and the block on screen can never come from different arithmetic.
 * Theoretical only: no rolling or cutting tolerance is applied.
 *
 * @param {{gaugeMm: number, widthMm: number, lengthMm: number, sheets: number}} spec
 */
export function quoteFor({ gaugeMm, widthMm, lengthMm, sheets }) {
  const sheetMassKg = (gaugeMm / 1000) * (widthMm / 1000) * (lengthMm / 1000) * STEEL_DENSITY_KG_M3;
  return {
    sheetMassKg,
    totalMassKg: sheetMassKg * sheets,
    bundleHeightMm: gaugeMm * sheets
  };
}

/** Sheet lamination seen on the cut edge of a bundle: one line per sheet, tiled by sheet count. */
function laminationTexture() {
  const canvas = Object.assign(document.createElement('canvas'), { width: 8, height: 16 });
  const context = canvas.getContext('2d');
  context.fillStyle = '#c8d1d6';
  context.fillRect(0, 0, 8, 16);
  context.fillStyle = 'rgba(58,72,80,.55)';
  context.fillRect(0, 13, 8, 3);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createScene({ renderer, scene, camera, look, invalidate, viewport }) {
  const materials = createMaterialCache();
  const geometries = [];
  const track = (geometry) => { geometries.push(geometry); return geometry; };

  scene.background = gradientSky(look.sky.zenith, look.sky.horizon);
  const studio = createStudioRig(scene, renderer, look.light);

  const floor = new THREE.Mesh(
    track(new THREE.CircleGeometry(24, 64)),
    materials.get({ color: look.palette.floor, roughness: 0.92, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Turntable: the rotation needs a cause the eye can see, so the bundle sits on a disc.
  const turntable = new THREE.Group();
  scene.add(turntable);
  const disc = new THREE.Mesh(
    track(new THREE.CylinderGeometry(1.62, 1.62, TABLE_TOP, 96)),
    materials.get({ color: look.palette.table, roughness: 0.5, metalness: 0.1 }));
  disc.position.y = TABLE_TOP / 2;
  disc.castShadow = true;
  disc.receiveShadow = true;
  turntable.add(disc);

  const bearerMaterial = materials.get({ color: look.palette.timber, roughness: 0.85, metalness: 0 });
  const bearers = [];
  for (const sign of [-1, 1]) {
    const bearer = new THREE.Mesh(track(new THREE.BoxGeometry(1, BEARER, BEARER)), bearerMaterial);
    bearer.position.set(0, TABLE_TOP + BEARER / 2, sign * 0.7);
    bearer.castShadow = true;
    bearer.receiveShadow = true;
    turntable.add(bearer);
    bearers.push(bearer);
  }

  // The bundle: a unit box scaled to the ordered dimensions. Cut edges carry the lamination
  // texture, tiled once per sheet, so the drawn edge always shows the ordered sheet count.
  const lamination = laminationTexture();
  const edgeMaterial = new THREE.MeshStandardMaterial({ map: lamination, roughness: 0.45, metalness: 0.6 });
  const faceMaterial = new THREE.MeshStandardMaterial({ color: STEEL.crc.color, roughness: STEEL.crc.roughness, metalness: STEEL.crc.metalness });
  const bundle = new THREE.Mesh(track(new THREE.BoxGeometry(1, 1, 1)),
    [edgeMaterial, edgeMaterial, faceMaterial, faceMaterial, edgeMaterial, edgeMaterial]);
  bundle.castShadow = true;
  bundle.receiveShadow = true;
  turntable.add(bundle);

  // One loose top sheet, set down a few degrees off square: it is what tells the eye the block is
  // a stack of sheets and not a solid slab.
  const topSheet = new THREE.Mesh(track(new THREE.BoxGeometry(1, 1, 1)), faceMaterial);
  topSheet.castShadow = true;
  topSheet.receiveShadow = true;
  turntable.add(topSheet);

  const labels = createLabelLayer(viewport, camera);
  const spec = { product: 'crc', gaugeMm: 1.2, widthMm: 1250, lengthMm: 2500, sheets: 40 };
  const derived = { bundleHeightM: 0, massKg: 0, sheetMassKg: 0 };
  const millimetre = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

  const top = () => TABLE_TOP + BEARER + derived.bundleHeightM;
  // The turntable spins, so each callout's anchor is rotated with it and the box is pushed clear
  // of the bundle rather than centred on its edge.
  const spun = (x, y, z) => () => {
    const a = turntable.rotation.y;
    return [x * Math.cos(a) + z * Math.sin(a), y, z * Math.cos(a) - x * Math.sin(a)];
  };
  const widthLabel = labels.add('', () => spun(0, top() + 0.04, -spec.lengthMm / 2000 - 0.12)());
  const lengthLabel = labels.add(
    '', () => spun(spec.widthMm / 2000 + 0.14, top() + 0.04, 0)(), '', 'left');
  const heightLabel = labels.add(
    '', () => spun(-spec.widthMm / 2000 - 0.14, TABLE_TOP + BEARER + derived.bundleHeightM / 2,
      (spec.lengthMm / 2000) * 0.5)(), '', 'right');

  function apply(next = {}) {
    Object.assign(spec, next);
    const product = PRODUCTS[spec.product];
    const t = spec.gaugeMm / 1000;
    const w = spec.widthMm / 1000;
    const l = spec.lengthMm / 1000;
    const quote = quoteFor(spec);
    const height = quote.bundleHeightMm / 1000;

    derived.bundleHeightM = height;
    derived.sheetMassKg = quote.sheetMassKg;
    derived.massKg = quote.totalMassKg;

    faceMaterial.color.set(product.color);
    faceMaterial.roughness = product.roughness;
    faceMaterial.metalness = product.metalness;
    edgeMaterial.metalness = product.metalness * 0.7;

    bundle.scale.set(w, height, l);
    bundle.position.set(0, TABLE_TOP + BEARER + height / 2, 0);
    // One tile per sheet on the cut edge; u is stretched to keep the lines square-ish.
    lamination.repeat.set(Math.max(1, Math.round(l * 6)), spec.sheets);

    topSheet.scale.set(w, t, l);
    topSheet.position.set(0.012, TABLE_TOP + BEARER + height + t / 2, 0.02);
    topSheet.rotation.y = THREE.MathUtils.degToRad(1.6);

    for (const bearer of bearers) {
      bearer.scale.x = w + 0.16;
      bearer.position.z = Math.min(0.7, l / 2 - 0.25) * Math.sign(bearer.position.z);
    }

    widthLabel.element.innerHTML = `<b>${millimetre.format(spec.widthMm)}</b><i>khổ rộng, mm</i>`;
    lengthLabel.element.innerHTML = `<b>${millimetre.format(spec.lengthMm)}</b><i>chiều dài, mm</i>`;
    heightLabel.element.innerHTML = `<b>${millimetre.format(height * 1000)}</b><i>cao bó, mm</i>`;

    invalidate();
    return derived;
  }

  apply();

  return {
    spec,
    derived,
    apply,
    /** Squares the turntable back to 0°, so a named view frames the face it promises. */
    squareUp() { turntable.rotation.y = 0; invalidate(); },
    /** @returns {boolean} true while the turntable is turning. */
    update(dt) {
      labels.update();
      if (dt <= 0) return false;
      turntable.rotation.y += dt * 0.16;
      return true;
    },
    dispose() {
      studio.dispose();
      labels.dispose();
      for (const geometry of geometries) geometry.dispose();
      edgeMaterial.dispose();
      faceMaterial.dispose();
      lamination.dispose();
      materials.dispose();
      scene.background?.dispose?.();
    }
  };
}
