import { analyzePreliminaryStructure, DEFAULT_ANALYSIS_INPUT, type StructuralAnalysisInput } from "./analysis";
import { DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS, runConnectionFoundationEngine, type ConnectionFoundationAssumptions, type ConnectionFoundationResult } from "./connection-foundation";
import { RHS_SECTIONS, estimateCourtStructure, type CourtEngineeringInput } from "./domain";
import { DEFAULT_EUROCODE_PROFILE, runEurocodeEngine, type EurocodeEngineResult, type EurocodeProfile } from "./eurocode";
import { sizeBaseConnectionConcept, type BaseConnectionConcept } from "./foundation";
import { solveGlobalFrame3D, type Frame3DSolverResult } from "./frame3d";
import { generateRectangularCourtModel, type StructuralModel } from "./model";
import { DEFAULT_STABILITY_PROFILE, runStabilityEngine, type StabilityEngineResult, type StabilityProfile } from "./stability";

export interface OptimizerCostWeights {
  steelKg: number;
  concreteM3: number;
  basePlateKg: number;
  anchorDiameterMmEach: number;
  supportCount: number;
}

export const DEFAULT_OPTIMIZER_COST_WEIGHTS: OptimizerCostWeights = {
  steelKg: 1,
  concreteM3: 120,
  basePlateKg: 1.25,
  anchorDiameterMmEach: 0.2,
  supportCount: 1.5,
};

export interface AutomaticOptimizerSettings {
  postSpacingOptionsM: number[];
  postSectionCodes: string[];
  railSectionCodes: string[];
  plateThicknessOptionsMm: number[];
  anchorDiameterOptionsMm: number[];
  footingWidthOptionsMm: number[];
  footingDepthOptionsMm: number[];
  maxStructuralCandidates: number;
  maxConnectionSeedDesigns: number;
  costWeights: OptimizerCostWeights;
}

export const DEFAULT_AUTOMATIC_OPTIMIZER_SETTINGS: AutomaticOptimizerSettings = {
  postSpacingOptionsM: [1.5, 2, 2.5, 3],
  postSectionCodes: RHS_SECTIONS.filter((s) => s.widthMm === s.heightMm).map((s) => s.code),
  railSectionCodes: RHS_SECTIONS.map((s) => s.code),
  plateThicknessOptionsMm: [12, 16, 20, 25],
  anchorDiameterOptionsMm: [12, 16, 20, 24],
  footingWidthOptionsMm: [650, 800, 1000, 1200],
  footingDepthOptionsMm: [750, 900, 1100, 1300],
  maxStructuralCandidates: 120,
  maxConnectionSeedDesigns: 8,
  costWeights: DEFAULT_OPTIMIZER_COST_WEIGHTS,
};

export interface StructuralCandidateResult {
  id: string;
  input: CourtEngineeringInput;
  model: StructuralModel;
  frame3d: Frame3DSolverResult;
  eurocode: EurocodeEngineResult;
  stability: StabilityEngineResult;
  estimatedSteelKg: number;
  maxUtilization: number;
  slsUtilization: number;
  failedChecks: number;
  feasible: boolean;
}

export interface OptimizedDesignResult {
  id: string;
  rank: number;
  input: CourtEngineeringInput;
  baseConnection: BaseConnectionConcept;
  connectionFoundation: ConnectionFoundationResult;
  estimatedSteelKg: number;
  estimatedConcreteM3: number;
  estimatedBasePlateKg: number;
  objectiveScore: number;
  maxStructuralUtilization: number;
  maxConnectionUtilization: number;
  feasible: boolean;
  notes: string[];
}

export interface AutomaticOptimizerResult {
  schema: "GF-AUTO-OPTIMIZER-0.9";
  status: "PRE_DESIGN";
  objective: "MINIMIZE_RELATIVE_FABRICATION_AND_FOUNDATION_COST";
  evaluated: {
    structuralCandidates: number;
    structurallyFeasible: number;
    connectionCandidates: number;
    fullyFeasible: number;
  };
  baseline: {
    estimatedSteelKg: number;
    objectiveScore: number | null;
  };
  best: OptimizedDesignResult | null;
  alternatives: OptimizedDesignResult[];
  settings: AutomaticOptimizerSettings;
  limitations: string[];
}

