import { RHS_SECTIONS, type CourtEngineeringInput } from "./domain";
import { analyzePreliminaryStructure, type StructuralAnalysisInput } from "./analysis";
import { generateRectangularCourtModel } from "./model";

export interface SectionCandidate {
  sectionCode: string;
  kgPerM: number;
  utilization: number;
  deflectionUtilization: number;
  governingStatus: "OK" | "NOT_OK";
  estimatedPostSteelKg: number;
}

export interface SectionOptimizationResult {
  current: SectionCandidate;
  recommended: SectionCandidate | null;
  candidates: SectionCandidate[];
  estimatedPostSteelSavingKg: number;
}

export function optimizePostSection(
  input: CourtEngineeringInput,
  assumptions: StructuralAnalysisInput,
): SectionOptimizationResult {
  const totalHeightM = input.boardHeightM + input.netHeightM;
  const postCount = Math.max(4, Math.ceil((2 * (input.lengthM + input.widthM)) / Math.max(0.5, input.postSpacingM)));

  const candidates = RHS_SECTIONS
    .filter((section) => section.widthMm === section.heightMm)
    .map((section) => {
      const variant: CourtEngineeringInput = { ...input, postSectionCode: section.code };
      const model = generateRectangularCourtModel(variant);
      const result = analyzePreliminaryStructure(variant, model, assumptions).postCheck;
      return {
        sectionCode: section.code,
        kgPerM: section.kgPerM,
        utilization: result.utilization,
        deflectionUtilization: result.deflectionUtilization,
        governingStatus: result.governingStatus,
        estimatedPostSteelKg: postCount * totalHeightM * section.kgPerM,
      } satisfies SectionCandidate;
    })
    .sort((a, b) => a.estimatedPostSteelKg - b.estimatedPostSteelKg);

  const current = candidates.find((candidate) => candidate.sectionCode === input.postSectionCode) ?? candidates[0];
  const recommended = candidates.find((candidate) => candidate.governingStatus === "OK") ?? null;
  const estimatedPostSteelSavingKg = recommended
    ? Math.max(0, current.estimatedPostSteelKg - recommended.estimatedPostSteelKg)
    : 0;

  return { current, recommended, candidates, estimatedPostSteelSavingKg };
}
