import { RHS_SECTIONS, type CourtEngineeringInput } from "./domain";
import type { StructuralAnalysisInput } from "./analysis";

export type SolverCaseId = "WIND_X" | "WIND_Y" | "IMPACT_X" | "IMPACT_Y";

export interface BeamSolverNode {
  id: string;
  zMm: number;
  verticalDisplacementMm: number;
  rotationRad: number;
}

export interface BeamSolverReaction {
  shearKn: number;
  momentKnM: number;
}

export interface BeamSolverCaseResult {
  id: SolverCaseId;
  characteristic: boolean;
  nodes: BeamSolverNode[];
  tipDisplacementMm: number;
  maxDisplacementMm: number;
  supportReaction: BeamSolverReaction;
}

export interface PreliminarySolverResult {
  schema: "GF-SOLVER-0.1";
  method: "EULER_BERNOULLI_BEAM_FEM";
  sectionCode: string;
  elasticModulusMpa: number;
  secondMomentAreaMm4: number;
  totalHeightMm: number;
  tributaryWidthMm: number;
  cases: BeamSolverCaseResult[];
  envelope: {
    maxCharacteristicDisplacementMm: number;
    maxCharacteristicSupportShearKn: number;
    maxCharacteristicSupportMomentKnM: number;
    governingCase: SolverCaseId;
  };
  limitations: string[];
}

const E_STEEL_MPA = 210_000;

function sectionInertiaMm4(sectionCode: string) {
  const section = RHS_SECTIONS.find((item) => item.code === sectionCode) ?? RHS_SECTIONS[0];
  const h = section.heightMm;
  const b = section.widthMm;
  const t = section.wallMm;
  const hi = Math.max(0, h - 2 * t);
  const bi = Math.max(0, b - 2 * t);
  return (b * h ** 3 - bi * hi ** 3) / 12;
}

function beamK(ei: number, lengthMm: number) {
  const l = lengthMm;
  const f = ei / l ** 3;
  return [
    [12 * f, 6 * l * f, -12 * f, 6 * l * f],
    [6 * l * f, 4 * l * l * f, -6 * l * f, 2 * l * l * f],
    [-12 * f, -6 * l * f, 12 * f, -6 * l * f],
    [6 * l * f, 2 * l * l * f, -6 * l * f, 4 * l * l * f],
  ];
}

function udlEquivalentNodalLoad(wNPerMm: number, lengthMm: number) {
  const l = lengthMm;
  return [wNPerMm * l / 2, wNPerMm * l ** 2 / 12, wNPerMm * l / 2, -wNPerMm * l ** 2 / 12];
}

function solveLinear(a: number[][], b: number[]) {
  const n = b.length;
  const m = a.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let r = col + 1; r < n; r += 1) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    if (Math.abs(m[pivot][col]) < 1e-12) throw new Error("Singular preliminary solver matrix");
    [m[col], m[pivot]] = [m[pivot], m[col]];
    const div = m[col][col];
    for (let c = col; c <= n; c += 1) m[col][c] /= div;
    for (let r = 0; r < n; r += 1) {
      if (r === col) continue;
      const factor = m[r][col];
      for (let c = col; c <= n; c += 1) m[r][c] -= factor * m[col][c];
    }
  }
  return m.map((row) => row[n]);
}

function runBeamCase(args: {
  id: SolverCaseId;
  levelMm: number[];
  ei: number;
  elementLoads: number[];
  pointLoads: Array<{ nodeIndex: number; forceN: number }>;
}): BeamSolverCaseResult {
  const nNodes = args.levelMm.length;
  const dof = nNodes * 2;
  const kGlobal = Array.from({ length: dof }, () => Array(dof).fill(0));
  const fGlobal = Array(dof).fill(0);

  for (let e = 0; e < nNodes - 1; e += 1) {
    const l = args.levelMm[e + 1] - args.levelMm[e];
    const k = beamK(args.ei, l);
    const fe = udlEquivalentNodalLoad(args.elementLoads[e] ?? 0, l);
    const map = [e * 2, e * 2 + 1, (e + 1) * 2, (e + 1) * 2 + 1];
    for (let i = 0; i < 4; i += 1) {
      fGlobal[map[i]] += fe[i];
      for (let j = 0; j < 4; j += 1) kGlobal[map[i]][map[j]] += k[i][j];
    }
  }

  for (const point of args.pointLoads) fGlobal[point.nodeIndex * 2] += point.forceN;

  const free = Array.from({ length: dof - 2 }, (_, i) => i + 2);
  const kff = free.map((r) => free.map((c) => kGlobal[r][c]));
  const ff = free.map((r) => fGlobal[r]);
  const uf = solveLinear(kff, ff);
  const u = Array(dof).fill(0);
  free.forEach((d, i) => { u[d] = uf[i]; });

  const reaction = Array(dof).fill(0).map((_, r) => kGlobal[r].reduce((sum, kij, c) => sum + kij * u[c], 0) - fGlobal[r]);
  const nodes: BeamSolverNode[] = args.levelMm.map((zMm, i) => ({
    id: `P${String(i + 1).padStart(2, "0")}`,
    zMm,
    verticalDisplacementMm: u[i * 2],
    rotationRad: u[i * 2 + 1],
  }));

  const displacements = nodes.map((n) => Math.abs(n.verticalDisplacementMm));
  return {
    id: args.id,
    characteristic: true,
    nodes,
    tipDisplacementMm: nodes[nodes.length - 1]?.verticalDisplacementMm ?? 0,
    maxDisplacementMm: Math.max(...displacements, 0),
    supportReaction: {
      shearKn: Math.abs(reaction[0]) / 1000,
      momentKnM: Math.abs(reaction[1]) / 1_000_000,
    },
  };
}

