// Shared WebGL runtime for the 3D concept pages (mẫu 09–12).
//
// Change something here only when it should change for every 3D concept: renderer defaults,
// the demand-driven render loop, the orbit rig, the named-view contract, teardown.
// A concept's look, geometry and interactions live in its own scene.js.
//
// Renderer defaults, the demand-driven loop, the viewer contract and the orbit rig follow the
// 3dviz-pro-max Vite scaffold. See docs/3d-architecture.md.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const TWEEN_SECONDS = 0.8;

/** True when the visitor asked the OS for less animation. Concepts start parked when it is. */
export const prefersReducedMotion = () => matchMedia(REDUCED_MOTION).matches;

/**
 * Demand-driven render loop: a still scene holds no pending animation frame, so the last frame
 * drawn stays on screen. Every wake-up source must call invalidate().
 * @param {{draw: (dt: number) => boolean, fps?: number}} options - draw returns true while
 *   something is still moving.
 */
export function createRenderLoop({ draw, fps = 60 }) {
  let pending = null, previous = null, lastRender = null, active = true, drawing = false, dirty = false;
  const step = 1000 / fps;
  function frame(timestamp) {
    pending = null;
    if (!active) return;
    // The first frame after idle has no previous timestamp. Charging it dt = 0 would make every
    // "did anything move?" answer false, the loop would park, and the next wake-up would be
    // another zero-dt frame - a scene frozen forever. Charge it one frame's worth of time.
    const elapsed = previous === null ? step : timestamp - previous;
    if (lastRender !== null && timestamp - lastRender < step) { pending = requestAnimationFrame(frame); return; }
    previous = timestamp; lastRender = timestamp; dirty = false; drawing = true;
    let moving = false;
    try { moving = draw(Math.min(elapsed / 1000, 0.05)); } finally { drawing = false; }
    if (active && (moving || dirty)) pending = requestAnimationFrame(frame); else previous = null;
  }
  const api = {
    invalidate() {
      dirty = true;
      if (active && !drawing && pending === null) pending = requestAnimationFrame(frame);
    },
    setActive(value) {
      active = value;
      if (active) return api.invalidate();
      if (pending !== null) cancelAnimationFrame(pending);
      pending = previous = lastRender = null;
    },
    dispose() { active = false; if (pending !== null) cancelAnimationFrame(pending); pending = null; }
  };
  return api;
}

function createCamera(look, aspect) {
  const config = look.camera ?? {};
  if (config.kind === 'orthographic') {
    const height = config.frustumHeight ?? 4;
    const camera = new THREE.OrthographicCamera(
      (-height * aspect) / 2, (height * aspect) / 2, height / 2, -height / 2,
      config.near ?? 0.01, config.far ?? 200);
    camera.userData.frustumHeight = height;
    return camera;
  }
  return new THREE.PerspectiveCamera(config.fovDeg ?? 40, aspect, config.near ?? 0.05, config.far ?? 300);
}

/**
 * Orbit camera with damping, named views and a short tween between them. Pointer input cancels
 * the tween: a camera that fights the visitor reads as broken.
 */
function createCameraRig({ camera, canvas, views, limits = {}, invalidate }) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = limits.enablePan ?? false;
  if (camera.isOrthographicCamera) {
    controls.minZoom = limits.minZoom ?? 0.5;
    controls.maxZoom = limits.maxZoom ?? 4;
  } else {
    controls.minDistance = limits.minDist ?? 1;
    controls.maxDistance = limits.maxDist ?? 60;
  }
  if (limits.minPolarDeg !== undefined) controls.minPolarAngle = THREE.MathUtils.degToRad(limits.minPolarDeg);
  if (limits.maxPolarDeg !== undefined) controls.maxPolarAngle = THREE.MathUtils.degToRad(limits.maxPolarDeg);

  const home = Object.keys(views)[0];
  let tween = null;
  const cancel = () => { tween = null; invalidate(); };
  const wake = () => invalidate();
  controls.addEventListener('start', cancel);
  controls.addEventListener('change', wake);
  controls.addEventListener('end', wake);

  function setView(name, { animate = true } = {}) {
    const view = views[name];
    if (!view) return false;
    const to = new THREE.Vector3(...view.position);
    const target = new THREE.Vector3(...view.target);
    if (!animate || prefersReducedMotion()) {
      tween = null;
      camera.position.copy(to);
      controls.target.copy(target);
      controls.update();
    } else {
      tween = { elapsed: 0, from: camera.position.clone(), targetFrom: controls.target.clone(), to, target };
    }
    invalidate();
    return true;
  }

  return {
    controls,
    setView,
    reset: () => setView(home, { animate: false }),
    /** @returns {boolean} true while the camera is still moving. */
    update(dt) {
      if (tween) {
        tween.elapsed += dt;
        const p = Math.min(1, tween.elapsed / TWEEN_SECONDS), ease = p * p * (3 - 2 * p);
        camera.position.lerpVectors(tween.from, tween.to, ease);
        controls.target.lerpVectors(tween.targetFrom, tween.target, ease);
        if (p === 1) tween = null;
      }
      return controls.update() || Boolean(tween);
    },
    dispose() {
      tween = null;
      controls.removeEventListener('start', cancel);
      controls.removeEventListener('change', wake);
      controls.removeEventListener('end', wake);
      controls.dispose();
    }
  };
}

