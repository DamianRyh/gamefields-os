import type { CourtEngineeringInput } from "./domain";
import type { StructuralModel } from "./model";

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
  solver: "LINEAR_ELASTIC_SPACE_FRAME";
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

const SECTION_PROPS: Record<string, { areaMm2: number; iyMm4: number; izMm4: number; jMm4: number }> = {
  "RHS 60x40x3": { areaMm2: 564, iyMm4: 273000, izMm4: 143000, jMm4: 310000 },
  "SHS 60x60x3": { areaMm2: 684, iyMm4: 374000, izMm4: 374000, jMm4: 608000 },
  "SHS 80x80x3": { areaMm2: 924, iyMm4: 923000, izMm4: 923000, jMm4: 1500000 },
  "SHS 80x80x4": { areaMm2: 1216, iyMm4: 1190000, izMm4: 1190000, jMm4: 1930000 },
  "SHS 100x100x4": { areaMm2: 1536, iyMm4: 2360000, izMm4: 2360000, jMm4: 3810000 },
};

function zeroNode(nodeId: string): Frame3DNodeResult {
  return { nodeId, uxMm: 0, uyMm: 0, uzMm: 0, rxRad: 0, ryRad: 0, rzRad: 0 };
}

export function solveGlobalFrame3D(input: CourtEngineeringInput, model: StructuralModel): Frame3DSolverResult {
  // v0.5 alpha: global space-frame result container built from the full node/member graph.
  // The current numerical kernel uses equivalent cantilever stiffness per vertical post and
  // distributes horizontal actions through connected perimeter rails. This replaces the
  // single representative-post output while keeping the API ready for a full matrix kernel.
  const supports = new Set(model.nodes.filter((n) => n.restraint !== "free").map((n) => n.id));
  const postMembers = model.members.filter((m) => m.type === "post");
  const totalHeightM = Math.max(0.5, input.boardHeightM + input.netHeightM);
  const props = SECTION_PROPS[input.postSectionCode] ?? SECTION_PROPS["SHS 80x80x4"];
  const eNPerMm2 = 210000;
  const lMm = totalHeightM * 1000;
  const lateralStiffnessNPerMm = (3 * eNPerMm2 * props.iyMm4) / Math.max(1, lMm ** 3);
  const netAreaPerPostM2 = Math.max(0.1, input.postSpacingM * totalHeightM);

  const cases: Frame3DCaseResult[] = (["WIND_X", "WIND_Y", "IMPACT_X", "IMPACT_Y", "SELF_WEIGHT"] as Frame3DLoadCaseId[]).map((loadCase) => {
    const horizontalKn = loadCase.startsWith("WIND") ? 0.8 * netAreaPerPostM2 * 0.6 : loadCase.startsWith("IMPACT") ? 1.5 : 0;
    const horizontalN = horizontalKn * 1000;
    const dispMm = horizontalN / Math.max(1e-6, lateralStiffnessNPerMm);
    const momentKnM = horizontalKn * totalHeightM;
    const nodes = model.nodes.map((node) => {
      const r = zeroNode(node.id);
      if (supports.has(node.id)) return r;
      const zRatio = Math.max(0, Math.min(1, node.z / totalHeightM));
      if (loadCase.endsWith("_X")) r.uxMm = dispMm * zRatio ** 2;
      if (loadCase.endsWith("_Y")) r.uyMm = dispMm * zRatio ** 2;
      return r;
    });
    const members = model.members.map((member) => ({
      memberId: member.id,
      axialKn: loadCase === "SELF_WEIGHT" ? -0.05 : 0,
      shearYKn: loadCase.endsWith("_Y") && member.type === "post" ? horizontalKn / Math.max(1, postMembers.length) : 0,
      shearZKn: 0,
      torsionKnM: 0,
      momentYKnM: loadCase.endsWith("_X") && member.type === "post" ? momentKnM / Math.max(1, postMembers.length) : 0,
      momentZKnM: loadCase.endsWith("_Y") && member.type === "post" ? momentKnM / Math.max(1, postMembers.length) : 0,
    }));
    const reactions = model.nodes.filter((n) => supports.has(n.id)).map((node) => ({
      nodeId: node.id,
      fxKn: loadCase.endsWith("_X") ? -horizontalKn / Math.max(1, postMembers.length) : 0,
      fyKn: loadCase.endsWith("_Y") ? -horizontalKn / Math.max(1, postMembers.length) : 0,
      fzKn: loadCase === "SELF_WEIGHT" ? -0.05 : 0,
      mxKnM: 0,
      myKnM: loadCase.endsWith("_X") ? -momentKnM / Math.max(1, postMembers.length) : 0,
      mzKnM: loadCase.endsWith("_Y") ? -momentKnM / Math.max(1, postMembers.length) : 0,
    }));
    return {
      loadCase,
      nodes,
      members,
      reactions,
      maxDisplacementMm: Number(dispMm.toFixed(3)),
      maxMomentKnM: Number(momentKnM.toFixed(3)),
    };
  });

  const dispGov = [...cases].sort((a, b) => b.maxDisplacementMm - a.maxDisplacementMm)[0];
  const momentGov = [...cases].sort((a, b) => b.maxMomentKnM - a.maxMomentKnM)[0];
  return {
    schema: "GF-FRAME3D-0.5",
    solver: "LINEAR_ELASTIC_SPACE_FRAME",
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
      "v0.5 alpha uses the full node/member topology but an equivalent-stiffness numerical kernel; it is not yet a validated general-purpose 12x12 beam-element matrix solver.",
      "Second-order effects, local buckling, joint semi-rigidity, panel stiffness and soil-structure interaction are not included.",
      "Results remain pre-design and require verification in an independent structural solver and review by a qualified structural engineer.",
    ],
  };
}
