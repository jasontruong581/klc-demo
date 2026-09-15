// Concept 17 — K&C Steel Supply Desk.
// A quiet warehouse bay and one selected product sample share the same state as the quote form.
// There is no ambient animation: the renderer wakes only for input, resize or a state change.
import * as THREE from 'three';
import {
  createMaterialCache, createStudioRig, gradientSky, coilStripGeometry, STEEL_DENSITY_KG_M3
} from '../assets/klc3d/scene-kit.js';

export const PRODUCTS = {
  po: {
    short: 'PO', name: 'Thép cán nóng tẩy gỉ', code: 'PO · Pickled & Oiled', form: 'coil',
    color: '#56605e', roughness: 0.5, metalness: 0.78,
    matrices: [{ label: '1,40–4,50 mm · 850–1.550 mm', minGauge: 1.4, maxGauge: 4.5, minWidth: 850, maxWidth: 1550, defaultGauge: 3, defaultWidth: 1250 }],
    standards: 'JIS G3113 / G3132 / G3134 · EN 10025-2'
  },
  crc: {
    short: 'CRC', name: 'Thép cán nguội', code: 'CRC · Cold Rolled', form: 'coil',
    color: '#cbd3d6', roughness: 0.24, metalness: 0.94,
    matrices: [
      { label: '0,18–0,30 mm · 850–1.250 mm', minGauge: 0.18, maxGauge: 0.3, minWidth: 850, maxWidth: 1250, defaultGauge: 0.25, defaultWidth: 1200 },
      { label: '0,30–2,50 mm · 850–1.550 mm', minGauge: 0.3, maxGauge: 2.5, minWidth: 850, maxWidth: 1550, defaultGauge: 1.2, defaultWidth: 1250 }
    ],
    standards: 'JIS G3141 · ASTM A1008 · EN 10130 · BIS IS 513 · SAE J403'
  },
  gi: {
    short: 'GI', name: 'Tôn mạ kẽm', code: 'GI · Galvanized', form: 'coil',
    color: '#d9e1e2', roughness: 0.3, metalness: 0.9,
    matrices: [
      { label: '0,16–0,40 mm · 850–1.300 mm', minGauge: 0.16, maxGauge: 0.4, minWidth: 850, maxWidth: 1300, defaultGauge: 0.35, defaultWidth: 1200 },
      { label: '0,40–2,50 mm · 850–1.550 mm', minGauge: 0.4, maxGauge: 2.5, minWidth: 850, maxWidth: 1550, defaultGauge: 0.5, defaultWidth: 1250 },
      { label: '2,50–3,00 mm · 850–1.250 mm', minGauge: 2.5, maxGauge: 3, minWidth: 850, maxWidth: 1250, defaultGauge: 2.8, defaultWidth: 1250 }
    ],
    standards: 'JIS G3302 · ASTM A653 · EN 10346 · AS 1397'
  },
  gl: {
    short: 'GL', name: 'Tôn mạ hợp kim nhôm kẽm', code: 'GL · Galvalume', form: 'coil',
    color: '#dfe5e4', roughness: 0.35, metalness: 0.87,
    matrices: [
      { label: '0,16–0,40 mm · 850–1.300 mm', minGauge: 0.16, maxGauge: 0.4, minWidth: 850, maxWidth: 1300, defaultGauge: 0.35, defaultWidth: 1200 },
      { label: '0,40–2,00 mm · 850–1.550 mm', minGauge: 0.4, maxGauge: 2, minWidth: 850, maxWidth: 1550, defaultGauge: 0.5, defaultWidth: 1250 }
    ],
    standards: 'JIS G3321 · ASTM A792 · EN 10346 · AS 1397'
  },
  zm: {
    short: 'ZM', name: 'Tôn mạ kẽm–nhôm–magiê', code: 'ZM · Zn-Al-Mg', form: 'coil',
    color: '#cbd8d1', roughness: 0.32, metalness: 0.86,
    matrices: [], standards: 'Quy cách và tiêu chuẩn xác nhận theo nguồn hàng từng lô'
  },
  ppgi: {
    short: 'PPGI/PPGL', name: 'Tôn mạ màu', code: 'PPGI / PPGL · Pre-painted', form: 'coil',
    color: '#245b39', roughness: 0.5, metalness: 0.18,
    matrices: [{ label: '0,16–1,00 mm BMT · 850–1.300 mm', minGauge: 0.16, maxGauge: 1, minWidth: 850, maxWidth: 1300, defaultGauge: 0.45, defaultWidth: 1200 }],
    standards: 'ASTM A755 · JIS G3312 / G3322 · EN 10169 · AS/NZS 2728'
  }
};

