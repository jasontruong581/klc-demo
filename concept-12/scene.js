// Mẫu 12 — Modern Green 3D.
//
// Subject: a full-bleed marketing hero. The steel strip itself is the object — one continuous
// spiral surface unwinding out of the coil, lit so brushed metal reads as brushed metal.
//
// The one factual claim the scene makes is material identity: switching product line switches the
// hero's colour, roughness and metalness to that line's surface (see STEEL in scene-kit), because
// cold-rolled, hot-rolled and galvalume genuinely do not reflect light the same way. Nothing here
// asserts a dimension — the numbers on this page live in the copy and the spec table.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createMaterialCache, coilStripGeometry, makeRandom, STEEL } from '../assets/klc3d/scene-kit.js';

const PLATE_COUNT = 12;
const MOTE_COUNT = 9;

export function createScene({ renderer, scene, look, invalidate }) {
  const materials = createMaterialCache();
  const geometries = [];
  const track = (geometry) => { geometries.push(geometry); return geometry; };

  // Metal needs something to reflect. The page's own gradient shows through the transparent
  // canvas, so the environment is what gives the strip its highlights.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = look.environmentIntensity ?? 0.45;

  // Two lights with one job each: a cool key that shapes the strip, a green rim for the brand.
  const key = new THREE.DirectionalLight(look.light.keyColor, look.light.keyIntensity);
  key.position.set(-4.5, 5.5, 3.5);
  const rim = new THREE.DirectionalLight(look.light.rimColor, look.light.rimIntensity);
  rim.position.set(4.2, -1.2, -3.4);
  const fill = new THREE.HemisphereLight(look.light.skyColor, look.light.groundColor, look.light.fillIntensity);
  scene.add(key, rim, fill);

  // The whole scene tips a few degrees toward the pointer, which reads as parallax without
  // taking the orbit camera away from the visitor.
  const stage = new THREE.Group();
  scene.add(stage);

  const hero = new THREE.Group();
  hero.rotation.z = THREE.MathUtils.degToRad(-16);
  hero.rotation.x = THREE.MathUtils.degToRad(8);
  stage.add(hero);

  const heroMaterial = new THREE.MeshStandardMaterial({
    color: STEEL.crc.color, roughness: STEEL.crc.roughness, metalness: STEEL.crc.metalness,
    side: THREE.DoubleSide
  });

  // One continuous strip, 3.4 turns from the bore out: the same surface a coil is made of, at a
  // pitch loose enough to read as unwinding rather than as a solid drum.
  const ribbon = new THREE.Mesh(
    track(coilStripGeometry({ innerRadius: 0.7, outerRadius: 1.85, width: 0.86, turns: 3.4, segmentsPerTurn: 128 })),
    heroMaterial);
  hero.add(ribbon);

  // Mandrel bore, so the spiral has a centre instead of a hole.
  hero.add(new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.66, 0.66, 0.87, 64, 1, true)),
    materials.get({ color: look.palette.core, roughness: 0.5, metalness: 0.9, side: THREE.DoubleSide })));

  // A faint outer ring: depth behind the hero without adding a second focal point.
  const ring = new THREE.Mesh(
    track(new THREE.TorusGeometry(3.5, 0.012, 6, 160)),
    materials.get({
      color: look.palette.ring, roughness: 0.4, metalness: 0.6,
      emissive: look.palette.ring, emissiveIntensity: 0.6, transparent: true, opacity: 0.5
    }));
  ring.rotation.x = Math.PI / 2.35;
  stage.add(ring);

  // Cut plates drifting around the hero. Instanced, jittered from a fixed seed so every visitor
  // sees the same composition.
  const random = makeRandom(20260910);
  const plates = new THREE.InstancedMesh(
    track(new THREE.BoxGeometry(0.9, 0.02, 0.55)),
    materials.get({ color: look.palette.plate, roughness: 0.3, metalness: 0.9 }), PLATE_COUNT);
  const plateState = [];
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const scale = new THREE.Vector3();
  for (let i = 0; i < PLATE_COUNT; i++) {
    plateState.push({
      angle: random() * Math.PI * 2,
      radius: 4.3 + random() * 2.6,
      height: (random() - 0.5) * 3.4,
      tilt: (random() - 0.5) * 1.4,
      spin: random() * Math.PI * 2,
      size: 0.5 + random() * 0.7,
      phase: random() * Math.PI * 2,
      drift: 0.05 + random() * 0.09
    });
  }
  stage.add(plates);

  // Motes: the only surfaces authored bright, so the glow has one honest source.
  const moteMaterial = materials.get({
    color: look.palette.mote, roughness: 0.3, metalness: 0,
    emissive: look.palette.mote, emissiveIntensity: 4
  });
  const moteGeometry = track(new THREE.SphereGeometry(0.035, 12, 8));
  const motes = [];
  for (let i = 0; i < MOTE_COUNT; i++) {
    const mote = new THREE.Mesh(moteGeometry, moteMaterial);
    const angle = (i / MOTE_COUNT) * Math.PI * 2;
    mote.position.set(Math.cos(angle) * 2.9, (random() - 0.5) * 2.6, Math.sin(angle) * 2.9);
    mote.userData = { home: mote.position.y, phase: random() * Math.PI * 2 };
    motes.push(mote);
    stage.add(mote);
  }

  const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 };
  let time = 0;
  let scrollOffset = 0;

  function writePlates() {
    for (let i = 0; i < PLATE_COUNT; i++) {
      const plate = plateState[i];
      const angle = plate.angle + time * plate.drift;
      position.set(
        Math.cos(angle) * plate.radius,
        plate.height + Math.sin(time * 0.5 + plate.phase) * 0.16,
        Math.sin(angle) * plate.radius);
      euler.set(plate.tilt, plate.spin + time * plate.drift * 1.4, plate.tilt * 0.6);
      quaternion.setFromEuler(euler);
      scale.setScalar(plate.size);
      matrix.compose(position, quaternion, scale);
      plates.setMatrixAt(i, matrix);
    }
    plates.instanceMatrix.needsUpdate = true;
  }
  writePlates();

  return {
    /** Switches the hero to a product line's real surface identity. */
    setProduct(key) {
      const surface = STEEL[key];
      if (!surface) return;
      heroMaterial.color.set(surface.color);
      heroMaterial.roughness = surface.roughness;
      heroMaterial.metalness = surface.metalness;
      invalidate();
    },
    /** Pointer position in −1..1; drives the stage tilt. */
    setPointer(x, y) { pointer.x = x; pointer.y = y; invalidate(); },
    /** Page scroll in pixels; lifts the hero slightly as the visitor reads on. */
    setScroll(pixels) { scrollOffset = pixels; invalidate(); },
    /** @returns {boolean} true while the hero is turning or the tilt is still settling. */
    update(dt) {
      // Parallax must respond even when ambient motion is paused, so it gets a step of its own.
      const settle = Math.min(1, (dt || 1 / 60) * 3.2);
      pointer.currentX += (pointer.x - pointer.currentX) * settle;
      pointer.currentY += (pointer.y - pointer.currentY) * settle;
      stage.rotation.y = pointer.currentX * 0.16;
      stage.rotation.x = pointer.currentY * -0.1;
      stage.position.y = -scrollOffset * 0.0011;
      const settling = Math.abs(pointer.x - pointer.currentX) + Math.abs(pointer.y - pointer.currentY) > 0.001;

      if (dt <= 0) return settling;
      time += dt;
      hero.rotation.y += dt * 0.12;
      ring.rotation.z += dt * 0.04;
      for (const mote of motes) {
        mote.position.y = mote.userData.home + Math.sin(time * 0.8 + mote.userData.phase) * 0.22;
      }
      writePlates();
      return true;
    },
    dispose() {
      for (const light of [key, rim, fill]) { light.parent?.remove(light); light.dispose?.(); }
      for (const geometry of geometries) geometry.dispose();
      heroMaterial.dispose();
      materials.dispose();
      scene.environment = null;
      environment.dispose();
      pmrem.dispose();
    }
  };
}
