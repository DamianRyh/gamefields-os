import type { StructuralAnalysisResult } from "./analysis";
import type { CourtEngineeringInput, EngineeringEstimate } from "./domain";
import type { BaseConnectionConcept } from "./foundation";
import type { StructuralModel } from "./model";

export interface CutListItem {
  mark: string;
  memberType: string;
  sectionCode: string;
  steelGrade: string;
  lengthMm: number;
  quantity: number;
  totalLengthMm: number;
  estimatedWeightKg: number | null;
  sourceMemberIds: string[];
  endA: "SQUARE";
  endB: "SQUARE";
}

export interface PlateHole {
  xMm: number;
  yMm: number;
  diameterMm: number;
}

export interface FabricationPlate {
  mark: string;
  purpose: "BASE_PLATE";
  widthMm: number;
  lengthMm: number;
  thicknessMm: number;
  steelGrade: string;
  quantity: number;
  holes: PlateHole[];
  status: "PRELIMINARY";
}

export interface BoltAssembly {
  mark: string;
  purpose: "ANCHOR";
  specification: string;
  diameterMm: number;
  quantityPerAssembly: number;
  assemblyCount: number;
  totalQuantity: number;
  status: "TO_BE_VERIFIED";
}

export interface WeldItem {
  mark: string;
  joint: "POST_TO_BASE_PLATE" | "RAIL_TO_POST";
  weldType: "FILLET";
  nominalSizeMm: number;
  lengthMm: number | null;
  quantity: number;
  status: "TO_BE_VERIFIED";
}

export interface SupportReaction {
  supportNodeId: string;
  loadCase: "ENVELOPE_PRELIMINARY";
  fxKn: number;
  fyKn: number;
  fzKn: number;
  mxKnM: number;
  myKnM: number;
  mzKnM: number;
  status: "PRELIMINARY";
}

export interface FabricationPackage {
  schema: "GF-FABRICATION-0.4";
  cutList: CutListItem[];
  plates: FabricationPlate[];
  bolts: BoltAssembly[];
  welds: WeldItem[];
  supportReactions: SupportReaction[];
  summary: {
    cutMarks: number;
    plateCount: number;
    boltCount: number;
    weldItems: number;
    supportCount: number;
  };
  release: {
    status: "ENGINEER_REVIEW_REQUIRED";
    fabricationReleaseAllowed: false;
  };
}

const SECTION_KG_PER_M: Record<string, number> = {
  "RHS 60x40x3": 4.39,
  "SHS 60x60x3": 5.25,
  "SHS 80x80x3": 7.11,
  "SHS 80x80x4": 9.22,
  "SHS 100x100x4": 11.9,
};

function groupCutList(model: StructuralModel): CutListItem[] {
  const grouped = new Map<string, { memberType: string; sectionCode: string; steelGrade: string; lengthMm: number; ids: string[] }>();
  for (const member of model.members) {
    const lengthMm = Math.round(member.lengthM * 1000);
    const key = `${member.type}|${member.sectionCode}|${member.steelGrade}|${lengthMm}`;
    const row = grouped.get(key);
    if (row) row.ids.push(member.id);
    else grouped.set(key, { memberType: member.type, sectionCode: member.sectionCode, steelGrade: member.steelGrade, lengthMm, ids: [member.id] });
  }

  let mark = 1;
  return [...grouped.values()]
    .sort((a, b) => a.sectionCode.localeCompare(b.sectionCode) || b.lengthMm - a.lengthMm)
    .map((row) => {
      const kgPerM = SECTION_KG_PER_M[row.sectionCode];
      const totalLengthMm = row.lengthMm * row.ids.length;
      return {
        mark: `C${String(mark++).padStart(3, "0")}`,
        memberType: row.memberType,
        sectionCode: row.sectionCode,
        steelGrade: row.steelGrade,
        lengthMm: row.lengthMm,
        quantity: row.ids.length,
        totalLengthMm,
        estimatedWeightKg: kgPerM ? Number(((totalLengthMm / 1000) * kgPerM).toFixed(1)) : null,
        sourceMemberIds: row.ids,
        endA: "SQUARE" as const,
        endB: "SQUARE" as const,
      };
    });
}

