import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const SCENE_SELECTOR = '[data-klc-scene]';
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
const instances = new Set();

function steelMaterial(color = 0xb9c2ca, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.9,
    roughness: 0.24,
    ...options,
  });
}

function addStandardLights(scene, cool = 0x9bc7ff, warm = 0xffd2a1) {
  const hemisphere = new THREE.HemisphereLight(0xdcecff, 0x111827, 1.65);
  const key = new THREE.DirectionalLight(cool, 4.5);
  const rim = new THREE.DirectionalLight(warm, 3.2);
  key.position.set(4, 6, 5);
  rim.position.set(-5, 2, -4);
  scene.add(hemisphere, key, rim);
}

function createIndustrialCoil(scene) {
  scene.background = new THREE.Color(0x07090c);
  scene.fog = new THREE.FogExp2(0x07090c, 0.065);
  addStandardLights(scene, 0x9ec9ff, 0xff7a35);

  const root = new THREE.Group();
  root.rotation.set(-0.08, -0.34, -0.06);
  scene.add(root);

  const profile = [
    new THREE.Vector2(0.58, -0.58),
    new THREE.Vector2(1.58, -0.58),
    new THREE.Vector2(1.58, 0.58),
    new THREE.Vector2(0.58, 0.58),
    new THREE.Vector2(0.58, -0.58),
  ];
  const coil = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 96),
    steelMaterial(0x9aa3ab, { roughness: 0.19 }),
  );
  coil.rotation.z = Math.PI / 2;
  coil.position.y = 0.12;
  root.add(coil);

  const edgeMaterial = steelMaterial(0xe7edf2, { roughness: 0.12 });
  for (const x of [-0.6, 0.6]) {
    const lip = new THREE.Mesh(new THREE.TorusGeometry(1.09, 0.49, 12, 96), edgeMaterial);
    lip.rotation.y = Math.PI / 2;
    lip.position.set(x, 0.12, 0);
    root.add(lip);
  }

  const bandMaterial = new THREE.MeshStandardMaterial({ color: 0x252a30, metalness: 0.7, roughness: 0.4 });
  for (const angle of [-0.7, 0.7]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.61, 0.035, 8, 96), bandMaterial);
    band.rotation.y = Math.PI / 2;
    band.rotation.x = angle * 0.04;
    root.add(band);
  }

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.8, 72),
    new THREE.MeshStandardMaterial({ color: 0x11161b, metalness: 0.35, roughness: 0.72 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.5;
  scene.add(floor);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(2.25, 2.3, 96),
    new THREE.MeshBasicMaterial({ color: 0xe05f24, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -1.48;
  scene.add(halo);

  return {
    cameraPosition: [4.5, 2.25, 5.5],
    lookAt: [0, 0, 0],
    update(time) {
      root.rotation.y = -0.34 + Math.sin(time * 0.38) * 0.1;
      halo.material.opacity = 0.34 + Math.sin(time * 1.2) * 0.08;
    },
  };
}

function createProductShowroom(scene) {
  scene.background = new THREE.Color(0xf3f6f8);
  addStandardLights(scene, 0xffffff, 0xc9dcff);

  const root = new THREE.Group();
  root.position.y = -0.3;
  scene.add(root);

  const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0xe4e9ed, roughness: 0.7, metalness: 0.08 });
  const darkSteel = steelMaterial(0x66717a, { roughness: 0.27 });
  const brightSteel = steelMaterial(0xd5dce0, { roughness: 0.17 });
  const zincSteel = steelMaterial(0xaebec5, { roughness: 0.31 });
  const productGroups = [];

  for (const x of [-2.2, 0, 2.2]) {
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.94, 1.08, 0.22, 48), pedestalMaterial);
    pedestal.position.set(x, -1.05, 0);
    root.add(pedestal);
  }

  const hotRoll = new THREE.Group();
  const hotProfile = [
    new THREE.Vector2(0.32, -0.48), new THREE.Vector2(0.9, -0.48),
    new THREE.Vector2(0.9, 0.48), new THREE.Vector2(0.32, 0.48), new THREE.Vector2(0.32, -0.48),
  ];
  const hotCoil = new THREE.Mesh(new THREE.LatheGeometry(hotProfile, 64), darkSteel);
  hotCoil.rotation.z = Math.PI / 2;
  hotRoll.add(hotCoil);
  hotRoll.position.set(-2.2, -0.16, 0);
  hotRoll.userData.baseY = hotRoll.position.y;
  root.add(hotRoll);
  productGroups.push(hotRoll);

  const sheetStack = new THREE.Group();
  for (let index = 0; index < 7; index += 1) {
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.055, 1.15), brightSteel);
    sheet.position.y = index * 0.085;
    sheet.position.x = (index - 3) * 0.015;
    sheetStack.add(sheet);
  }
  sheetStack.position.set(0, -0.72, 0);
  sheetStack.userData.baseY = sheetStack.position.y;
  root.add(sheetStack);
  productGroups.push(sheetStack);

  const zincRoll = new THREE.Group();
  for (let index = 0; index < 3; index += 1) {
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.25, 48, 1, true), zincSteel);
    roll.rotation.z = Math.PI / 2;
    roll.position.set(0, index * 0.58 - 0.46, 0);
    zincRoll.add(roll);
  }
  zincRoll.position.set(2.2, -0.26, 0);
  zincRoll.userData.baseY = zincRoll.position.y;
  root.add(zincRoll);
  productGroups.push(zincRoll);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 9),
    new THREE.MeshStandardMaterial({ color: 0xe9eef1, roughness: 0.82, metalness: 0.05 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.4;
  scene.add(floor);

  const backArc = new THREE.Mesh(
    new THREE.TorusGeometry(3.8, 0.025, 8, 96, Math.PI * 1.25),
    new THREE.MeshBasicMaterial({ color: 0x174f84, transparent: true, opacity: 0.22 }),
  );
  backArc.position.set(0, 0.2, -1.8);
  backArc.rotation.z = -0.15;
  scene.add(backArc);

  return {
    cameraPosition: [5.7, 3.4, 7.7],
    lookAt: [0, -0.1, 0],
    update(time) {
      productGroups.forEach((group, index) => {
        group.position.y = group.userData.baseY + Math.sin(time * 0.75 + index * 1.8) * 0.025;
        group.rotation.y = Math.sin(time * 0.32 + index) * 0.09;
      });
    },
  };
}

function makeLine(points, material) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
}

