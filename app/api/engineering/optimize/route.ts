import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_ANALYSIS_INPUT } from "../../../engineering/analysis";
import { DEFAULT_AUTOMATIC_OPTIMIZER_SETTINGS, optimizerToCsv, runAutomaticStructuralOptimizer } from "../../../engineering/automatic-optimizer";
import { DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS } from "../../../engineering/connection-foundation";
import { COURT_PRESETS, RHS_SECTIONS } from "../../../engineering/domain";
import { DEFAULT_EUROCODE_PROFILE } from "../../../engineering/eurocode";
import { DEFAULT_STABILITY_PROFILE } from "../../../engineering/stability";

const bodySchema = z.object({
  presetId: z.enum(["GF-PANNA-7000", "GF-1V1-10X6", "GF-3V3-15X10"]).default("GF-3V3-15X10"),
  lengthM: z.number().positive().optional(),
  widthM: z.number().positive().optional(),
  boardHeightM: z.number().nonnegative().optional(),
  netHeightM: z.number().nonnegative().optional(),
  steelGrade: z.enum(["S235", "S275", "S355"]).optional(),
  windPressureKpa: z.number().nonnegative().optional(),
  netSolidity: z.number().min(0).max(1).optional(),
  impactLoadKn: z.number().nonnegative().optional(),
  connectionFoundation: z.object({
    concreteStrengthMpa: z.number().positive().optional(),
    anchorDesignTensionResistanceKn: z.number().positive().optional(),
    anchorDesignShearResistanceKn: z.number().positive().optional(),
    weldDesignShearStrengthMpa: z.number().positive().optional(),
    soilDesignBearingKpa: z.number().positive().optional(),
    soilBaseFrictionCoefficient: z.number().positive().optional(),
  }).optional(),
  search: z.object({
    postSpacingOptionsM: z.array(z.number().positive()).max(8).optional(),
    postSectionCodes: z.array(z.string()).max(8).optional(),
    railSectionCodes: z.array(z.string()).max(8).optional(),
    plateThicknessOptionsMm: z.array(z.number().positive()).max(8).optional(),
    anchorDiameterOptionsMm: z.array(z.number().positive()).max(8).optional(),
    footingWidthOptionsMm: z.array(z.number().positive()).max(8).optional(),
    footingDepthOptionsMm: z.array(z.number().positive()).max(8).optional(),
    maxStructuralCandidates: z.number().int().min(1).max(200).optional(),
    maxConnectionSeedDesigns: z.number().int().min(1).max(12).optional(),
  }).optional(),
  export: z.enum(["json", "csv"]).default("json"),
});

function textResponse(content: string, contentType: string, filename: string) {
  return new Response(content, { headers: { "content-type": contentType, "content-disposition": `attachment; filename="${filename}"` } });
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid optimizer input", details: parsed.error.flatten() }, { status: 400 });

  const body = parsed.data;
  const preset = COURT_PRESETS[body.presetId];
  const baseInput = {
    ...preset,
    lengthM: body.lengthM ?? preset.lengthM,
    widthM: body.widthM ?? preset.widthM,
    boardHeightM: body.boardHeightM ?? preset.boardHeightM,
    netHeightM: body.netHeightM ?? preset.netHeightM,
    steelGrade: body.steelGrade ?? preset.steelGrade,
  };
  const analysisInput = {
    ...DEFAULT_ANALYSIS_INPUT,
    windPressureKpa: body.windPressureKpa ?? DEFAULT_ANALYSIS_INPUT.windPressureKpa,
    netSolidity: body.netSolidity ?? DEFAULT_ANALYSIS_INPUT.netSolidity,
    impactLoadKn: body.impactLoadKn ?? DEFAULT_ANALYSIS_INPUT.impactLoadKn,
  };
  const connectionAssumptions = { ...DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS, ...body.connectionFoundation };
  const search = body.search ?? {};
  const postSectionCodes = search.postSectionCodes?.filter((code) => RHS_SECTIONS.some((s) => s.code === code)) ?? DEFAULT_AUTOMATIC_OPTIMIZER_SETTINGS.postSectionCodes;
  const railSectionCodes = search.railSectionCodes?.filter((code) => RHS_SECTIONS.some((s) => s.code === code)) ?? DEFAULT_AUTOMATIC_OPTIMIZER_SETTINGS.railSectionCodes;

  const result = runAutomaticStructuralOptimizer({
    baseInput,
    analysisInput,
    eurocodeProfile: DEFAULT_EUROCODE_PROFILE,
    stabilityProfile: DEFAULT_STABILITY_PROFILE,
    connectionAssumptions,
    settings: {
      ...search,
      postSectionCodes,
      railSectionCodes,
    },
  });

  if (body.export === "csv") return textResponse(optimizerToCsv(result), "text/csv; charset=utf-8", `${body.presetId}-optimizer-v09.csv`);
  return NextResponse.json(result);
}
