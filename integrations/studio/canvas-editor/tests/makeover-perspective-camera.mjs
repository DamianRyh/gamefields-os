import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Bundle TS source in memory so this test runs in the repository's existing Node toolchain.
const compile=path=>ts.transpileModule(readFileSync(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const calibrationUrl="data:text/javascript;base64,"+Buffer.from(compile("lib/makeover-calibration.ts")).toString("base64");
const cameraCode=compile("lib/makeover-perspective-camera.ts").replace('from "./makeover-calibration"','from "'+calibrationUrl+'"');
const { estimatePerspectiveCamera, projectWorldPoint } = await import(
  "data:text/javascript;base64," + Buffer.from(cameraCode).toString("base64")
);

const synthetic = {
  focalPx: 1200,
  principalPoint: [800, 500],
  rX: [1, 0, 0],
  rY: [0, -0.88, 0.475],
  rZ: [0, 0.475, 0.88],
  translation: [-7, -2, 24],
};
const corners = [{x:0,y:0,z:0},{x:15,y:0,z:0},{x:15,y:0,z:10},{x:0,y:0,z:10}];
const quad = corners.map(p => projectWorldPoint(synthetic,p));
assert.equal(quad.length,4);
assert.ok(quad.every(Boolean));
const estimate = estimatePerspectiveCamera({
  quad, imageWidth:1600, imageHeight:1000,
  courtLengthMeters:15,courtWidthMeters:10,focalPx:1200,
});
assert.ok(Number.isFinite(estimate.reprojectionRmsPx));
assert.ok(estimate.reprojectionRmsPx < 25, `Unexpected reprojection residual: ${estimate.reprojectionRmsPx}`);
for (const point of corners) assert.ok(projectWorldPoint(estimate,point));
assert.equal(estimate.focalWasEstimated,false);

const auto=estimatePerspectiveCamera({
  quad,imageWidth:1600,imageHeight:1000,courtLengthMeters:15,courtWidthMeters:10,
});
assert.ok(Number.isFinite(auto.focalPx));
assert.equal(auto.focalWasEstimated,true);

assert.throws(() => estimatePerspectiveCamera({
  quad:[{x:10,y:10},{x:30,y:10},{x:20,y:10},{x:10,y:30}],
  imageWidth:1600,imageHeight:1000,courtLengthMeters:15,courtWidthMeters:10,
}));
console.log("makeover-perspective-camera: smoke PASS");
