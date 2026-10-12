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
    engineVersion: "gamefields-engineering-v0.3",
    status: "pre-design" as const,
    generatedAt: new Date().toISOString(),
    verificationRequired: true,
  };
}