const STEEL_DENSITY_KG_M3 = 7850;

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values.filter((v) => Number.isFinite(v) && v > 0))].sort((a, b) => a - b);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)].filter((code) => RHS_SECTIONS.some((s) => s.code === code));
}

function structuralFailureCount(eurocode: EurocodeEngineResult, stability: StabilityEngineResult): number {
  return eurocode.summary.failedMembers + (eurocode.serviceability.status === "OK" ? 0 : 1) + stability.summary.failedMembers + stability.summary.class4Members;
}

function buildStructuralCandidates(args: {
  baseInput: CourtEngineeringInput;
  analysisInput: StructuralAnalysisInput;
  eurocodeProfile: EurocodeProfile;
  stabilityProfile: StabilityProfile;
  settings: AutomaticOptimizerSettings;
}): StructuralCandidateResult[] {
  const spacings = uniqueNumbers([args.baseInput.postSpacingM, ...args.settings.postSpacingOptionsM]);
  const posts = uniqueStrings([args.baseInput.postSectionCode, ...args.settings.postSectionCodes]);
  const rails = uniqueStrings([args.baseInput.railSectionCode, ...args.settings.railSectionCodes]);
  const out: StructuralCandidateResult[] = [];

  outer: for (const postSpacingM of spacings) {
    for (const postSectionCode of posts) {
      for (const railSectionCode of rails) {
        if (out.length >= args.settings.maxStructuralCandidates) break outer;
        const input: CourtEngineeringInput = { ...args.baseInput, postSpacingM, postSectionCode, railSectionCode };
        const model = generateRectangularCourtModel(input);
        const frame3d = solveGlobalFrame3D(input, model, args.analysisInput);
        const eurocode = runEurocodeEngine({ input, model, frame3d, profile: args.eurocodeProfile });
        const stability = runStabilityEngine({ input, model, frame3d, eurocode, profile: args.stabilityProfile });
        const estimate = estimateCourtStructure(input);
        const failedChecks = structuralFailureCount(eurocode, stability);
        out.push({
          id: `S${String(out.length + 1).padStart(3, "0")}`,
          input,
          model,
          frame3d,
          eurocode,
          stability,
          estimatedSteelKg: estimate.estimatedSteelKg,
          maxUtilization: Math.max(eurocode.summary.maxUtilization, stability.summary.maxCombinedUtilization),
          slsUtilization: eurocode.serviceability.utilization,
          failedChecks,
          feasible: failedChecks === 0,
        });
      }
    }
  }
  return out;
}

function plateMassKg(widthMm: number, lengthMm: number, thicknessMm: number): number {
  return (widthMm / 1000) * (lengthMm / 1000) * (thicknessMm / 1000) * STEEL_DENSITY_KG_M3;
}

function objectiveScore(args: {
  steelKg: number;
  concreteM3: number;
  plateKg: number;
  anchorDiameterMm: number;
  anchorCount: number;
  supportCount: number;
  weights: OptimizerCostWeights;
}): number {
  const w = args.weights;
  return args.steelKg * w.steelKg + args.concreteM3 * w.concreteM3 + args.plateKg * w.basePlateKg + args.anchorDiameterMm * args.anchorCount * args.supportCount * w.anchorDiameterMmEach + args.supportCount * w.supportCount;
}

function optimizedBaseConnection(base: BaseConnectionConcept, args: { plateThicknessMm: number; anchorDiameterMm: number; footingWidthMm: number; footingDepthMm: number }): BaseConnectionConcept {
  const plateSize = Math.max(base.plateWidthMm, base.plateLengthMm, args.footingWidthMm >= 1000 ? 300 : 260);
  const anchorCircleMm = Math.min(Math.round(plateSize * 0.68), Math.max(120, plateSize - 70));
  return {
    ...base,
    plateWidthMm: plateSize,
    plateLengthMm: plateSize,
    plateThicknessMm: args.plateThicknessMm,
    anchorDiameterMm: args.anchorDiameterMm,
    anchorCircleMm,
    footingConceptMm: { width: args.footingWidthMm, length: args.footingWidthMm, depth: args.footingDepthMm },
  };
}

