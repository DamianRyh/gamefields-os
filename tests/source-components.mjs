import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const base = "assets/private/gamefields/";
const library = JSON.parse(await readFile(base + "library.json", "utf8"));
// Geometry-only audit in Node; textures are exercised by the browser viewer.
const loader = new GLTFLoader().register(() => ({
  name: "geometry-audit",
  loadMaterial: () => Promise.resolve(new THREE.MeshBasicMaterial()),
}));
async function load(file) {
  const bytes = await readFile(base + file);
  assert.equal(bytes.readUInt32LE(0), 0x46546c67);
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  return new Promise((resolve, reject) =>
    loader.parse(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length),
      "",
      (g) => resolve(g.scene),
      reject,
    ),
  );
}
function meshes(scene) {
  const found = [];
  scene.updateMatrixWorld(true);
  scene.traverse((n) => {
    if (n instanceof THREE.Mesh) found.push(n);
  });
  return found;
}
function area(nodes) {
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3(),
    cross = new THREE.Vector3();
  let sum = 0;
  for (const mesh of nodes) {
    const positions = mesh.geometry.attributes.position,
      index = mesh.geometry.index,
      n = index ? index.count : positions.count;
    for (let i = 0; i < n; i += 3) {
      a.fromBufferAttribute(positions, index ? index.getX(i) : i).applyMatrix4(
        mesh.matrixWorld,
      );
      b.fromBufferAttribute(
        positions,
        index ? index.getX(i + 1) : i + 1,
      ).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(
        positions,
        index ? index.getX(i + 2) : i + 2,
      ).applyMatrix4(mesh.matrixWorld);
      sum += cross.crossVectors(b.sub(a), c.sub(a)).length() / 2;
    }
  }
  return sum;
}
const sources = new Map();
for (const source of library.sources) {
  const bytes = await readFile(base + source.file);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256);
  const scene = await load(source.file);
  assert.equal(meshes(scene).length, source.meshCount);
  sources.set(source.id, meshes(scene));
}
assert.equal(library.components.length, 12);
assert.equal(new Set(library.components.map((c) => c.assetKey)).size, 12);
for (const component of library.components) {
  const target = await load(component.file),
    nodes = meshes(target);
  assert.equal(nodes.length, component.meshCount);
  const original = sources
    .get(component.source)
    .filter((mesh) =>
      component.sourceNodeNames.includes(mesh.userData.name || mesh.name),
    );
  assert.equal(
    original.length,
    component.meshCount,
    "Every component part has an original source",
  );
  const sourceArea = area(original),
    targetArea = area(nodes);
  assert.ok(
    Math.abs(sourceArea - targetArea) / sourceArea < 0.00002,
    `${component.id}: no stretch/decimation; surface area conserved`,
  );
  const box = new THREE.Box3().setFromObject(target),
    size = box.getSize(new THREE.Vector3());
  assert.ok(Math.abs(box.min.y) < 0.00001, "Bottom-centred GLB");
  assert.ok(Math.abs((box.min.x + box.max.x) / 2) < 0.00001);
  assert.ok(Math.abs((box.min.z + box.max.z) / 2) < 0.00001);
  assert.ok(Math.abs(size.x - component.measuredBoundsM.x) < 0.00001);
  assert.ok(Math.abs(size.y - component.measuredBoundsM.z) < 0.00001);
  assert.ok(Math.abs(size.z - component.measuredBoundsM.y) < 0.00001);
  assert.equal(component.connectionPoints, null);
  assert.equal(component.weightKg, null);
  assert.equal(component.costStatus, "UNPRICED");
  assert.equal(component.productionDimensionsStatus, "UNCONFIRMED");
  assert.deepEqual(component.scale, [1, 1, 1]);
}
assert.ok(
  Math.abs(
    library.components.find((c) => c.id === "K1").repeatStudy.pitchM - 2.06,
  ) < 0.00001,
);
console.log(
  "PASS: 3 original SHA-verified GLBs, 12 component exports, source identity, rigid-transform surface conservation, Y-up bounds/origins and unconfirmed production/pricing contracts.",
);