export function theoreticalMassPerMetre(gaugeMm, widthMm) {
  return (gaugeMm / 1000) * (widthMm / 1000) * STEEL_DENSITY_KG_M3;
}

export function createScene({ renderer, scene, look, invalidate }) {
  const materials = createMaterialCache();
  const geometries = [];
  const track = (geometry) => { geometries.push(geometry); return geometry; };
  const mesh = (geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], parent = scene) => {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    object.rotation.set(...rotation);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };

  scene.background = gradientSky(look.sky.zenith, look.sky.horizon);
  const studio = createStudioRig(scene, renderer, look.light);
  const floorMaterial = materials.get({ color: look.palette.floor, roughness: 0.94, metalness: 0.02 });
  const rackMaterial = materials.get({ color: look.palette.rack, roughness: 0.58, metalness: 0.34 });
  const darkMaterial = materials.get({ color: look.palette.dark, roughness: 0.68, metalness: 0.3 });
  const brassMaterial = materials.get({ color: look.palette.brass, roughness: 0.55, metalness: 0.45 });
  const woodMaterial = materials.get({ color: '#9b7a50', roughness: 0.88 });

  const floor = mesh(track(new THREE.PlaneGeometry(24, 18)), floorMaterial, [0, 0, 0], [-Math.PI / 2, 0, 0]);
  floor.receiveShadow = true;
  for (const x of [-1.05, 1.05]) mesh(track(new THREE.BoxGeometry(0.045, 0.006, 10)), brassMaterial, [x, 0.004, 0.5]);

  // A compact, credible storage bay: clear aisle, two racks and deterministic inventory.
  const warehouse = new THREE.Group();
  scene.add(warehouse);
  const postGeometry = track(new THREE.BoxGeometry(0.12, 3.2, 0.12));
  const beamGeometry = track(new THREE.BoxGeometry(0.1, 0.14, 5.8));
  for (const side of [-1, 1]) {
    const rackX = side * 2.3;
    for (const z of [-2.7, 0, 2.7]) {
      mesh(postGeometry, rackMaterial, [rackX - 0.62, 1.6, z], [0, 0, 0], warehouse);
      mesh(postGeometry, rackMaterial, [rackX + 0.62, 1.6, z], [0, 0, 0], warehouse);
    }
    for (const y of [0.38, 1.82]) {
      mesh(beamGeometry, darkMaterial, [rackX - 0.57, y, 0], [0, 0, 0], warehouse);
      mesh(beamGeometry, darkMaterial, [rackX + 0.57, y, 0], [0, 0, 0], warehouse);
    }
  }

  // Warehouse coils use the same industrial construction as Concept 14: a wound strip with
  // flat end faces, a deep 508 mm bore, steel bands and V-cradles. A torus reads as a donut
  // because it has a round tube section and no axial width, so it is deliberately not used here.
  const inventoryMaterial = materials.get({ color: '#aeb8b8', roughness: 0.42, metalness: 0.78, side: THREE.DoubleSide });
  const inventoryFaceMaterial = materials.get({ color: '#bbc4c4', roughness: 0.56, metalness: 0.72 });
  const boreMaterial = materials.get({ color: '#435049', roughness: 0.82, metalness: 0.55, side: THREE.BackSide });
  const bandMaterial = materials.get({ color: '#737e82', roughness: 0.38, metalness: 0.9 });
  const inventoryOuterRadius = 0.58;
  const inventoryWidth = 1.08;
  const inventoryShellGeometry = track(coilStripGeometry({
    innerRadius: 0.254, outerRadius: inventoryOuterRadius,
    width: inventoryWidth, turns: 15, segmentsPerTurn: 36
  }));
  const inventoryFaceGeometry = track(new THREE.RingGeometry(0.254, inventoryOuterRadius, 56));
  const inventoryBoreGeometry = track(new THREE.CylinderGeometry(0.254, 0.254, inventoryWidth + 0.02, 28, 1, true));
  const inventoryBandGeometry = track(new THREE.TorusGeometry(inventoryOuterRadius + 0.005, 0.012, 6, 56));
  const inventoryCradleGeometry = track(new THREE.BoxGeometry(1.2, 0.065, 0.18));
  for (const side of [-1, 1]) {
    for (const beamY of [0.38, 1.82]) {
      for (const z of [-1.85, 0, 1.85]) {
        for (const sign of [-1, 1]) {
          mesh(inventoryCradleGeometry, darkMaterial,
            [side * 2.3, beamY + 0.045, z + sign * inventoryOuterRadius * 0.43],
            [sign * -0.32, 0, 0], warehouse);
        }
        const roll = new THREE.Group();
        roll.position.set(side * 2.3, beamY + 0.07 + inventoryOuterRadius * 0.82, z);
        roll.rotation.x = z * 0.035;
        warehouse.add(roll);
        mesh(inventoryShellGeometry, inventoryMaterial, [0, 0, 0], [0, 0, Math.PI / 2], roll);
        for (const sign of [-1, 1]) {
          mesh(inventoryFaceGeometry, inventoryFaceMaterial,
            [sign * (inventoryWidth / 2 - 0.006), 0, 0], [0, sign * Math.PI / 2, 0], roll);
        }
        mesh(inventoryBoreGeometry, boreMaterial, [0, 0, 0], [0, 0, Math.PI / 2], roll);
        for (const offset of [-0.27, 0.27]) {
          mesh(inventoryBandGeometry, bandMaterial,
            [offset * inventoryWidth, 0, 0], [0, Math.PI / 2, 0], roll);
        }
      }
    }
  }

  // Selected product on a staging pallet. Surface and proportions update with the form.
  const product = new THREE.Group();
  product.position.set(0, 0, 1.55);
  scene.add(product);
  mesh(track(new THREE.BoxGeometry(1.7, 0.14, 1.25)), woodMaterial, [0, 0.08, 0], [0, 0, 0], product);
  const selectedCradleGeometry = track(new THREE.BoxGeometry(1.5, 0.07, 0.18));
  for (const sign of [-1, 1]) {
    mesh(selectedCradleGeometry, darkMaterial, [0, 0.18, sign * 0.31], [sign * -0.34, 0, 0], product);
  }
  const selectedMaterial = new THREE.MeshStandardMaterial({ color: PRODUCTS.gl.color, roughness: PRODUCTS.gl.roughness, metalness: PRODUCTS.gl.metalness, side: THREE.DoubleSide });
  const selectedFaceMaterial = new THREE.MeshStandardMaterial({ color: PRODUCTS.gl.color, roughness: Math.min(1, PRODUCTS.gl.roughness + 0.16), metalness: Math.max(0, PRODUCTS.gl.metalness - 0.06) });
  const selectedRoll = new THREE.Group();
  selectedRoll.position.set(0, 0.86, 0);
  product.add(selectedRoll);
  mesh(track(coilStripGeometry({ innerRadius: 0.254, outerRadius: 0.68, width: 1.2, turns: 18, segmentsPerTurn: 48 })), selectedMaterial, [0, 0, 0], [0, 0, Math.PI / 2], selectedRoll);
  const faceGeometry = track(new THREE.RingGeometry(0.254, 0.68, 64));
  for (const sign of [-1, 1]) {
    mesh(faceGeometry, selectedFaceMaterial, [sign * 0.594, 0, 0], [0, sign * Math.PI / 2, 0], selectedRoll);
  }
  mesh(track(new THREE.CylinderGeometry(0.254, 0.254, 1.22, 32, 1, true)), boreMaterial,
    [0, 0, 0], [0, 0, Math.PI / 2], selectedRoll);
  const selectedBandGeometry = track(new THREE.TorusGeometry(0.686, 0.014, 7, 64));
  for (const offset of [-0.27, 0.27]) {
    mesh(selectedBandGeometry, bandMaterial, [offset * 1.2, 0, 0], [0, Math.PI / 2, 0], selectedRoll);
  }
  const label = document.createElement('canvas');
  label.width = 512; label.height = 160;
  const labelContext = label.getContext('2d');
  const labelTexture = new THREE.CanvasTexture(label);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  const labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, side: THREE.DoubleSide });
  mesh(track(new THREE.PlaneGeometry(1.05, 0.32)), labelMaterial, [0, 0.34, 0.72], [0, 0, 0], product);

  let activeProduct = 'gl';
  let activeWidth = 1200;
  let sceneMode = 'warehouse';

  function redrawLabel() {
    const preset = PRODUCTS[activeProduct];
    labelContext.clearRect(0, 0, label.width, label.height);
    labelContext.fillStyle = '#ffffff';
    labelContext.fillRect(0, 0, label.width, label.height);
    labelContext.fillStyle = '#0b5c2a';
    labelContext.fillRect(0, 0, 18, label.height);
    labelContext.fillStyle = '#14231a';
    labelContext.font = '700 46px Arial';
    labelContext.fillText(preset.short, 42, 66);
    labelContext.fillStyle = '#526158';
    labelContext.font = '26px Arial';
    labelContext.fillText(`${activeWidth.toLocaleString('vi-VN')} mm · CO/CQ theo lô`, 42, 118);
    labelTexture.needsUpdate = true;
  }

  function setProduct(id, widthMm = activeWidth) {
    if (!PRODUCTS[id]) return;
    activeProduct = id;
    activeWidth = widthMm;
    const preset = PRODUCTS[id];
    selectedMaterial.color.set(preset.color);
    selectedMaterial.roughness = preset.roughness;
    selectedMaterial.metalness = preset.metalness;
    selectedFaceMaterial.color.set(preset.color);
    selectedFaceMaterial.roughness = Math.min(1, preset.roughness + 0.16);
    selectedFaceMaterial.metalness = Math.max(0, preset.metalness - 0.06);
    const widthScale = Math.max(0.72, Math.min(1.28, widthMm / 1200));
    selectedRoll.scale.x = widthScale;
    redrawLabel();
    invalidate();
  }

  function setMode(mode) {
    sceneMode = mode === 'product' ? 'product' : 'warehouse';
    warehouse.visible = sceneMode === 'warehouse';
    product.position.z = sceneMode === 'product' ? 0 : 1.55;
    invalidate();
  }

  setProduct(activeProduct, activeWidth);
  setMode(sceneMode);

  return {
    get product() { return activeProduct; },
    get mode() { return sceneMode; },
    setProduct,
    setMode,
    update() { return false; },
    dispose() {
      studio.dispose();
      for (const geometry of geometries) geometry.dispose();
      selectedMaterial.dispose();
      selectedFaceMaterial.dispose();
      labelMaterial.dispose();
      labelTexture.dispose();
      materials.dispose();
      scene.background?.dispose?.();
    }
  };
}
