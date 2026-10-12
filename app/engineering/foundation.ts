import type { StructuralAnalysisResult } from "./analysis";
import type { CourtEngineeringInput } from "./domain";

export interface BaseConnectionConcept {
  plateWidthMm: number;
  plateLengthMm: number;
  plateThicknessMm: number;
  anchorCount: number;
  anchorDiameterMm: number;
  anchorCircleMm: number;
  estimatedPeakAnchorTensionKn: number;
  estimatedHorizontalReactionKn: number;
  footingConceptMm: { width: number; length: number; depth: number };
  status: "CONCEPT_ONLY";
  notes: string[];
}

export function sizeBaseConnectionConcept(
  input: CourtEngineeringInput,
  analysis: StructuralAnalysisResult,
): BaseConnectionConcept {
  const momentKnM = Math.max(0, analysis.postCheck.governingMomentKnM);
  const heightM = Math.max(0.5, input.boardHeightM + input.netHeightM);
  const horizontalReactionKn = momentKnM / heightM;

  const base = input.postSectionCode.includes("100x100") ? 300 : input.postSectionCode.includes("80x80") ? 260 : 220;
  const plateThicknessMm = momentKnM > 8 ? 20 : momentKnM > 4 ? 16 : 12;
  const anchorDiameterMm = momentKnM > 8 ? 20 : momentKnM > 4 ? 16 : 12;
  const anchorCircleMm = Math.round(base * 0.68);
  const leverArmM = Math.max(0.12, anchorCircleMm / 1000);
  const estimatedPeakAnchorTensionKn = momentKnM / (2 * leverArmM);

  const footingWidth = momentKnM > 8 ? 1000 : momentKnM > 4 ? 800 : 650;
  const footingDepth = momentKnM > 8 ? 1100 : momentKnM > 4 ? 900 : 750;

  return {
    plateWidthMm: base,
    plateLengthMm: base,
    plateThicknessMm,
    anchorCount: 4,
    anchorDiameterMm,
    anchorCircleMm,
    estimatedPeakAnchorTensionKn,
    estimatedHorizontalReactionKn: horizontalReactionKn,
    footingConceptMm: { width: footingWidth, length: footingWidth, depth: footingDepth },
    status: "CONCEPT_ONLY",
    notes: [
      "Preliminary geometry only; not an anchor or concrete verification.",
      "Anchor grade, embedment, edge distances, concrete strength, reinforcement and pry-out are not checked.",
      "Footing dimensions are placeholders for budgeting and coordination only; geotechnical and structural design is required.",
    ],
  };
}
