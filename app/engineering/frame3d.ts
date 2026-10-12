import { RHS_SECTIONS, type CourtEngineeringInput } from "./domain";
import { DEFAULT_ANALYSIS_INPUT, type StructuralAnalysisInput } from "./analysis";
import type { StructuralMember, StructuralModel, StructuralNode } from "./model";

export type Frame3DLoadCaseId = "WIND_X" | "WIND_Y" | "IMPACT_X" | "IMPACT_Y" | "SELF_WEIGHT";

export interface Frame3DNodeResult {
  nodeId: string;
  uxMm: number;
  uyMm: number;
  uzMm: number;
  rxRad: number;
  ryRad: number;
  rzRad: number;
}

export interface Frame3DMemberResult {
  memberId: string;
  axialKn: number;
  shearYKn: number;
  shearZKn: number;
  torsionKnM: number;
  momentYKnM: number;
  momentZKnM: number;
}

export interface Frame3DSupportReaction {
  nodeId: string;
  fxKn: number;
  fyKn: number;
  fzKn: number;
  mxKnM: number;
  myKnM: number;
  mzKnM: number;
}

export interface Frame3DCaseResult {
  loadCase: Frame3DLoadCaseId;
  nodes: Frame3DNodeResult[];
  members: Frame3DMemberResult[];
  reactions: Frame3DSupportReaction[];
  maxDisplacementMm: number;
  maxMomentKnM: number;
}

export interface Frame3DSolverResult {
  schema: "GF-FRAME3D-0.5";
  solver: "LINEAR_ELASTIC_SPACE_FRAME_12X12";
  dofPerNode: 6;
  status: "PRELIMINARY";
  cases: Frame3DCaseResult[];
  envelope: {
    maxDisplacementMm: number;
    maxMomentKnM: number;
    governingDisplacementCase: Frame3DLoadCaseId;
    governingMomentCase: Frame3DLoadCaseId;
  };
  limitations: string[];
}

type Matrix = number[][];
type Vec3 = [number, number, number];

const E = 210e9;
const G = 81e9;
const GRAVITY = 9.81;

function zeros(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

function transpose(a: Matrix): Matrix {
  return a[0].map((_, j) => a.map((row) => row[j]));
}

function multiply(a: Matrix, b: Matrix): Matrix {
  const out = zeros(a.length, b[0].length);
  for (let i = 0; i < a.length; i++) {
    for (let k = 0; k < b.length; k++) {
      const aik = a[i][k];
      if (Math.abs(aik) < 1e-18) continue;
      for (let j = 0; j < b[0].length; j++) out[i][j] += aik * b[k][j];
    }
  }
  return out;
}

function matVec(a: Matrix, x: number[]): number[] {
  return a.map((row) => row.reduce((sum, v, i) => sum + v * x[i], 0));
}

function norm(v: Vec3): number {
  return Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
}

function normalize(v: Vec3): Vec3 {
  const n = Math.max(1e-12, norm(v));
  return [v[0] / n, v[1] / n, v[2] / n];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function sectionProps(code: string) {
  const s = RHS_SECTIONS.find((x) => x.code === code) ?? RHS_SECTIONS[0];
  const b = s.widthMm / 1000;
  const h = s.heightMm / 1000;
  const t = s.wallMm / 1000;
  const bi = Math.max(0, b - 2 * t);
  const hi = Math.max(0, h - 2 * t);
  const area = b * h - bi * hi;
  const iy = (b * h ** 3 - bi * hi ** 3) / 12;
  const iz = (h * b ** 3 - hi * bi ** 3) / 12;
  const j = Math.max(1e-12, iy + iz);
  return { area, iy, iz, j, kgPerM: s.kgPerM };
}

function localStiffness(member: StructuralMember): Matrix {
  const L = Math.max(1e-6, member.lengthM);
  const { area: A, iy: Iy, iz: Iz, j: J } = sectionProps(member.sectionCode);
  const k = zeros(12, 12);
  const a = E * A / L;
  const t = G * J / L;
  const by = 12 * E * Iz / L ** 3;
  const cy = 6 * E * Iz / L ** 2;
  const dy = 4 * E * Iz / L;
  const ey = 2 * E * Iz / L;
  const bz = 12 * E * Iy / L ** 3;
  const cz = 6 * E * Iy / L ** 2;
  const dz = 4 * E * Iy / L;
  const ez = 2 * E * Iy / L;

  k[0][0] = a; k[0][6] = -a; k[6][0] = -a; k[6][6] = a;
  k[3][3] = t; k[3][9] = -t; k[9][3] = -t; k[9][9] = t;

  k[1][1] = by; k[1][5] = cy; k[1][7] = -by; k[1][11] = cy;
  k[5][1] = cy; k[5][5] = dy; k[5][7] = -cy; k[5][11] = ey;
  k[7][1] = -by; k[7][5] = -cy; k[7][7] = by; k[7][11] = -cy;
  k[11][1] = cy; k[11][5] = ey; k[11][7] = -cy; k[11][11] = dy;

  k[2][2] = bz; k[2][4] = -cz; k[2][8] = -bz; k[2][10] = -cz;
  k[4][2] = -cz; k[4][4] = dz; k[4][8] = cz; k[4][10] = ez;
  k[8][2] = -bz; k[8][4] = cz; k[8][8] = bz; k[8][10] = cz;
  k[10][2] = -cz; k[10][4] = ez; k[10][8] = cz; k[10][10] = dz;
  return k;
}

function transform12(a: StructuralNode, b: StructuralNode): Matrix {
  const ex = normalize([b.x - a.x, b.y - a.y, b.z - a.z]);
  const ref: Vec3 = Math.abs(ex[2]) > 0.9 ? [0, 1, 0] : [0, 0, 1];
  const ey = normalize(cross(ref, ex));
  const ez = normalize(cross(ex, ey));
  const r = [ex, ey, ez];
  const T = zeros(12, 12);
  for (const base of [0, 3, 6, 9]) {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) T[base + i][base + j] = r[i][j];
  }
  return T;
}

function memberDofs(member: StructuralMember, nodeIndex: Map<string, number>): number[] {
  const a = nodeIndex.get(member.startNodeId)! * 6;
  const b = nodeIndex.get(member.endNodeId)! * 6;
  return [a, a + 1, a + 2, a + 3, a + 4, a + 5, b, b + 1, b + 2, b + 3, b + 4, b + 5];
}

function gaussianSolve(Ain: Matrix, bin: number[]): number[] {
  const A = Ain.map((r) => [...r]);
  const b = [...bin];
  const n = b.length;
  for (let k = 0; k < n; k++) {
    let pivot = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(A[i][k]) > Math.abs(A[pivot][k])) pivot = i;
    if (Math.abs(A[pivot][k]) < 1e-9) throw new Error(`Singular frame stiffness matrix at DOF ${k}`);
    [A[k], A[pivot]] = [A[pivot], A[k]];
    [b[k], b[pivot]] = [b[pivot], b[k]];
    for (let i = k + 1; i < n; i++) {
      const f = A[i][k] / A[k][k];
      if (Math.abs(f) < 1e-18) continue;
      for (let j = k; j < n; j++) A[i][j] -= f * A[k][j];
      b[i] -= f * b[k];
    }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = s / A[i][i];
  }
  return x;
}

