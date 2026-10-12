import type { CourtEngineeringInput } from "./domain";
import type { StructuralModel } from "./model";
import type { PreliminarySolverResult } from "./solver";

export interface SolverNeutralModelV04 {
  schema: "GF-SOLVER-NEUTRAL-0.4";
  units: { length: "m"; force: "kN"; stress: "MPa" };
  material: { steelGrade: string; elasticModulusMpa: number };
  nodes: Array<{ id: string; x: number; y: number; z: number; restraint: string }>;
  members: Array<{ id: string; type: string; startNodeId: string; endNodeId: string; sectionCode: string; steelGrade: string }>;
  loadCases: Array<{ id: string; type: "WIND" | "IMPACT"; direction: "X" | "Y"; characteristic: true }>;
  referenceEnvelope: PreliminarySolverResult["envelope"];
}

export function buildSolverNeutralModel(input: CourtEngineeringInput, model: StructuralModel, solver: PreliminarySolverResult): SolverNeutralModelV04 {
  return {
    schema: "GF-SOLVER-NEUTRAL-0.4",
    units: { length: "m", force: "kN", stress: "MPa" },
    material: { steelGrade: input.steelGrade, elasticModulusMpa: solver.elasticModulusMpa },
    nodes: model.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, z: n.z, restraint: n.restraint })),
    members: model.members.map((m) => ({ id: m.id, type: m.type, startNodeId: m.startNodeId, endNodeId: m.endNodeId, sectionCode: m.sectionCode, steelGrade: m.steelGrade })),
    loadCases: [
      { id: "WIND_X", type: "WIND", direction: "X", characteristic: true },
      { id: "WIND_Y", type: "WIND", direction: "Y", characteristic: true },
      { id: "IMPACT_X", type: "IMPACT", direction: "X", characteristic: true },
      { id: "IMPACT_Y", type: "IMPACT", direction: "Y", characteristic: true },
    ],
    referenceEnvelope: solver.envelope,
  };
}

export function solverNeutralToCsv(model: SolverNeutralModelV04) {
  const rows: string[][] = [["record","id","x","y","z","start","end","section","restraint"]];
  for (const node of model.nodes) rows.push(["NODE", node.id, String(node.x), String(node.y), String(node.z), "", "", "", node.restraint]);
  for (const member of model.members) rows.push(["MEMBER", member.id, "", "", "", member.startNodeId, member.endNodeId, member.sectionCode, ""]);
  return rows.map((row) => row.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")).join("\n");
}

export function buildRobotImportManifest(model: SolverNeutralModelV04) {
  return {
    adapter: "AUTODESK_ROBOT_MANIFEST_0.1",
    status: "EXPORT_READY_MANUAL_IMPORT",
    notes: [
      "This manifest prepares node/member/material/section data for a Robot adapter layer.",
      "Robot API execution is not performed by this web module; a desktop/automation bridge is required for direct model creation.",
      "Project loads, combinations and National Annex settings must be confirmed inside the target solver environment.",
    ],
    payload: model,
  };
}

export function buildIdeaConnectionManifest(model: SolverNeutralModelV04) {
  return {
    adapter: "IDEA_STATICA_CONNECTION_MANIFEST_0.1",
    status: "CONNECTION_FORCE_HANDOFF_READY",
    notes: [
      "Connection geometry and force envelopes are prepared for a future IDEA StatiCa connection adapter.",
      "Connection member forces require confirmation from the global frame solver before design release.",
    ],
    referenceEnvelope: model.referenceEnvelope,
  };
}
