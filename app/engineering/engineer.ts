import type { StructuralAnalysisResult } from "./analysis";
import type { FabricationPackage } from "./fabrication";
import type { BaseConnectionConcept } from "./foundation";
import type { PreliminarySolverResult } from "./solver";

export type EngineerCheckStatus = "PASS" | "WARN" | "BLOCK";

export interface EngineerCheck {
  id: string;
  label: string;
  status: EngineerCheckStatus;
  note: string;
}

export interface EngineerReviewGate {
  schema: "GF-ENGINEER-GATE-0.1";
  checks: EngineerCheck[];
  summary: {
    pass: number;
    warn: number;
    block: number;
  };
  releaseStatus: "PRE_DESIGN_READY" | "ENGINEER_REVIEW_REQUIRED" | "BLOCKED";
  fabricationReleaseAllowed: false;
  constructionReleaseAllowed: false;
  requiredNextActions: string[];
}

export function runEngineerReviewGate(args: {
  analysis: StructuralAnalysisResult;
  solver: PreliminarySolverResult;
  baseConnection: BaseConnectionConcept;
  fabrication: FabricationPackage;
}): EngineerReviewGate {
  const checks: EngineerCheck[] = [];

  checks.push({
    id: "ULS_SCREEN",
    label: "Preliminary section resistance screen",
    status: args.analysis.postCheck.resistanceStatus === "OK" ? "PASS" : "BLOCK",
    note: `ULS utilization ${(args.analysis.postCheck.utilization * 100).toFixed(0)}%.`,
  });

  checks.push({
    id: "SLS_SCREEN",
    label: "Preliminary deflection screen",
    status: args.analysis.postCheck.deflectionStatus === "OK" ? "PASS" : "BLOCK",
    note: `SLS utilization ${(args.analysis.postCheck.deflectionUtilization * 100).toFixed(0)}%.`,
  });

  checks.push({
    id: "FEM_CONSISTENCY",
    label: "Internal FEM solver result available",
    status: Number.isFinite(args.solver.envelope.maxCharacteristicSupportMomentKnM) ? "PASS" : "BLOCK",
    note: `${args.solver.method}; governing case ${args.solver.envelope.governingCase}.`,
  });

  checks.push({
    id: "BASE_CONNECTION",
    label: "Base connection geometry",
    status: args.baseConnection.status === "CONCEPT_ONLY" ? "WARN" : "PASS",
    note: "Base plate and anchors are concept geometry only; anchor/concrete verification remains required.",
  });

  checks.push({
    id: "FABRICATION_DATA",
    label: "Fabrication register generated",
    status: args.fabrication.cutList.length > 0 && args.fabrication.plates.length > 0 ? "PASS" : "BLOCK",
    note: `${args.fabrication.cutList.length} cut marks, ${args.fabrication.plates.length} plate type(s), ${args.fabrication.bolts.length} bolt assembly type(s).`,
  });

  checks.push({
    id: "WELD_VERIFICATION",
    label: "Weld design verification",
    status: "WARN",
    note: "Weld sizes are production placeholders until connection forces and weld resistance are checked.",
  });

  checks.push({
    id: "ANCHOR_VERIFICATION",
    label: "Anchor and concrete verification",
    status: "WARN",
    note: "Anchor grade, embedment, edge distances, pry-out, concrete cone and reinforcement are not verified yet.",
  });

  checks.push({
    id: "GLOBAL_FRAME",
    label: "Global 3D frame analysis",
    status: "WARN",
    note: "Current internal solver analyses a representative post; full frame interaction and bracing behaviour require external/global solver verification.",
  });

  checks.push({
    id: "NATIONAL_ANNEX",
    label: "Project-specific wind / National Annex",
    status: "WARN",
    note: "Wind input must be confirmed for project location, terrain, height and the applicable National Annex.",
  });

  const summary = {
    pass: checks.filter((c) => c.status === "PASS").length,
    warn: checks.filter((c) => c.status === "WARN").length,
    block: checks.filter((c) => c.status === "BLOCK").length,
  };

  return {
    schema: "GF-ENGINEER-GATE-0.1",
    checks,
    summary,
    releaseStatus: summary.block > 0 ? "BLOCKED" : summary.warn > 0 ? "ENGINEER_REVIEW_REQUIRED" : "PRE_DESIGN_READY",
    fabricationReleaseAllowed: false,
    constructionReleaseAllowed: false,
    requiredNextActions: [
      "Confirm project-specific actions and applicable National Annex.",
      "Run/verify global structural model including bracing and second-order effects where relevant.",
      "Design and verify steel connections, welds, bolts and anchors.",
      "Verify foundations using geotechnical parameters and concrete design.",
      "Obtain review/approval by an appropriately qualified structural engineer before fabrication or construction.",
    ],
  };
}