function designConnectionCandidates(args: {
  structural: StructuralCandidateResult;
  analysisInput: StructuralAnalysisInput;
  connectionAssumptions: ConnectionFoundationAssumptions;
  settings: AutomaticOptimizerSettings;
  startIndex: number;
}): OptimizedDesignResult[] {
  const analysis = analyzePreliminaryStructure(args.structural.input, args.structural.model, args.analysisInput);
  const base = sizeBaseConnectionConcept(args.structural.input, analysis);
  const supportCount = args.structural.model.nodes.filter((n) => n.z === 0 && n.restraint !== "free").length;
  const plateThicknesses = uniqueNumbers([base.plateThicknessMm, ...args.settings.plateThicknessOptionsMm]);
  const anchorDiameters = uniqueNumbers([base.anchorDiameterMm, ...args.settings.anchorDiameterOptionsMm]);
  const footingWidths = uniqueNumbers([base.footingConceptMm.width, ...args.settings.footingWidthOptionsMm]);
  const footingDepths = uniqueNumbers([base.footingConceptMm.depth, ...args.settings.footingDepthOptionsMm]);
  const out: OptimizedDesignResult[] = [];

  for (const plateThicknessMm of plateThicknesses) {
    for (const anchorDiameterMm of anchorDiameters) {
      for (const footingWidthMm of footingWidths) {
        for (const footingDepthMm of footingDepths) {
          const baseConnection = optimizedBaseConnection(base, { plateThicknessMm, anchorDiameterMm, footingWidthMm, footingDepthMm });
          const connectionFoundation = runConnectionFoundationEngine({
            input: args.structural.input,
            model: args.structural.model,
            frame3d: args.structural.frame3d,
            plate: baseConnection,
            assumptions: args.connectionAssumptions,
          });
          const concreteM3 = (footingWidthMm / 1000) ** 2 * (footingDepthMm / 1000) * supportCount;
          const singlePlateKg = plateMassKg(baseConnection.plateWidthMm, baseConnection.plateLengthMm, plateThicknessMm);
          const totalPlateKg = singlePlateKg * supportCount;
          const score = objectiveScore({
            steelKg: args.structural.estimatedSteelKg,
            concreteM3,
            plateKg: totalPlateKg,
            anchorDiameterMm,
            anchorCount: baseConnection.anchorCount,
            supportCount,
            weights: args.settings.costWeights,
          });
          out.push({
            id: `D${String(args.startIndex + out.length + 1).padStart(4, "0")}`,
            rank: 0,
            input: args.structural.input,
            baseConnection,
            connectionFoundation,
            estimatedSteelKg: args.structural.estimatedSteelKg,
            estimatedConcreteM3: concreteM3,
            estimatedBasePlateKg: totalPlateKg,
            objectiveScore: score,
            maxStructuralUtilization: args.structural.maxUtilization,
            maxConnectionUtilization: connectionFoundation.summary.maxUtilization,
            feasible: args.structural.feasible && connectionFoundation.summary.failedChecks === 0,
            notes: [
              `Structural seed ${args.structural.id}; spacing ${args.structural.input.postSpacingM.toFixed(2)} m.`,
              `Post ${args.structural.input.postSectionCode}; rail ${args.structural.input.railSectionCode}.`,
              `Relative objective only; unit-cost weights are configurable and are not a supplier quotation.`,
            ],
          });
        }
      }
    }
  }
  return out;
}

