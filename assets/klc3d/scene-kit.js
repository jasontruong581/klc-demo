// Scene building blocks shared by the 3D concepts: lighting rigs, a material cache, the steel
// material direction, deterministic jitter, a gradient sky and an HTML label layer.
//
// Light values follow the 3dviz-pro-max lighting rigs (dark-studio and dusk-golden-hour), retuned
// for the KLC palette. Change elevation and azimuth before intensity: they set where shadows point.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/**
 * Real surface identity per product line, so a material switch means something.
 * CRC is bright and smooth off the cold mill, HRC keeps mill scale, galvalume is a spangled
 * aluminium-zinc coating. Roughness values are art direction, not measurements.
 */
export const STEEL = {
  crc: { label: 'Thép cán nguội (CRC)', color: '#c9d2d9', roughness: 0.22, metalness: 0.95 },
  hrc: { label: 'Thép cán nóng (HRC)', color: '#7e878e', roughness: 0.62, metalness: 0.82 },
  gl: { label: 'Tôn lạnh (GL)', color: '#dfe6e6', roughness: 0.34, metalness: 0.88 }
};

/** Steel density used for every weight readout in these pages: 7.85 g/cm³ = 7850 kg/m³. */
export const STEEL_DENSITY_KG_M3 = 7850;

/** Deterministic jitter (mulberry32) so the same page always draws the same arrangement. */
export function makeRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1 x 256 vertical gradient used as scene.background: cheap, tinted, never flat black. */
export function gradientSky(zenith, horizon) {
  const canvas = Object.assign(document.createElement('canvas'), { width: 1, height: 256 });
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, zenith);
  gradient.addColorStop(1, horizon);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Shares one MeshStandardMaterial per distinct set of values, and disposes them together. */
export function createMaterialCache() {
  const materials = new Map();
  return {
    get({ color, roughness = 0.7, metalness = 0, emissive = '#000000', emissiveIntensity = 0,
      transparent = false, opacity = 1, side = THREE.FrontSide, flatShading = false }) {
      const key = [color, roughness, metalness, emissive, emissiveIntensity, transparent, opacity, side, flatShading].join('|');
      if (!materials.has(key)) {
        materials.set(key, new THREE.MeshStandardMaterial({
          color, roughness, metalness, emissive, emissiveIntensity,
          transparent, opacity, side, flatShading
        }));
      }
      return materials.get(key);
    },
    dispose() {
      for (const material of materials.values()) material.dispose();
      materials.clear();
    }
  };
}

/**
 * Product studio: a RoomEnvironment plus three rectangular panels and one weak directional light
 * for the contact shadow (RectAreaLight casts none). Panel size in metres decides the shape of the
 * reflection that reads a steel surface, so change width and height before intensity.
 */
export function createStudioRig(scene, renderer, options = {}) {
  RectAreaLightUniformsLib.init();
  const settings = {
    subject: [0, 0.4, 0], environmentIntensity: 0.35, distance: 3.2,
    key: { color: '#ffffff', intensity: 10, width: 1.6, height: 2.2, elevationDeg: 38, azimuthDeg: 315 },
    fill: { color: '#eaf2ff', intensity: 3.5, width: 2.4, height: 1.4, elevationDeg: 14, azimuthDeg: 70 },
    rim: { color: '#ffffff', intensity: 7, width: 0.5, height: 1.8, elevationDeg: 24, azimuthDeg: 170 },
    contact: { color: '#ffffff', intensity: 0.35, mapSize: 2048, bias: -0.0001, normalBias: 0.02, extent: 6 },
    ...options
  };
  const subject = new THREE.Vector3(...settings.subject);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = settings.environmentIntensity;

  const panels = {};
  for (const name of ['key', 'fill', 'rim']) {
    const panel = settings[name];
    if (!panel || panel.intensity <= 0) continue;
    const light = new THREE.RectAreaLight(panel.color, panel.intensity, panel.width, panel.height);
    light.position.setFromSphericalCoords(
      settings.distance,
      THREE.MathUtils.degToRad(90 - panel.elevationDeg),
      THREE.MathUtils.degToRad(panel.azimuthDeg)).add(subject);
    light.lookAt(subject);
    scene.add(light);
    panels[name] = light;
  }

  const contact = new THREE.DirectionalLight(settings.contact.color, settings.contact.intensity);
  contact.position.set(subject.x, subject.y + 5, subject.z + 1.2);
  contact.target.position.copy(subject);
  contact.castShadow = true;
  contact.shadow.mapSize.set(settings.contact.mapSize, settings.contact.mapSize);
  contact.shadow.bias = settings.contact.bias;
  contact.shadow.normalBias = settings.contact.normalBias;
  const box = contact.shadow.camera;
  box.left = box.bottom = -settings.contact.extent;
  box.right = box.top = settings.contact.extent;
  box.updateProjectionMatrix();
  scene.add(contact, contact.target);

  return {
    ...panels, contact, environment, settings,
    dispose() {
      for (const light of [panels.key, panels.fill, panels.rim, contact]) {
        if (!light) continue;
        light.parent?.remove(light);
        light.shadow?.map?.dispose();
        light.dispose?.();
      }
      contact.target.parent?.remove(contact.target);
      scene.environment = null;
      environment.dispose();
      pmrem.dispose();
    }
  };
}

/**
 * Directional key / hemisphere fill / rim set for the open-air and hall scenes.
 * elevationDeg and azimuthDeg set where every shadow points; tune those first.
 */
