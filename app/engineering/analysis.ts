import { RHS_SECTIONS, type CourtEngineeringInput, type SteelGrade } from "./domain";
import type { StructuralModel } from "./model";

export interface StructuralAnalysisInput {
  windPressureKpa: number;
  netSolidity: number;
  impactLoadKn: number;
  serviceabilityLimitRatio: number;
  gammaM0: number;
  gammaWind: number;
  gammaImpact: number;
}

export interface LoadCaseResult {
  id: "WIND" | "IMPACT";
  label: string;
  characteristicMomentKnM: number;
  designMomentKnM: number;
}

export interface StructuralCheckResult {
  memberType: "post";
  sectionCode: string;
  steelGrade: SteelGrade;
  resistanceKnM: number;
  governingMomentKnM: number;
  utilization: number;
  characteristicDeflectionMm: number;
  deflectionLimitMm: number;
  deflectionUtilization: number;
  resistanceStatus: "OK" | "NOT_OK";
  deflectionStatus: "OK" | "NOT_OK";
  governingStatus: "OK" | "NOT_OK";
}

export interface StructuralAnalysisResult {
  assumptions: StructuralAnalysisInput;
  loadCases: LoadCaseResult[];
  postCheck: StructuralCheckResult;
  designBasis: string[];
  limitations: string[];
}

export const DEFAULT_ANALYSIS_INPUT: StructuralAnalysisInput = {
  windPressureKpa: 0.8,
  netSolidity: 0.25,
  impactLoadKn: 0.5,
  serviceabilityLimitRatio: 150,
  gammaM0: 1.0,
  gammaWind: 1.5,
  gammaImpact: 1.5,
};

const FY_MPA: Record<SteelGrade, number> = {
  S235: 235,
  S275: 275,
  S355: 355,
};

function sectionGeometry(sectionCode: string) {
  const section = RHS_SECTIONS.find((item) => item.code === sectionCode) ?? RHS_SECTIONS[0];
  const h = section.heightMm;
  const b = section.widthMm;
  const t = section.wallMm;
  const hi = Math.max(0, h - 2 * t);
  const bi = Math.max(0, b - 2 * t);
  const ixMm4 = (b * h ** 3 - bi * hi ** 3) / 12;
  const wxMm3 = ixMm4 / (h / 2);
  return { section, ixMm4, wxMm3 };
}

export function analyzePreliminaryStructure(
  input: CourtEngineeringInput,
  model: StructuralModel,
  assumptions: StructuralAnalysisInput = DEFAULT_ANALYSIS_INPUT,
): StructuralAnalysisResult {
  const heightM = Math.max(0.1, model.meta.totalHeightM);
  const boardHeightM = Math.min(input.boardHeightM, heightM);
  const netTopM = heightM;
  const tributaryWidthM = Math.max(0.5, input.postSpacingM);

  // q [kN/m2] × tributary width [m] => line load [kN/m].
  // Boards are conservatively treated as solid. Net load uses a configurable solidity coefficient.
  const q = Math.max(0, assumptions.windPressureKpa);
  const boardLineLoad = q * tributaryWidthM;
  const netLineLoad = q * tributaryWidthM * Math.max(0, Math.min(1, assumptions.netSolidity));

  const windMomentCharacteristic =
    boardLineLoad * boardHeightM ** 2 / 2 +
    netLineLoad * Math.max(0, netTopM ** 2 - boardHeightM ** 2) / 2;
  const windMomentDesign = windMomentCharacteristic * assumptions.gammaWind;

  // Preliminary local impact check represented as a horizontal point load at board-top level.
  const impactMomentCharacteristic = Math.max(0, assumptions.impactLoadKn) * boardHeightM;
  const impactMomentDesign = impactMomentCharacteristic * assumptions.gammaImpact;

  const governingMomentKnM = Math.max(windMomentDesign, impactMomentDesign);
  const { ixMm4, wxMm3 } = sectionGeometry(input.postSectionCode);
  const fy = FY_MPA[input.steelGrade];
  // Elastic cross-section resistance only; no buckling, interaction, local class or connection checks yet.
  const resistanceKnM = (wxMm3 * fy / Math.max(0.1, assumptions.gammaM0)) / 1_000_000;
  const utilization = resistanceKnM > 0 ? governingMomentKnM / resistanceKnM : Infinity;

  // Serviceability approximation: convert mixed wind exposure into an equivalent UDL over full post height.
  const totalWindForceKn =
    boardLineLoad * boardHeightM + netLineLoad * Math.max(0, netTopM - boardHeightM);
  const equivalentLineLoadKnPerM = totalWindForceKn / heightM;
  const eMpa = 210_000;
  const heightMm = heightM * 1000;
  const loadNPerMm = equivalentLineLoadKnPerM;
  const windDeflectionMm = (loadNPerMm * heightMm ** 4) / (8 * eMpa * ixMm4);
  const impactLoadN = Math.max(0, assumptions.impactLoadKn) * 1000;
  const impactHeightMm = boardHeightM * 1000;
  const impactDeflectionMm = (impactLoadN * impactHeightMm ** 3) / (3 * eMpa * ixMm4);
  const characteristicDeflectionMm = Math.max(windDeflectionMm, impactDeflectionMm);
  const deflectionLimitMm = heightMm / Math.max(1, assumptions.serviceabilityLimitRatio);
  const deflectionUtilization = characteristicDeflectionMm / Math.max(0.001, deflectionLimitMm);

  const resistanceStatus = utilization <= 1 ? "OK" : "NOT_OK";
  const deflectionStatus = deflectionUtilization <= 1 ? "OK" : "NOT_OK";

  return {
    assumptions,
    loadCases: [
      {
        id: "WIND",
        label: "Preliminary horizontal wind pressure",
        characteristicMomentKnM: windMomentCharacteristic,
        designMomentKnM: windMomentDesign,
      },
      {
        id: "IMPACT",
        label: "Preliminary board-level impact",
        characteristicMomentKnM: impactMomentCharacteristic,
        designMomentKnM: impactMomentDesign,
      },
    ],
    postCheck: {
      memberType: "post",
      sectionCode: input.postSectionCode,
      steelGrade: input.steelGrade,
      resistanceKnM,
      governingMomentKnM,
      utilization,
      characteristicDeflectionMm,
      deflectionLimitMm,
      deflectionUtilization,
      resistanceStatus,
      deflectionStatus,
      governingStatus: resistanceStatus === "OK" && deflectionStatus === "OK" ? "OK" : "NOT_OK",
    },
    designBasis: [
      "EN 1990 family: basis of structural design and combinations — integration target, not a certified implementation in v0.2.",
      "EN 1991 family: actions on structures; wind pressure is currently supplied as a project input.",
      "EN 1993 family: steel design; v0.2 uses an elastic cross-section bending screen only.",
    ],
    limitations: [
      "This is a pre-design screening engine, not a Eurocode conformity certificate.",
      "No global frame analysis, second-order effects, buckling, member interaction, section classification or fatigue checks are included yet.",
      "Connections, welds, bolts, anchors, foundations, soil, gates, goals and accidental actions are not verified.",
      "Wind pressure must later be derived from project location, terrain, height, orography and the applicable National Annex.",
      "Final structural design and fabrication documentation require verification by an appropriately qualified structural engineer.",
    ],
  };
}
