export type EurocodeGeneration = "first-generation" | "second-generation-transition";

export interface EngineeringProjectProfile {
  projectName: string;
  projectCode: string;
  country: "PL";
  city: string;
  eurocodeGeneration: EurocodeGeneration;
  nationalAnnex: string;
  designWorkingLifeYears: number;
  executionClassTarget: "EXC2" | "EXC3";
  corrosionProtection: "galvanized" | "galvanized-powder-coated";
  revision: string;
}

export const DEFAULT_PROJECT_PROFILE: EngineeringProjectProfile = {
  projectName: "Gamefields court",
  projectCode: "GF-PRE-DESIGN",
  country: "PL",
  city: "Warsaw",
  eurocodeGeneration: "first-generation",
  nationalAnnex: "Polish National Annex — project verification required",
  designWorkingLifeYears: 25,
  executionClassTarget: "EXC2",
  corrosionProtection: "galvanized-powder-coated",
  revision: "P01",
};

export function createProjectSnapshot(profile: EngineeringProjectProfile) {
  return {
    ...profile,
    engineVersion: "gamefields-engineering-v0.9",
    automaticOptimizerVersion: "GF-AUTO-OPTIMIZER-0.9",
    connectionFoundationEngineVersion: "GF-CONNECTION-FOUNDATION-0.8",
    stabilityEngineVersion: "GF-STABILITY-0.7",
    eurocodeEngineVersion: "GF-EUROCODE-0.6",
    globalFrameSolverVersion: "GF-FRAME3D-0.5",
    status: "pre-design" as const,
    generatedAt: new Date().toISOString(),
    verificationRequired: true,
  };
}
