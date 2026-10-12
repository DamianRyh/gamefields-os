import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzePreliminaryStructure, DEFAULT_ANALYSIS_INPUT } from "../../../engineering/analysis";
import { basePlateToDxf, modelToDxf, modelToStepReference } from "../../../engineering/cad";
import { COURT_PRESETS, RHS_SECTIONS, estimateCourtStructure } from "../../../engineering/domain";
import { runEngineerReviewGate } from "../../../engineering/engineer";
import { DEFAULT_EUROCODE_PROFILE, eurocodeUtilizationToCsv, runEurocodeEngine } from "../../../engineering/eurocode";
import { buildFabricationPackage, cutListToCsv } from "../../../engineering/fabrication";
import { sizeBaseConnectionConcept } from "../../../engineering/foundation";
import { solveGlobalFrame3D } from "../../../engineering/frame3d";
import { generateRectangularCourtModel } from "../../../engineering/model";
import { optimizePostSection } from "../../../engineering/optimizer";
import { buildEngineeringHandoffPackage, handoffToCsv } from "../../../engineering/package";
import { DEFAULT_PROJECT_PROFILE } from "../../../engineering/project";
import { buildSolverNeutralModel, solverNeutralToCsv } from "../../../engineering/solver-adapters";
import { solvePreliminaryPostFEM } from "../../../engineering/solver";

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
  eurocode: z.object({
    gammaG: z.number().positive().optional(),
    gammaQ: z.number().positive().optional(),
    gammaM0: z.number().positive().optional(),
    serviceabilityLimitRatio: z.number().positive().optional(),
  }).optional(),
  project: z.object({
    projectName: z.string().min(1).optional(),
    projectCode: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    revision: z.string().min(1).optional(),
  }).optional(),
  export: z.enum([
    "package",
    "cut_csv",
    "member_csv",
    "model_dxf",
    "base_plate_dxf",
    "step_reference",
    "solver_csv",
    "frame3d_json",
    "eurocode_json",
    "utilization_csv",
  ]).default("package"),
});

function textResponse(content: string, contentType: string, filename: string) {
  return new Response(content, {
    headers: {
      "content-type": contentType,
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid production input", details: parsed.error.flatten() }, { status: 400 });

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

  if (!RHS_SECTIONS.some((s) => s.code === input.postSectionCode) || !RHS_SECTIONS.some((s) => s.code === input.railSectionCode)) {
    return NextResponse.json({ error: "Unknown steel section" }, { status: 400 });
  }

  const assumptions = {
    ...DEFAULT_ANALYSIS_INPUT,
    windPressureKpa: body.windPressureKpa ?? DEFAULT_ANALYSIS_INPUT.windPressureKpa,
    netSolidity: body.netSolidity ?? DEFAULT_ANALYSIS_INPUT.netSolidity,
    impactLoadKn: body.impactLoadKn ?? DEFAULT_ANALYSIS_INPUT.impactLoadKn,
    serviceabilityLimitRatio: body.serviceabilityLimitRatio ?? DEFAULT_ANALYSIS_INPUT.serviceabilityLimitRatio,
  };

  const eurocodeProfile = {
    ...DEFAULT_EUROCODE_PROFILE,
    gammaG: body.eurocode?.gammaG ?? DEFAULT_EUROCODE_PROFILE.gammaG,
    gammaQ: body.eurocode?.gammaQ ?? DEFAULT_EUROCODE_PROFILE.gammaQ,
    gammaM0: body.eurocode?.gammaM0 ?? DEFAULT_EUROCODE_PROFILE.gammaM0,
    serviceabilityLimitRatio: body.eurocode?.serviceabilityLimitRatio ?? DEFAULT_EUROCODE_PROFILE.serviceabilityLimitRatio,
  };

  const profile = {
    ...DEFAULT_PROJECT_PROFILE,
    projectName: body.project?.projectName ?? DEFAULT_PROJECT_PROFILE.projectName,
    projectCode: body.project?.projectCode ?? DEFAULT_PROJECT_PROFILE.projectCode,
    city: body.project?.city ?? DEFAULT_PROJECT_PROFILE.city,
    revision: body.project?.revision ?? DEFAULT_PROJECT_PROFILE.revision,
  };

  const estimate = estimateCourtStructure(input);
  const model = generateRectangularCourtModel(input);
  const analysis = analyzePreliminaryStructure(input, model, assumptions);
  const solver = solvePreliminaryPostFEM(input, assumptions);
  const frame3d = solveGlobalFrame3D(input, model, assumptions);
  const eurocode = runEurocodeEngine({ input, model, frame3d, profile: eurocodeProfile });
  const optimization = optimizePostSection(input, assumptions);
  const baseConnection = sizeBaseConnectionConcept(input, analysis);
  const fabrication = buildFabricationPackage({ input, estimate, model, analysis, solver, baseConnection });
  const solverNeutral = buildSolverNeutralModel(input, model, solver);
  const engineerGate = runEngineerReviewGate({ analysis, solver, frame3d, eurocode, baseConnection, fabrication });
  const pkg = buildEngineeringHandoffPackage({ profile, input, estimate, model, analysis, solver, frame3d, eurocode, optimization, baseConnection, fabrication, engineerGate, solverNeutral });

  const stem = `${profile.projectCode}-${profile.revision}`.replace(/[^A-Za-z0-9_-]/g, "_");
  switch (body.export) {
    case "cut_csv": return textResponse(cutListToCsv(fabrication), "text/csv; charset=utf-8", `${stem}-cut-list.csv`);
    case "member_csv": return textResponse(handoffToCsv(pkg), "text/csv; charset=utf-8", `${stem}-members.csv`);
    case "model_dxf": return textResponse(modelToDxf(model), "application/dxf", `${stem}-model.dxf`);
    case "base_plate_dxf": return textResponse(basePlateToDxf(fabrication), "application/dxf", `${stem}-base-plate.dxf`);
    case "step_reference": return textResponse(modelToStepReference(model, stem), "application/step", `${stem}-reference.step`);
    case "solver_csv": return textResponse(solverNeutralToCsv(solverNeutral), "text/csv; charset=utf-8", `${stem}-solver.csv`);
    case "frame3d_json": return textResponse(JSON.stringify(frame3d, null, 2), "application/json; charset=utf-8", `${stem}-frame3d.json`);
    case "eurocode_json": return textResponse(JSON.stringify(eurocode, null, 2), "application/json; charset=utf-8", `${stem}-eurocode.json`);
    case "utilization_csv": return textResponse(eurocodeUtilizationToCsv(eurocode), "text/csv; charset=utf-8", `${stem}-utilization.csv`);
    default: return NextResponse.json(pkg);
  }
}
