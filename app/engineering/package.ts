import type { CourtEngineeringInput, EngineeringEstimate } from "./domain";
import type { StructuralModel } from "./model";
import type { StructuralAnalysisResult } from "./analysis";
import type { SectionOptimizationResult } from "./optimizer";
import type { BaseConnectionConcept } from "./foundation";
import type { EngineeringProjectProfile } from "./project";
import { createProjectSnapshot } from "./project";
import type { PreliminarySolverResult } from "./solver";
import type { Frame3DSolverResult } from "./frame3d";
import type { EurocodeEngineResult } from "./eurocode";
import type { FabricationPackage } from "./fabrication";
import type { EngineerReviewGate } from "./engineer";
import type { SolverNeutralModelV04 } from "./solver-adapters";

export interface EngineeringHandoffPackage {
  version: "gamefields-engineering-v0.6";
  project: ReturnType<typeof createProjectSnapshot>;
  input: CourtEngineeringInput;
  estimate: EngineeringEstimate;
  model: StructuralModel;
  analysis: StructuralAnalysisResult;
  solver?: PreliminarySolverResult;
  frame3d?: Frame3DSolverResult;
  eurocode?: EurocodeEngineResult;
  optimization: SectionOptimizationResult;
  baseConnection: BaseConnectionConcept;
  fabrication?: FabricationPackage;
  engineerGate?: EngineerReviewGate;
  solverNeutral?: SolverNeutralModelV04;
  exports: {
    solverNeutralSchema: "GF-SOLVER-NEUTRAL-0.4";
    frame3dSchema: "GF-FRAME3D-0.5";
    eurocodeSchema: "GF-EUROCODE-0.6";
    fabricationSchema: "GF-FABRICATION-0.4";
    coordinateSystem: "X length / Y width / Z up";
    units: "m-kN-mm-MPa";
    available: ["JSON", "CSV", "DXF", "STEP_REFERENCE"];
  };
  approval: {
    status: "NOT_APPROVED";
    engineerReviewRequired: true;
    fabricationReleaseAllowed: false;
    constructionReleaseAllowed: false;
  };
}

export function buildEngineeringHandoffPackage(args: {
  profile: EngineeringProjectProfile;
  input: CourtEngineeringInput;
  estimate: EngineeringEstimate;
  model: StructuralModel;
  analysis: StructuralAnalysisResult;
  solver?: PreliminarySolverResult;
  frame3d?: Frame3DSolverResult;
  eurocode?: EurocodeEngineResult;
  optimization: SectionOptimizationResult;
  baseConnection: BaseConnectionConcept;
  fabrication?: FabricationPackage;
  engineerGate?: EngineerReviewGate;
  solverNeutral?: SolverNeutralModelV04;
}): EngineeringHandoffPackage {
  return {
    version: "gamefields-engineering-v0.6",
    project: createProjectSnapshot(args.profile),
    input: args.input,
    estimate: args.estimate,
    model: args.model,
    analysis: args.analysis,
    solver: args.solver,
    frame3d: args.frame3d,
    eurocode: args.eurocode,
    optimization: args.optimization,
    baseConnection: args.baseConnection,
    fabrication: args.fabrication,
    engineerGate: args.engineerGate,
    solverNeutral: args.solverNeutral,
    exports: {
      solverNeutralSchema: "GF-SOLVER-NEUTRAL-0.4",
      frame3dSchema: "GF-FRAME3D-0.5",
      eurocodeSchema: "GF-EUROCODE-0.6",
      fabricationSchema: "GF-FABRICATION-0.4",
      coordinateSystem: "X length / Y width / Z up",
      units: "m-kN-mm-MPa",
      available: ["JSON", "CSV", "DXF", "STEP_REFERENCE"],
    },
    approval: {
      status: "NOT_APPROVED",
      engineerReviewRequired: true,
      fabricationReleaseAllowed: false,
      constructionReleaseAllowed: false,
    },
  };
}

export function handoffToCsv(pkg: EngineeringHandoffPackage): string {
  const utilization = new Map(pkg.eurocode?.members.map((m) => [m.memberId, m]) ?? []);
  const rows = [
    ["member_id", "type", "start_node", "end_node", "section", "steel_grade", "length_m", "uls_utilization", "uls_status", "governing_combination"],
    ...pkg.model.members.map((m) => {
      const check = utilization.get(m.id);
      return [
        m.id,
        m.type,
        m.startNodeId,
        m.endNodeId,
        m.sectionCode,
        m.steelGrade,
        m.lengthM.toFixed(3),
        check ? check.utilization.toFixed(4) : "",
        check?.status ?? "",
        check?.governingCombination ?? "",
      ];
    }),
  ];
  return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
}