export function runAutomaticStructuralOptimizer(args: {
  baseInput: CourtEngineeringInput;
  analysisInput?: StructuralAnalysisInput;
  eurocodeProfile?: EurocodeProfile;
  stabilityProfile?: StabilityProfile;
  connectionAssumptions?: ConnectionFoundationAssumptions;
  settings?: Partial<AutomaticOptimizerSettings>;
}): AutomaticOptimizerResult {
  const analysisInput = args.analysisInput ?? DEFAULT_ANALYSIS_INPUT;
  const eurocodeProfile = args.eurocodeProfile ?? DEFAULT_EUROCODE_PROFILE;
  const stabilityProfile = args.stabilityProfile ?? DEFAULT_STABILITY_PROFILE;
  const connectionAssumptions = args.connectionAssumptions ?? DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS;
  const settings: AutomaticOptimizerSettings = {
    ...DEFAULT_AUTOMATIC_OPTIMIZER_SETTINGS,
    ...args.settings,
    costWeights: { ...DEFAULT_OPTIMIZER_COST_WEIGHTS, ...(args.settings?.costWeights ?? {}) },
  };

  const structural = buildStructuralCandidates({ baseInput: args.baseInput, analysisInput, eurocodeProfile, stabilityProfile, settings });
  const feasibleSeeds = structural
    .filter((s) => s.feasible)
    .sort((a, b) => a.estimatedSteelKg - b.estimatedSteelKg || a.maxUtilization - b.maxUtilization)
    .slice(0, settings.maxConnectionSeedDesigns);

  let connectionCandidates: OptimizedDesignResult[] = [];
  for (const seed of feasibleSeeds) {
    connectionCandidates = connectionCandidates.concat(designConnectionCandidates({
      structural: seed,
      analysisInput,
      connectionAssumptions,
      settings,
      startIndex: connectionCandidates.length,
    }));
  }

  const ranked = connectionCandidates
    .sort((a, b) => Number(b.feasible) - Number(a.feasible) || a.objectiveScore - b.objectiveScore || a.maxStructuralUtilization - b.maxStructuralUtilization)
    .map((row, index) => ({ ...row, rank: index + 1 }));
  const feasible = ranked.filter((r) => r.feasible);
  const best = feasible[0] ?? null;

  const baselineSteelKg = estimateCourtStructure(args.baseInput).estimatedSteelKg;
  const baselineStructural = structural.find((s) => s.input.postSpacingM === args.baseInput.postSpacingM && s.input.postSectionCode === args.baseInput.postSectionCode && s.input.railSectionCode === args.baseInput.railSectionCode);
  const baselineScore = ranked.find((r) => baselineStructural && r.input.postSpacingM === baselineStructural.input.postSpacingM && r.input.postSectionCode === baselineStructural.input.postSectionCode && r.input.railSectionCode === baselineStructural.input.railSectionCode)?.objectiveScore ?? null;

  return {
    schema: "GF-AUTO-OPTIMIZER-0.9",
    status: "PRE_DESIGN",
    objective: "MINIMIZE_RELATIVE_FABRICATION_AND_FOUNDATION_COST",
    evaluated: {
      structuralCandidates: structural.length,
      structurallyFeasible: structural.filter((s) => s.feasible).length,
      connectionCandidates: ranked.length,
      fullyFeasible: feasible.length,
    },
    baseline: { estimatedSteelKg: baselineSteelKg, objectiveScore: baselineScore },
    best,
    alternatives: feasible.slice(0, 10),
    settings,
    limitations: [
      "Optimization is deterministic pre-design search, not a fabrication or construction approval.",
      "The objective is a configurable relative cost index, not a vendor quotation or guaranteed PLN price.",
      "Only the discrete section, spacing, plate, anchor-diameter and footing grids supplied to the optimizer are searched.",
      "Anchor design resistances and soil parameters remain user/project inputs and must be replaced with selected-product and geotechnical design values.",
      "Each winning design must still pass independent structural-model, connection, foundation and qualified-engineer verification before release.",
    ],
  };
}

export function optimizerToCsv(result: AutomaticOptimizerResult): string {
  const rows = [
    ["rank", "id", "feasible", "post_section", "rail_section", "spacing_m", "plate_mm", "anchor_mm", "footing_width_mm", "footing_depth_mm", "steel_kg", "concrete_m3", "objective_score", "structural_util", "connection_util"],
    ...result.alternatives.map((r) => [r.rank, r.id, r.feasible, r.input.postSectionCode, r.input.railSectionCode, r.input.postSpacingM, r.baseConnection.plateThicknessMm, r.baseConnection.anchorDiameterMm, r.baseConnection.footingConceptMm.width, r.baseConnection.footingConceptMm.depth, r.estimatedSteelKg, r.estimatedConcreteM3, r.objectiveScore, r.maxStructuralUtilization, r.maxConnectionUtilization]),
  ];
  return rows.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
}