export function createSunRig(scene, options = {}) {
  const settings = {
    castShadow: true,
    color: '#ffd9b0', intensity: 2.6, elevationDeg: 34, azimuthDeg: 235,
    rimColor: '#8ae7b6', rimIntensity: 0.9, rimElevationDeg: 14, rimAzimuthDeg: 60,
    skyColor: '#8ba0b5', groundColor: '#2b3630', fillIntensity: 0.55,
    shadowExtent: 14, mapSize: 2048, bias: -0.0002, normalBias: 0.03, distance: 26,
    ...options
  };
  const place = (light, elevationDeg, azimuthDeg) => light.position.setFromSphericalCoords(
    settings.distance,
    THREE.MathUtils.degToRad(90 - elevationDeg),
    THREE.MathUtils.degToRad(azimuthDeg));

  const key = new THREE.DirectionalLight(settings.color, settings.intensity);
  place(key, settings.elevationDeg, settings.azimuthDeg);
  key.castShadow = settings.castShadow;
  if (key.castShadow) {
    key.shadow.mapSize.set(settings.mapSize, settings.mapSize);
    key.shadow.bias = settings.bias;
    key.shadow.normalBias = settings.normalBias;
    const box = key.shadow.camera;
    box.left = box.bottom = -settings.shadowExtent;
    box.right = box.top = settings.shadowExtent;
    box.far = settings.distance * 2;
    box.updateProjectionMatrix();
  }
  scene.add(key);

  const fill = new THREE.HemisphereLight(settings.skyColor, settings.groundColor, settings.fillIntensity);
  scene.add(fill);

  let rim = null;
  if (settings.rimIntensity > 0) {
    rim = new THREE.DirectionalLight(settings.rimColor, settings.rimIntensity);
    place(rim, settings.rimElevationDeg, settings.rimAzimuthDeg);
    scene.add(rim);
  }

  return {
    key, fill, rim, settings,
    dispose() {
      for (const light of [key, fill, rim]) {
        if (!light) continue;
        light.parent?.remove(light);
        light.shadow?.map?.dispose();
        light.dispose?.();
      }
    }
  };
}

/**
 * HTML labels pinned to world points. Real DOM text stays selectable, translatable and readable
 * by a screen reader, which an in-canvas sprite is not.
 *
 * @param {HTMLElement} container - positioned ancestor of the canvas.
 * @param {THREE.Camera} camera
 */
export function createLabelLayer(container, camera) {
  const layer = document.createElement('div');
  layer.className = 'label-layer';
  container.append(layer);
  const entries = [];
  const point = new THREE.Vector3();
  // Where the box sits relative to its anchor. A callout on the left of an object has to end at
  // the anchor, not straddle it, or it covers the thing it is labelling.
  const ALIGN = { center: '-50%', right: '-100%', left: '0%' };

  return {
    /**
     * @param {string} html - label content.
     * @param {() => number[]} at - world position of the anchor, evaluated every update.
     * @param {string} [className] - extra class for per-concept styling.
     * @param {'center'|'left'|'right'} [align] - 'right' puts the box left of the anchor.
     */
    add(html, at, className = '', align = 'center') {
      const element = document.createElement('div');
      element.className = `label ${className}`.trim();
      element.innerHTML = html;
      layer.append(element);
      const entry = { element, at, align: ALIGN[align] ?? ALIGN.center };
      entries.push(entry);
      return entry;
    },
    update() {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      for (const entry of entries) {
        point.set(...entry.at()).project(camera);
        const behind = point.z > 1;
        entry.element.style.opacity = behind ? '0' : '1';
        entry.element.style.transform = `translate(${entry.align}, -50%) `
          + `translate(${(point.x * 0.5 + 0.5) * width}px, ${(-point.y * 0.5 + 0.5) * height}px)`;
      }
    },
    dispose() {
      entries.length = 0;
      layer.remove();
    }
  };
}

/**
 * A steel coil wound from one continuous strip: the wound mass as an Archimedean-spiral surface
 * plus a mandrel bore. Turns are real turns, so the end face shows genuine winding rather than a
 * stack of concentric tubes.
 *
 * @param {object} options
 * @param {number} options.innerRadius - bore radius in metres.
 * @param {number} options.outerRadius - coil outside radius in metres.
 * @param {number} options.width - coil width along its axis, in metres.
 * @param {number} options.turns - number of wraps drawn.
 * @param {number} [options.segmentsPerTurn]
 * @returns {THREE.BufferGeometry} a double-sided strip surface, axis along +Y.
 */
export function coilStripGeometry({ innerRadius, outerRadius, width, turns, segmentsPerTurn = 96 }) {
  const steps = Math.round(turns * segmentsPerTurn);
  const growth = (outerRadius - innerRadius) / (turns * Math.PI * 2);
  const positions = new Float32Array((steps + 1) * 2 * 3);
  const normals = new Float32Array((steps + 1) * 2 * 3);
  const uvs = new Float32Array((steps + 1) * 2 * 2);
  const indices = [];

  for (let i = 0; i <= steps; i++) {
    const theta = (i / segmentsPerTurn) * Math.PI * 2;
    const radius = innerRadius + growth * theta;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    for (let j = 0; j < 2; j++) {
      const index = (i * 2 + j) * 3;
      positions[index] = x;
      positions[index + 1] = (j === 0 ? -0.5 : 0.5) * width;
      positions[index + 2] = z;
      normals[index] = Math.cos(theta);
      normals[index + 1] = 0;
      normals[index + 2] = Math.sin(theta);
      const uv = (i * 2 + j) * 2;
      uvs[uv] = i / steps;
      uvs[uv + 1] = j;
    }
    if (i < steps) {
      const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}
