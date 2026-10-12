import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzePreliminaryStructure, DEFAULT_ANALYSIS_INPUT } from "../../../engineering/analysis";
import { COURT_PRESETS, RHS_SECTIONS } from "../../../engineering/domain";
import { generateRectangularCourtModel } from "../../../engineering/model";
import { optimizePostSection } from "../../../engineering/optimizer";

const bodySchema = z.object({
  presetId: z.enum(["GF-PANNA-7000", "GF-1V1-10X6", "GF-3V3-15X10"]).default("GF-3V3-15X10"),
  lengthM: z.number().positive().optional(),
  widthM: z.number().positive().optional(),
  boardHeightM: z.number().nonnegative().optional(),
  netHeightM: z.number().nonnegative().optional(),
  postSpacingM: z.number().positive().optional(),
  steelGrade: z.enum(["S235", "S275", "S355"]).optional(),
  postSectionCode: z.string().optional(),
  railSectionCode: z.string().optional(),
  windPressureKpa: z.number().nonnegative().optional(),
  netSolidity: z.number().min(0).max(1).optional(),
  impactLoadKn: z.number().nonnegative().optional(),
  serviceabilityLimitRatio: z.number().positive().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid engineering input", details: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;
  const base = COURT_PRESETS[body.presetId];
  const input = {
    ...base,
    lengthM: body.lengthM ?? base.lengthM,
    widthM: body.widthM ?? base.widthM,
    boardHeightM: body.boardHeightM ?? base.boardHeightM,
    netHeightM: body.netHeightM ?? base.netHeightM,
    postSpacingM: body.postSpacingM ?? base.postSpacingM,
    steelGrade: body.steelGrade ?? base.steelGrade,
    postSectionCode: body.postSectionCode ?? base.postSectionCode,
    railSectionCode: body.railSectionCode ?? base.railSectionCode,
  };

  if (!RHS_SECTIONS.some((section) => section.code === input.postSectionCode)) {
    return NextResponse.json({ error: "Unknown post section" }, { status: 400 });
  }
  if (!RHS_SECTIONS.some((section) => section.code === input.railSectionCode)) {
    return NextResponse.json({ error: "Unknown rail section" }, { status: 400 });
  }

  const assumptions = {
    ...DEFAULT_ANALYSIS_INPUT,
    windPressureKpa: body.windPressureKpa ?? DEFAULT_ANALYSIS_INPUT.windPressureKpa,
    netSolidity: body.netSolidity ?? DEFAULT_ANALYSIS_INPUT.netSolidity,
    impactLoadKn: body.impactLoadKn ?? DEFAULT_ANALYSIS_INPUT.impactLoadKn,
    serviceabilityLimitRatio: body.serviceabilityLimitRatio ?? DEFAULT_ANALYSIS_INPUT.serviceabilityLimitRatio,
  };

  const model = generateRectangularCourtModel(input);
  const analysis = analyzePreliminaryStructure(input, model, assumptions);
  const optimization = optimizePostSection(input, assumptions);

  return NextResponse.json({
    version: "gamefields-engineering-v0.2",
    status: "pre-design",
    input,
    model,
    analysis,
    optimization,
  });
}