function assemble(model: StructuralModel) {
  const nodeIndex = new Map(model.nodes.map((n, i) => [n.id, i]));
  const nodeById = new Map(model.nodes.map((n) => [n.id, n]));
  const K = zeros(model.nodes.length * 6, model.nodes.length * 6);
  const elementData = new Map<string, { kLocal: Matrix; T: Matrix; dofs: number[] }>();
  for (const m of model.members) {
    const a = nodeById.get(m.startNodeId)!;
    const b = nodeById.get(m.endNodeId)!;
    const kLocal = localStiffness(m);
    const T = transform12(a, b);
    const kGlobal = multiply(transpose(T), multiply(kLocal, T));
    const dofs = memberDofs(m, nodeIndex);
    for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) K[dofs[i]][dofs[j]] += kGlobal[i][j];
    elementData.set(m.id, { kLocal, T, dofs });
  }
  return { K, nodeIndex, elementData };
}

function applyLoads(
  loadCase: Frame3DLoadCaseId,
  input: CourtEngineeringInput,
  model: StructuralModel,
  assumptions: StructuralAnalysisInput,
  nodeIndex: Map<string, number>,
): number[] {
  const F = Array(model.nodes.length * 6).fill(0);
  const add = (nodeId: string, dof: 0 | 1 | 2, valueN: number) => { F[nodeIndex.get(nodeId)! * 6 + dof] += valueN; };

  if (loadCase === "SELF_WEIGHT") {
    for (const m of model.members) {
      const wN = sectionProps(m.sectionCode).kgPerM * GRAVITY * m.lengthM;
      add(m.startNodeId, 2, -wN / 2);
      add(m.endNodeId, 2, -wN / 2);
    }
    return F;
  }

  if (loadCase.startsWith("WIND")) {
    const axis: 0 | 1 = loadCase === "WIND_X" ? 0 : 1;
    const qNPerM2 = assumptions.windPressureKpa * 1000;
    for (const m of model.members.filter((x) => x.type === "post")) {
      const a = model.nodes[nodeIndex.get(m.startNodeId)!];
      const b = model.nodes[nodeIndex.get(m.endNodeId)!];
      const zMid = (a.z + b.z) / 2;
      const solidity = zMid <= input.boardHeightM ? 1 : assumptions.netSolidity;
      const lineNPerM = qNPerM2 * input.postSpacingM * solidity;
      const totalN = lineNPerM * m.lengthM;
      add(m.startNodeId, axis, totalN / 2);
      add(m.endNodeId, axis, totalN / 2);
    }
    return F;
  }

  const axis: 0 | 1 = loadCase === "IMPACT_X" ? 0 : 1;
  const targets = model.nodes.filter((n) => Math.abs(n.z - input.boardHeightM) < 1e-6);
  const eachN = assumptions.impactLoadKn * 1000 / Math.max(1, targets.length);
  targets.forEach((n) => add(n.id, axis, eachN));
  return F;
}