function createExplodedBlueprint(scene) {
  scene.background = new THREE.Color(0x061a2e);
  scene.fog = new THREE.FogExp2(0x061a2e, 0.055);
  addStandardLights(scene, 0x79caff, 0x38f2d0);

  const root = new THREE.Group();
  root.rotation.set(-0.18, -0.45, 0.04);
  scene.add(root);

  const layerColors = [0x8edcff, 0x4db6e8, 0x2887bd, 0x8eeedb];
  const layers = [];
  for (let index = 0; index < 5; index += 1) {
    const geometry = new THREE.BoxGeometry(3.55 - index * 0.11, 0.11, 2.25 - index * 0.07);
    const material = new THREE.MeshPhysicalMaterial({
      color: layerColors[index % layerColors.length],
      metalness: 0.5,
      roughness: 0.25,
      transparent: true,
      opacity: 0.56,
      transmission: 0.08,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = (index - 2) * 0.55;
    root.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0xb8efff, transparent: true, opacity: 0.78 }),
    );
    mesh.add(edges);
    layers.push(mesh);
  }

  const guideMaterial = new THREE.LineDashedMaterial({ color: 0x5bd7ff, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.52 });
  for (const x of [-1.65, 1.65]) {
    for (const z of [-0.98, 0.98]) {
      const guide = makeLine([new THREE.Vector3(x, -1.55, z), new THREE.Vector3(x, 1.55, z)], guideMaterial);
      guide.computeLineDistances();
      root.add(guide);
    }
  }

  const grid = new THREE.GridHelper(10, 20, 0x1682b7, 0x0b4667);
  grid.position.y = -1.75;
  grid.material.transparent = true;
  grid.material.opacity = 0.48;
  scene.add(grid);

  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(2.75, 0.012, 5, 128),
    new THREE.MeshBasicMaterial({ color: 0x31d9cf, transparent: true, opacity: 0.5 }),
  );
  orbit.rotation.x = Math.PI / 2.5;
  scene.add(orbit);

  return {
    cameraPosition: [5.1, 3.6, 6.4],
    lookAt: [0, -0.05, 0],
    update(time) {
      root.rotation.y = -0.45 + Math.sin(time * 0.3) * 0.12;
      orbit.rotation.z = time * 0.14;
      layers.forEach((layer, index) => {
        layer.position.y = (index - 2) * (0.55 + Math.sin(time * 0.7) * 0.018);
      });
    },
  };
}

function createRibbonGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.2, -0.9, 0.2),
    new THREE.Vector3(-2.1, 1.15, -0.45),
    new THREE.Vector3(-0.7, 0.15, 0.55),
    new THREE.Vector3(0.65, -0.65, -0.25),
    new THREE.Vector3(2.05, 1.0, 0.25),
    new THREE.Vector3(3.2, 0.25, -0.35),
  ], false, 'catmullrom', 0.42);
  const segments = 128;
  const halfWidth = 0.42;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const sideways = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 0, 1)).normalize();
    if (sideways.lengthSq() < 0.01) sideways.set(1, 0, 0);
    const twist = t * Math.PI * 2.15;
    const normal = new THREE.Vector3().crossVectors(tangent, sideways).normalize();
    const offset = sideways.multiplyScalar(Math.cos(twist)).add(normal.multiplyScalar(Math.sin(twist))).normalize();
    positions.push(
      point.x + offset.x * halfWidth, point.y + offset.y * halfWidth, point.z + offset.z * halfWidth,
      point.x - offset.x * halfWidth, point.y - offset.y * halfWidth, point.z - offset.z * halfWidth,
    );
    uvs.push(t, 0, t, 1);
    if (index < segments) {
      const vertex = index * 2;
      indices.push(vertex, vertex + 2, vertex + 1, vertex + 2, vertex + 3, vertex + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createMetalRibbon(scene) {
  scene.background = new THREE.Color(0x071811);
  scene.fog = new THREE.FogExp2(0x071811, 0.05);
  addStandardLights(scene, 0xbfffe1, 0xffe0a8);

  const root = new THREE.Group();
  root.rotation.y = -0.12;
  scene.add(root);

  const ribbon = new THREE.Mesh(
    createRibbonGeometry(),
    new THREE.MeshPhysicalMaterial({
      color: 0xa9c6b7,
      metalness: 0.93,
      roughness: 0.16,
      clearcoat: 0.85,
      clearcoatRoughness: 0.2,
      side: THREE.DoubleSide,
    }),
  );
  root.add(ribbon);

  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x58d68d, transparent: true, opacity: 0.38 });
  for (let index = 0; index < 3; index += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6 + index * 0.48, 0.012, 5, 96), ringMaterial.clone());
    ring.rotation.set(Math.PI / 2, index * 0.32, index * 0.55);
    root.add(ring);
  }

  const particlesGeometry = new THREE.BufferGeometry();
  const particles = [];
  for (let index = 0; index < 90; index += 1) {
    const angle = index * 2.39996;
    const radius = 1.8 + (index % 11) * 0.17;
    particles.push(Math.cos(angle) * radius, ((index * 17) % 31) * 0.1 - 1.5, Math.sin(angle) * radius * 0.42 - 1.1);
  }
  particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
  const points = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({ color: 0x8af0b8, size: 0.035, transparent: true, opacity: 0.62, sizeAttenuation: true }),
  );
  scene.add(points);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5, 72),
    new THREE.MeshStandardMaterial({ color: 0x0b2418, roughness: 0.78, metalness: 0.16 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.75;
  scene.add(floor);

  return {
    cameraPosition: [0.8, 2.5, 7.6],
    lookAt: [0, 0, 0],
    update(time) {
      root.rotation.y = -0.12 + Math.sin(time * 0.3) * 0.14;
      root.rotation.x = Math.sin(time * 0.22) * 0.025;
      points.rotation.y = time * 0.035;
    },
  };
}

const sceneFactories = {
  'industrial-coil': createIndustrialCoil,
  'product-showroom': createProductShowroom,
  'exploded-blueprint': createExplodedBlueprint,
  'metal-ribbon': createMetalRibbon,
};

function disposeMaterial(material) {
  for (const value of Object.values(material)) {
    if (value && value.isTexture) value.dispose();
  }
  material.dispose();
}

function initScene(container) {
  const sceneName = container.dataset.klcScene;
  const factory = sceneFactories[sceneName];
  const canvas = container.querySelector('canvas');
  const fallback = container.querySelector('.scene-fallback');
  if (!factory || !(canvas instanceof HTMLCanvasElement)) return;

  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('role', 'presentation');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
  } catch (error) {
    container.dataset.sceneState = 'fallback';
    console.warn(`[KLC 3D] WebGL unavailable for ${sceneName}.`, error);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  let sceneState;
  try {
    sceneState = factory(scene);
    camera.position.fromArray(sceneState.cameraPosition);
    camera.lookAt(new THREE.Vector3().fromArray(sceneState.lookAt));
  } catch (error) {
    renderer.dispose();
    container.dataset.sceneState = 'fallback';
    console.warn(`[KLC 3D] Scene setup failed for ${sceneName}.`, error);
    return;
  }

  const baseCameraPosition = camera.position.clone();
  const pointerTarget = new THREE.Vector2();
  const pointerCurrent = new THREE.Vector2();
  const clock = new THREE.Clock();
  let animationFrame = 0;
  let isVisible = true;
  let isDisposed = false;
  let hasRendered = false;

  function resize() {
    if (isDisposed) return;
    const bounds = container.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width || canvas.clientWidth || 640));
    const height = Math.max(1, Math.round(bounds.height || canvas.clientHeight || 480));
    const dprCap = REDUCED_MOTION.matches ? 1.25 : 1.75;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function renderFrame(animate = true) {
    if (isDisposed) return;
    const elapsed = clock.getElapsedTime();
    if (animate) {
      pointerCurrent.lerp(pointerTarget, 0.045);
      camera.position.x = baseCameraPosition.x + pointerCurrent.x * 0.32;
      camera.position.y = baseCameraPosition.y + pointerCurrent.y * 0.2;
      camera.lookAt(new THREE.Vector3().fromArray(sceneState.lookAt));
      sceneState.update?.(elapsed);
    }
    renderer.render(scene, camera);
    if (!hasRendered) {
      hasRendered = true;
      container.dataset.sceneState = 'ready';
      container.classList.add('klc-3d-ready', 'is-3d-ready');
      if (fallback) fallback.hidden = true;
    }
  }

  function shouldAnimate() {
    return !isDisposed && isVisible && !document.hidden && !REDUCED_MOTION.matches;
  }

  function tick() {
    animationFrame = 0;
    if (!shouldAnimate()) return;
    renderFrame(true);
    animationFrame = requestAnimationFrame(tick);
  }

  function schedule() {
    if (shouldAnimate() && !animationFrame) {
      clock.getDelta();
      animationFrame = requestAnimationFrame(tick);
    } else if (!shouldAnimate() && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  function onPointerMove(event) {
    if (REDUCED_MOTION.matches) return;
    const bounds = container.getBoundingClientRect();
    pointerTarget.set(
      THREE.MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1),
      THREE.MathUtils.clamp(-(((event.clientY - bounds.top) / bounds.height) * 2 - 1), -1, 1),
    );
  }

  function onPointerLeave() {
    pointerTarget.set(0, 0);
  }

  function onVisibilityChange() {
    schedule();
    if (!document.hidden && (REDUCED_MOTION.matches || !isVisible)) renderFrame(false);
  }

  function onMotionPreferenceChange() {
    if (REDUCED_MOTION.matches) {
      pointerTarget.set(0, 0);
      pointerCurrent.set(0, 0);
      camera.position.copy(baseCameraPosition);
      renderFrame(false);
    }
    schedule();
  }

  function onContextLost(event) {
    event.preventDefault();
    container.dataset.sceneState = 'fallback';
    container.classList.remove('klc-3d-ready', 'is-3d-ready');
    if (fallback) fallback.hidden = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
    renderFrame(false);
  });
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) renderFrame(false);
    schedule();
  }, { rootMargin: '120px 0px', threshold: 0.01 });

  function dispose() {
    if (isDisposed) return;
    isDisposed = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    REDUCED_MOTION.removeEventListener('change', onMotionPreferenceChange);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    scene.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach(disposeMaterial);
      else if (object.material) disposeMaterial(object.material);
    });
    renderer.renderLists.dispose();
    renderer.dispose();
    instances.delete(dispose);
  }

  resizeObserver.observe(container);
  intersectionObserver.observe(container);
  container.addEventListener('pointermove', onPointerMove, { passive: true });
  container.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  REDUCED_MOTION.addEventListener('change', onMotionPreferenceChange);
  canvas.addEventListener('webglcontextlost', onContextLost, false);
  instances.add(dispose);

  try {
    resize();
    renderFrame(false);
    schedule();
  } catch (error) {
    console.warn(`[KLC 3D] Initial render failed for ${sceneName}.`, error);
    dispose();
  }
}

function initAllScenes() {
  document.querySelectorAll(SCENE_SELECTOR).forEach(initScene);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllScenes, { once: true });
} else {
  initAllScenes();
}

window.addEventListener('pagehide', () => {
  [...instances].forEach((dispose) => dispose());
}, { once: true });