/**
 * Boots one concept scene into a canvas and wires renderer, camera, loop and lifecycle.
 *
 * @param {object} options
 * @param {HTMLCanvasElement} options.canvas
 * @param {HTMLElement} [options.viewport] - element the canvas is sized from (default: parent).
 * @param {object} options.look - tone mapping, exposure, camera and palette for this concept.
 * @param {Record<string, {position: number[], target: number[]}>} options.views - first is home.
 * @param {(context: object) => {update: (dt: number) => boolean, dispose: () => void}}
 *   options.createScene - receives {renderer, scene, camera, look, invalidate, viewport} and
 *   builds the subject; update returns true while anything animates.
 * @param {(cause: unknown) => void} [options.onUnavailable] - called when WebGL is missing.
 * @returns {object|null} the running handle, or null when WebGL is unavailable.
 */
export function start({ canvas, viewport = canvas.parentElement, look, views, createScene, onUnavailable }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: look.alpha === true });
  } catch (cause) {
    onUnavailable?.(cause);
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE[look.toneMapping ?? 'ACESFilmicToneMapping'];
  renderer.toneMappingExposure = look.exposure ?? 1;
  renderer.setPixelRatio(Math.min(devicePixelRatio, look.maxPixelRatio ?? 2));
  if (look.shadows !== false) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const bounds = viewport.getBoundingClientRect();
  const camera = createCamera(look, (bounds.width || 16) / (bounds.height || 9));
  const scene = new THREE.Scene();

  let loop = null;
  const invalidate = () => loop?.invalidate();

  const world = createScene({ renderer, scene, camera, look, invalidate, viewport });
  const rig = createCameraRig({
    canvas, camera, views, invalidate,
    limits: look.camera?.limits ?? look.camera ?? {}
  });

  let paused = prefersReducedMotion();
  let ready = false;
  loop = createRenderLoop({
    draw(dt) {
      const moving = world.update(paused ? 0 : dt);
      const cameraMoving = rig.update(dt);
      renderer.render(scene, camera);
      if (!ready) { ready = true; window.__sceneReady = true; }
      return moving || cameraMoving;
    }
  });

  // Capture contract read by the 3dviz-pro-max capture script: exactly these two globals.
  window.__viewer = { views: Object.keys(views), setView: (name) => rig.setView(name) };

  const resizeObserver = new ResizeObserver(() => {
    const { width, height } = viewport.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    if (camera.isOrthographicCamera) {
      const h = camera.userData.frustumHeight;
      camera.left = (-h * aspect) / 2; camera.right = (h * aspect) / 2;
      camera.top = h / 2; camera.bottom = -h / 2;
    } else {
      camera.aspect = aspect;
    }
    camera.updateProjectionMatrix();
    invalidate();
  });
  resizeObserver.observe(viewport);

  const onVisibility = () => loop.setActive(!document.hidden);
  document.addEventListener('visibilitychange', onVisibility);

  const handle = {
    renderer, scene, camera, world, controls: rig.controls, invalidate,
    setView: (name) => rig.setView(name),
    reset: () => rig.reset(),
    isPaused: () => paused,
    setPaused(value) { paused = value; invalidate(); },
    dispose() {
      document.removeEventListener('visibilitychange', onVisibility);
      resizeObserver.disconnect();
      loop.dispose(); rig.dispose(); world.dispose(); renderer.dispose();
    }
  };

  addEventListener('pagehide', handle.dispose, { once: true });
  rig.reset();
  loop.setActive(!document.hidden);
  return handle;
}
