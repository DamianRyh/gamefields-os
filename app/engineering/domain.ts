export type CourtPresetId = "GF-PANNA-7000" | "GF-1V1-10X6" | "GF-3V3-15X10";

export type SteelGrade = "S235" | "S275" | "S355";

export type EngineeringStatus = "concept" | "preliminary" | "verified" | "approved";

export interface RectangularHollowSection {
  code: string;
  widthMm: number;
  heightMm: number;
  wallMm: number;
  kgPerM: number;
}

export interface CourtEngineeringInput {
  presetId: CourtPresetId;
  lengthM: number;
  widthM: number;
  boardHeightM: number;
  netHeightM: number;
  postSpacingM: number;
  steelGrade: SteelGrade;
  postSectionCode: string;
  railSectionCode: string;
  gateCount: number;
  goalCount: number;
  zincCoated: boolean;
  powderCoated: boolean;
}

export interface BomLine {
  id: string;
  name: string;
  section?: string;
  quantity: number;
  unit: "m" | "pcs" | "kg";
  unitWeightKg?: number;
  totalWeightKg?: number;
}

export interface EngineeringEstimate {
  perimeterM: number;
  postCount: number;
  verticalSteelM: number;
  horizontalSteelM: number;
  estimatedSteelKg: number;
  estimatedCoatingAreaM2: number;
  bom: BomLine[];
  status: EngineeringStatus;
  warnings: string[];
}

export const RHS_SECTIONS: RectangularHollowSection[] = [
  { code: "RHS 60x40x3", widthMm: 60, heightMm: 40, wallMm: 3, kgPerM: 4.39 },
  { code: "SHS 60x60x3", widthMm: 60, heightMm: 60, wallMm: 3, kgPerM: 5.25 },
  { code: "SHS 80x80x3", widthMm: 80, heightMm: 80, wallMm: 3, kgPerM: 7.11 },
  { code: "SHS 80x80x4", widthMm: 80, heightMm: 80, wallMm: 4, kgPerM: 9.22 },
  { code: "SHS 100x100x4", widthMm: 100, heightMm: 100, wallMm: 4, kgPerM: 11.9 },
];

export const COURT_PRESETS: Record<CourtPresetId, CourtEngineeringInput> = {
  "GF-PANNA-7000": {
    presetId: "GF-PANNA-7000",
    lengthM: 7,
    widthM: 7,
    boardHeightM: 1,
    netHeightM: 0,
    postSpacingM: 1.5,
    steelGrade: "S235",
    postSectionCode: "SHS 60x60x3",
    railSectionCode: "RHS 60x40x3",
    gateCount: 1,
    goalCount: 2,
    zincCoated: true,
    powderCoated: true,
  },
  "GF-1V1-10X6": {
    presetId: "GF-1V1-10X6",
    lengthM: 10,
    widthM: 6,
    boardHeightM: 1,
    netHeightM: 2,
    postSpacingM: 2,
    steelGrade: "S235",
    postSectionCode: "SHS 80x80x3",
    railSectionCode: "RHS 60x40x3",
    gateCount: 1,
    goalCount: 2,
    zincCoated: true,
    powderCoated: true,
  },
  "GF-3V3-15X10": {
    presetId: "GF-3V3-15X10",
    lengthM: 15,
    widthM: 10,
    boardHeightM: 1,
    netHeightM: 4,
    postSpacingM: 2.5,
    steelGrade: "S355",
    postSectionCode: "SHS 80x80x4",
    railSectionCode: "RHS 60x40x3",
    gateCount: 2,
    goalCount: 2,
    zincCoated: true,
    powderCoated: true,
  },
};

function getSection(code: string): RectangularHollowSection {
  return RHS_SECTIONS.find((item) => item.code === code) ?? RHS_SECTIONS[0];
}

export function estimateCourtStructure(input: CourtEngineeringInput): EngineeringEstimate {
  const perimeterM = 2 * (input.lengthM + input.widthM);
  const postCount = Math.max(4, Math.ceil(perimeterM / Math.max(0.5, input.postSpacingM)));
  const postHeightM = input.boardHeightM + input.netHeightM;
  const verticalSteelM = postCount * postHeightM;

  // v0.1: bottom + board-top rail and an additional top rail whenever a ball-stop net is used.
  const railRuns = input.netHeightM > 0 ? 3 : 2;
  const horizontalSteelM = perimeterM * railRuns;

  const postSection = getSection(input.postSectionCode);
  const railSection = getSection(input.railSectionCode);
  const postWeightKg = verticalSteelM * postSection.kgPerM;
  const railWeightKg = horizontalSteelM * railSection.kgPerM;

  // Preliminary allowance for goal frames, gates, plates, brackets and local reinforcements.
  const secondarySteelKg = input.goalCount * 28 + input.gateCount * 18 + postCount * 2.5;
  const estimatedSteelKg = postWeightKg + railWeightKg + secondarySteelKg;

  const estimatedCoatingAreaM2 = estimatedSteelKg * 0.045;

  const warnings = [
    "Estimate only: section adequacy has not been structurally verified.",
    "Wind, impact, crowd loads, foundations, anchors, welds and connections require project-specific calculations.",
    "Final fabrication documentation must be checked and approved by an appropriately qualified structural engineer.",
  ];

  return {
    perimeterM,
    postCount,
    verticalSteelM,
    horizontalSteelM,
    estimatedSteelKg,
    estimatedCoatingAreaM2,
    status: "preliminary",
    warnings,
    bom: [
      {
        id: "posts",
        name: "Perimeter posts",
        section: postSection.code,
        quantity: Number(verticalSteelM.toFixed(2)),
        unit: "m",
        unitWeightKg: postSection.kgPerM,
        totalWeightKg: Number(postWeightKg.toFixed(1)),
      },
      {
        id: "rails",
        name: "Perimeter rails",
        section: railSection.code,
        quantity: Number(horizontalSteelM.toFixed(2)),
        unit: "m",
        unitWeightKg: railSection.kgPerM,
        totalWeightKg: Number(railWeightKg.toFixed(1)),
      },
      {
        id: "secondary",
        name: "Goals, gates, plates and local reinforcements",
        quantity: Number(secondarySteelKg.toFixed(1)),
        unit: "kg",
        totalWeightKg: Number(secondarySteelKg.toFixed(1)),
      },
    ],
  };
}