function solveCase(
  loadCase: Frame3DLoadCaseId,
  input: CourtEngineeringInput,
  model: StructuralModel,
  assumptions: StructuralAnalysisInput,
): Frame3DCaseResult {
  const { K, nodeIndex, elementData } = assemble(model);
  const F = applyLoads(loadCase, input, model, assumptions, nodeIndex);
  const constrained = new Set<number>();
  for (const node of model.nodes) {
    const base = nodeIndex.get(node.id)! * 6;
    if (node.restraint === "fixed") for (let dof = 0; dof < 6; dof++) constrained.add(base + dof);
    else if (node.restraint === "pinned") for (let dof = 0; dof < 3; dof++) constrained.add(base + dof);
  }
  const free = Array.from({ length: K.length }, (_, i) => i).filter((i) => !constrained.has(i));
  const Kff = free.map((i) => free.map((j) => K[i][j]));
  const Ff = free.map((i) => F[i]);
  const df = gaussianSolve(Kff, Ff);
  const d = Array(K.length).fill(0);
  free.forEach((g, i) => { d[g] = df[i]; });
  const residual = matVec(K, d).map((v, i) => v - F[i]);

  const nodes: Frame3DNodeResult[] = model.nodes.map((n) => {
    const base = nodeIndex.get(n.id)! * 6;
    return {
      nodeId: n.id,
      uxMm: d[base] * 1000,
      uyMm: d[base + 1] * 1000,
      uzMm: d[base + 2] * 1000,
      rxRad: d[base + 3],
      ryRad: d[base + 4],
      rzRad: d[base + 5],
    };
  });

  const members: Frame3DMemberResult[] = model.members.map((m) => {
    const ed = elementData.get(m.id)!;
    const dGlobal = ed.dofs.map((g) => d[g]);
    const dLocal = matVec(ed.T, dGlobal);
    const fLocal = matVec(ed.kLocal, dLocal);
    const endA = fLocal.slice(0, 6);
    const endB = fLocal.slice(6, 12);
    const pick = (i: number) => Math.max(Math.abs(endA[i]), Math.abs(endB[i]));
    return {
      memberId: m.id,
      axialKn: pick(0) / 1000,
      shearYKn: pick(1) / 1000,
      shearZKn: pick(2) / 1000,
      torsionKnM: pick(3) / 1000,
      momentYKnM: pick(4) / 1000,
      momentZKnM: pick(5) / 1000,
    };
  });

  const reactions: Frame3DSupportReaction[] = model.nodes.filter((n) => n.restraint !== "free").map((n) => {
    const base = nodeIndex.get(n.id)! * 6;
    return {
      nodeId: n.id,
      fxKn: residual[base] / 1000,
      fyKn: residual[base + 1] / 1000,
      fzKn: residual[base + 2] / 1000,
      mxKnM: residual[base + 3] / 1000,
      myKnM: residual[base + 4] / 1000,
      mzKnM: residual[base + 5] / 1000,
    };
  });

  const maxDisplacementMm = Math.max(...nodes.map((n) => Math.sqrt(n.uxMm ** 2 + n.uyMm ** 2 + n.uzMm ** 2)));
  const maxMomentKnM = Math.max(...members.map((m) => Math.max(m.momentYKnM, m.momentZKnM)));
  return { loadCase, nodes, members, reactions, maxDisplacementMm, maxMomentKnM };
}

export function solveGlobalFrame3D(
  input: CourtEngineeringInput,
  model: StructuralModel,
  assumptions: StructuralAnalysisInput = DEFAULT_ANALYSIS_INPUT,
): Frame3DSolverResult {
  const ids: Frame3DLoadCaseId[] = ["WIND_X", "WIND_Y", "IMPACT_X", "IMPACT_Y", "SELF_WEIGHT"];
  const cases = ids.map((id) => solveCase(id, input, model, assumptions));
  const dispGov = [...cases].sort((a, b) => b.maxDisplacementMm - a.maxDisplacementMm)[0];
  const momentGov = [...cases].sort((a, b) => b.maxMomentKnM - a.maxMomentKnM)[0];
  return {
    schema: "GF-FRAME3D-0.5",
    solver: "LINEAR_ELASTIC_SPACE_FRAME_12X12",
    dofPerNode: 6,
    status: "PRELIMINARY",
    cases,
    envelope: {
      maxDisplacementMm: dispGov.maxDisplacementMm,
      maxMomentKnM: momentGov.maxMomentKnM,
      governingDisplacementCase: dispGov.loadCase,
      governingMomentCase: momentGov.loadCase,
    },
    limitations: [
      "Linear-elastic first-order 3D frame analysis only.",
      "Loads are preliminary Gamefields coordination cases, not a substitute for project-specific code load generation and combinations.",
      "Section torsion uses a simplified pre-design J approximation; second-order effects, local buckling, joint semi-rigidity, panel stiffness and soil-structure interaction are not included.",
      "Independent solver verification and review by a qualified structural engineer remain mandatory before fabrication or construction release.",
    ],
  };
}