export function solvePreliminaryPostFEM(
  input: CourtEngineeringInput,
  assumptions: StructuralAnalysisInput,
): PreliminarySolverResult {
  const totalHeightMm = Math.max(100, (input.boardHeightM + input.netHeightM) * 1000);
  const boardTopMm = Math.max(0, Math.min(totalHeightMm, input.boardHeightM * 1000));
  const levelMm = boardTopMm > 0 && boardTopMm < totalHeightMm ? [0, boardTopMm, totalHeightMm] : [0, totalHeightMm];
  const ix = sectionInertiaMm4(input.postSectionCode);
  const ei = E_STEEL_MPA * ix;
  const tributaryWidthMm = Math.max(500, input.postSpacingM * 1000);
  const qNPerMm2 = assumptions.windPressureKpa / 1000;

  const windLoads = levelMm.slice(0, -1).map((z, i) => {
    const mid = (z + levelMm[i + 1]) / 2;
    const solidity = mid <= boardTopMm ? 1 : Math.max(0, Math.min(1, assumptions.netSolidity));
    return qNPerMm2 * tributaryWidthMm * solidity;
  });

  const boardNodeIndex = levelMm.reduce((best, z, i) => Math.abs(z - boardTopMm) < Math.abs(levelMm[best] - boardTopMm) ? i : best, 0);
  const impactN = Math.max(0, assumptions.impactLoadKn) * 1000;

  const windX = runBeamCase({ id: "WIND_X", levelMm, ei, elementLoads: windLoads, pointLoads: [] });
  const windY = runBeamCase({ id: "WIND_Y", levelMm, ei, elementLoads: windLoads, pointLoads: [] });
  const impactX = runBeamCase({ id: "IMPACT_X", levelMm, ei, elementLoads: windLoads.map(() => 0), pointLoads: [{ nodeIndex: boardNodeIndex, forceN: impactN }] });
  const impactY = runBeamCase({ id: "IMPACT_Y", levelMm, ei, elementLoads: windLoads.map(() => 0), pointLoads: [{ nodeIndex: boardNodeIndex, forceN: impactN }] });
  const cases = [windX, windY, impactX, impactY];
  const governing = [...cases].sort((a, b) => b.supportReaction.momentKnM - a.supportReaction.momentKnM)[0];

  return {
    schema: "GF-SOLVER-0.1",
    method: "EULER_BERNOULLI_BEAM_FEM",
    sectionCode: input.postSectionCode,
    elasticModulusMpa: E_STEEL_MPA,
    secondMomentAreaMm4: ix,
    totalHeightMm,
    tributaryWidthMm,
    cases,
    envelope: {
      maxCharacteristicDisplacementMm: Math.max(...cases.map((c) => c.maxDisplacementMm)),
      maxCharacteristicSupportShearKn: Math.max(...cases.map((c) => c.supportReaction.shearKn)),
      maxCharacteristicSupportMomentKnM: Math.max(...cases.map((c) => c.supportReaction.momentKnM)),
      governingCase: governing.id,
    },
    limitations: [
      "Linear-elastic beam FEM of a representative perimeter post only.",
      "No geometric nonlinearity, frame interaction, torsion, connection flexibility, buckling, fatigue or dynamic impact amplification.",
      "Wind pressure is supplied by the project assumptions and is not derived from a National Annex in this solver version.",
      "Results are for pre-design coordination and must be verified by a qualified structural engineer before fabrication or construction.",
    ],
  };
}
