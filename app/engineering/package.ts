import type { CourtEngineeringInput, EngineeringEstimate } from "./domain";
import type { StructuralModel } from "./model";
import type { StructuralAnalysisResult } from "./analysis";
import type { SectionOptimizationResult } from "./optimizer";
import type { BaseConnectionConcept } from "./foundation";
import type { EngineeringProjectProfile } from "./project";
import { createProjectSnapshot } from "./project";

export interface EngineeringHandoffPackage {
  project: ReturnType<typeof createProjectSnapshot>;
  input: CourtEngineeringInput;
  estimate: EngineeringEstimate;
  model: StructuralModel;
  analysis: StructuralAnalysisResult;
  optimization: SectionOptimizationResult;
  baseConnection: BaseConnectionConcept;
  exports: {
    solverNeutralSchema: "GF-STRUCTURAL-JSON-0.3";
    coordinateSystem: "X length / Y width / Z up";
    units: "m-kN-mm-MPa";
  };
  approval: {
    status: "NOT_APPROVED";
    engineerReviewRequired: true;
  };
}

export function buildEngineeringHandoffPackage(args: {
  profile: EngineeringProjectProfile;
  input: CourtEngineeringInput;
  estimate: EngineeringEstimate;
  model: StructuralModel;
  analysis: StructuralAnalysisResult;
  optimization: SectionOptimizationResult;
  baseConnection: BaseConnectionConcept;
}): EngineeringHandoffPackage {
  return {
    project: createProjectSnapshot(args.profile),
    input: args.input,
    estimate: args.estimate,
    model: args.model,
    analysis: args.analysis,
    optimization: args.optimization,
    baseConnection: args.baseConnection,
    exports: {
      solverNeutralSchema: "GF-STRUCTURAL-JSON-0.3",
      coordinateSystem: "X length / Y width / Z up",
      units: "m-kN-mm-MPa",
    },
    approval: {
      status: "NOT_APPROVED",
      engineerReviewRequired: true,
    },
  };
}

export function handoffToCsv(pkg: EngineeringHandoffPackage): string {
  const rows = [
    ["member_id", "type", "start_node", "end_node", "section", "steel_grade", "length_m"],
    ...pkg.model.members.map((m) => [m.id, m.type, m.startNodeId, m.endNodeId, m.sectionCode, m.steelGrade, m.lengthM.toFixed(3)]),
  ];
  return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
}