function basePlateHoles(base: BaseConnectionConcept): PlateHole[] {
  const offset = base.anchorCircleMm / 2;
  const holeDia = base.anchorDiameterMm + 4;
  return [
    { xMm: -offset, yMm: -offset, diameterMm: holeDia },
    { xMm: offset, yMm: -offset, diameterMm: holeDia },
    { xMm: offset, yMm: offset, diameterMm: holeDia },
    { xMm: -offset, yMm: offset, diameterMm: holeDia },
  ];
}

export function buildFabricationPackage(args: {
  input: CourtEngineeringInput;
  estimate: EngineeringEstimate;
  model: StructuralModel;
  analysis: StructuralAnalysisResult;
  baseConnection: BaseConnectionConcept;
}): FabricationPackage {
  const supportNodes = args.model.nodes.filter((node) => node.z === 0 && node.restraint !== "free");
  const postSection = args.input.postSectionCode.match(/(\d+)x(\d+)/);
  const postFaceMm = postSection ? Number(postSection[1]) : 80;
  const verticalPerSupportKn = (args.estimate.estimatedSteelKg * 9.81 / 1000) / Math.max(1, supportNodes.length);
  const horizontalKn = args.baseConnection.estimatedHorizontalReactionKn;
  const momentKnM = args.analysis.postCheck.governingMomentKnM;

  const plates: FabricationPlate[] = [{
    mark: "P001",
    purpose: "BASE_PLATE",
    widthMm: args.baseConnection.plateWidthMm,
    lengthMm: args.baseConnection.plateLengthMm,
    thicknessMm: args.baseConnection.plateThicknessMm,
    steelGrade: args.input.steelGrade,
    quantity: supportNodes.length,
    holes: basePlateHoles(args.baseConnection),
    status: "PRELIMINARY",
  }];

  const bolts: BoltAssembly[] = [{
    mark: "B001",
    purpose: "ANCHOR",
    specification: `M${args.baseConnection.anchorDiameterMm} anchor assembly — grade/embedment TBD by engineer`,
    diameterMm: args.baseConnection.anchorDiameterMm,
    quantityPerAssembly: args.baseConnection.anchorCount,
    assemblyCount: supportNodes.length,
    totalQuantity: args.baseConnection.anchorCount * supportNodes.length,
    status: "TO_BE_VERIFIED",
  }];

  const welds: WeldItem[] = [
    {
      mark: "W001",
      joint: "POST_TO_BASE_PLATE",
      weldType: "FILLET",
      nominalSizeMm: 6,
      lengthMm: postFaceMm * 4,
      quantity: supportNodes.length,
      status: "TO_BE_VERIFIED",
    },
    {
      mark: "W002",
      joint: "RAIL_TO_POST",
      weldType: "FILLET",
      nominalSizeMm: 4,
      lengthMm: null,
      quantity: args.model.members.filter((m) => m.type === "rail").length * 2,
      status: "TO_BE_VERIFIED",
    },
  ];

  const supportReactions: SupportReaction[] = supportNodes.map((node) => ({
    supportNodeId: node.id,
    loadCase: "ENVELOPE_PRELIMINARY",
    fxKn: Number(horizontalKn.toFixed(3)),
    fyKn: Number(horizontalKn.toFixed(3)),
    fzKn: Number((-verticalPerSupportKn).toFixed(3)),
    mxKnM: Number(momentKnM.toFixed(3)),
    myKnM: Number(momentKnM.toFixed(3)),
    mzKnM: 0,
    status: "PRELIMINARY",
  }));

  const cutList = groupCutList(args.model);
  return {
    schema: "GF-FABRICATION-0.4",
    cutList,
    plates,
    bolts,
    welds,
    supportReactions,
    summary: {
      cutMarks: cutList.length,
      plateCount: plates.reduce((sum, p) => sum + p.quantity, 0),
      boltCount: bolts.reduce((sum, b) => sum + b.totalQuantity, 0),
      weldItems: welds.length,
      supportCount: supportNodes.length,
    },
    release: {
      status: "ENGINEER_REVIEW_REQUIRED",
      fabricationReleaseAllowed: false,
    },
  };
}

export function cutListToCsv(pkg: FabricationPackage): string {
  const rows = [
    ["mark", "type", "section", "steel_grade", "length_mm", "quantity", "total_length_mm", "estimated_weight_kg", "source_members"],
    ...pkg.cutList.map((item) => [item.mark, item.memberType, item.sectionCode, item.steelGrade, item.lengthMm, item.quantity, item.totalLengthMm, item.estimatedWeightKg ?? "", item.sourceMemberIds.join(" ")]),
  ];
  return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
}
