import type { StructuralAnalysisResult } from "./analysis";
import type { FabricationPackage } from "./fabrication";
import type { BaseConnectionConcept } from "./foundation";
import type { PreliminarySolverResult } from "./solver";
import type { Frame3DSolverResult } from "./frame3d";
import type { EurocodeEngineResult } from "./eurocode";
import type { StabilityEngineResult } from "./stability";
import type { ConnectionFoundationResult } from "./connection-foundation";

export type EngineerCheckStatus = "PASS" | "WARN" | "BLOCK";

export interface EngineerCheck {
  id: string;
  label: string;
  status: EngineerCheckStatus;
  note: string;
}

export interface EngineerReviewGate {
  schema: "GF-ENGINEER-GATE-0.4";
  checks: EngineerCheck[];
  summary: { pass: number; warn: number; block: number };
  releaseStatus: "PRE_DESIGN_READY" | "ENGINEER_REVIEW_REQUIRED" | "BLOCKED";
  fabricationReleaseAllowed: false;
  constructionReleaseAllowed: false;
  requiredNextActions: string[];
}

export function runEngineerReviewGate(args: {
  analysis: StructuralAnalysisResult;
  solver: PreliminarySolverResult;
  frame3d?: Frame3DSolverResult;
  eurocode?: EurocodeEngineResult;
  stability?: StabilityEngineResult;
  connectionFoundation?: ConnectionFoundationResult;
  baseConnection: BaseConnectionConcept;
  fabrication: FabricationPackage;
}): EngineerReviewGate {
  const checks: EngineerCheck[] = [];

  checks.push({ id: "ULS_SCREEN", label: "Legacy preliminary section resistance screen", status: args.analysis.postCheck.resistanceStatus === "OK" ? "PASS" : "BLOCK", note: `Representative-post ULS utilization ${(args.analysis.postCheck.utilization * 100).toFixed(0)}%.` });
  checks.push({ id: "SLS_SCREEN", label: "Legacy preliminary deflection screen", status: args.analysis.postCheck.deflectionStatus === "OK" ? "PASS" : "BLOCK", note: `Representative-post SLS utilization ${(args.analysis.postCheck.deflectionUtilization * 100).toFixed(0)}%.` });
  checks.push({ id: "FEM_CONSISTENCY", label: "Representative FEM solver result available", status: Number.isFinite(args.solver.envelope.maxCharacteristicSupportMomentKnM) ? "PASS" : "BLOCK", note: `${args.solver.method}; governing case ${args.solver.envelope.governingCase}.` });
  checks.push({ id: "GLOBAL_FRAME", label: "Global 3D frame analysis", status: args.frame3d && Number.isFinite(args.frame3d.envelope.maxDisplacementMm) ? "PASS" : "BLOCK", note: args.frame3d ? `${args.frame3d.solver}; ${args.frame3d.cases.length} load cases; max displacement ${args.frame3d.envelope.maxDisplacementMm.toFixed(1)} mm.` : "Global 3D frame solution is missing." });
  checks.push({ id: "EUROCODE_MEMBER_SCREEN", label: "Eurocode member utilization screen", status: !args.eurocode ? "BLOCK" : args.eurocode.summary.failedMembers > 0 ? "BLOCK" : "PASS", note: args.eurocode ? `${args.eurocode.summary.checkedMembers} members checked; max utilization ${(args.eurocode.summary.maxUtilization * 100).toFixed(0)}%; ${args.eurocode.summary.failedMembers} failed.` : "Eurocode Engine result is missing." });
  checks.push({ id: "EUROCODE_SLS", label: "Eurocode serviceability screen", status: !args.eurocode ? "BLOCK" : args.eurocode.serviceability.status === "OK" ? "PASS" : "BLOCK", note: args.eurocode ? `SLS displacement ${args.eurocode.serviceability.maxDisplacementMm.toFixed(1)} / ${args.eurocode.serviceability.limitMm.toFixed(1)} mm.` : "Serviceability result is missing." });
  checks.push({ id: "STABILITY_ENGINE", label: "Member stability screening", status: !args.stability ? "BLOCK" : args.stability.summary.failedMembers > 0 ? "BLOCK" : args.stability.summary.warningMembers > 0 ? "WARN" : "PASS", note: args.stability ? `${args.stability.summary.checkedMembers} members; max stability utilization ${(args.stability.summary.maxCombinedUtilization * 100).toFixed(0)}%; ${args.stability.summary.failedMembers} failed; ${args.stability.summary.warningMembers} warnings.` : "Stability Engine result is missing." });
  checks.push({ id: "SECTION_CLASSIFICATION", label: "Cross-section classification screen", status: !args.stability ? "BLOCK" : args.stability.summary.class4Members > 0 ? "BLOCK" : "PASS", note: args.stability ? `${args.stability.summary.class4Members} Class 4 member(s). Class 4 requires effective-section treatment before release.` : "Section classification result is missing." });
  checks.push({ id: "SECOND_ORDER", label: "Second-order sensitivity screen", status: !args.stability ? "BLOCK" : args.stability.summary.maxSecondOrderRatio >= args.stability.profile.secondOrderFailureRatio ? "BLOCK" : args.stability.summary.maxSecondOrderRatio > args.stability.profile.secondOrderWarningRatio ? "WARN" : "PASS", note: args.stability ? `Max NEd/Ncr ${(args.stability.summary.maxSecondOrderRatio * 100).toFixed(1)}%. v0.7 uses member-level Euler amplification, not nonlinear global P-Delta.` : "Second-order screen is missing." });
  checks.push({ id: "LTB_REVIEW", label: "Lateral-torsional buckling review", status: "WARN", note: "Closed RHS/SHS members remain flagged for LTB review; complete Mcr/chiLT verification is outside v0.8." });

  const cf = args.connectionFoundation;
  checks.push({ id: "ANCHOR_GROUP", label: "Anchor group screening", status: !cf ? "BLOCK" : cf.anchorGroup.status === "OK" ? "PASS" : "BLOCK", note: cf ? `Tension ${cf.anchorGroup.maxAnchorTensionKn.toFixed(1)} kN / shear ${cf.anchorGroup.shearPerAnchorKn.toFixed(1)} kN per anchor; interaction ${(cf.anchorGroup.interactionUtilization * 100).toFixed(0)}%.` : "Connection/foundation result is missing." });
  checks.push({ id: "BASE_PLATE", label: "Base plate and bearing screening", status: !cf ? "BLOCK" : cf.basePlate.status === "OK" ? "PASS" : "BLOCK", note: cf ? `Bearing ${(cf.basePlate.bearingUtilization * 100).toFixed(0)}%; plate bending ${(cf.basePlate.plateBendingUtilization * 100).toFixed(0)}%.` : "Base-plate check is missing." });
  checks.push({ id: "WELD_CONNECTION", label: "Post-to-base weld screening", status: !cf ? "BLOCK" : cf.weld.status === "OK" ? "PASS" : "BLOCK", note: cf ? `Weld utilization ${(cf.weld.utilization * 100).toFixed(0)}%; simplified throat-area screen.` : "Weld check is missing." });
  checks.push({ id: "FOUNDATION_SCREEN", label: "Footing bearing / sliding / contact screening", status: !cf ? "BLOCK" : cf.footing.status === "OK" ? "PASS" : "BLOCK", note: cf ? `Bearing ${(cf.footing.bearingUtilization * 100).toFixed(0)}%; sliding ${(cf.footing.slidingUtilization * 100).toFixed(0)}%; ${cf.footing.contactStatus}.` : "Foundation check is missing." });
  checks.push({ id: "ANCHOR_PRODUCT_DATA", label: "Selected anchor product / EN 1992-4 data", status: "WARN", note: "v0.8 uses user/project anchor design resistances. Concrete cone, pull-out, pry-out, splitting, edge distance, spacing, reinforcement and cracked/uncracked concrete require selected anchor data and detailed verification." });
  checks.push({ id: "GEOTECHNICAL_DATA", label: "Project geotechnical parameters", status: "WARN", note: "Soil bearing and base friction are project inputs. Settlement, frost, groundwater, soil layering and geotechnical design require site-specific data." });
  checks.push({ id: "FABRICATION_DATA", label: "Fabrication register generated", status: args.fabrication.cutList.length > 0 && args.fabrication.plates.length > 0 ? "PASS" : "BLOCK", note: `${args.fabrication.cutList.length} cut marks, ${args.fabrication.plates.length} plate type(s), ${args.fabrication.bolts.length} bolt assembly type(s).` });
  checks.push({ id: "NATIONAL_ANNEX", label: "Project-specific actions / National Annex", status: "WARN", note: args.eurocode ? `${args.eurocode.profile.id}; ${args.eurocode.profile.nationalAnnex}. Project-specific wind, terrain and National Annex parameters must still be confirmed.` : "Project-specific action parameters and applicable National Annex must be confirmed." });

  const summary = { pass: checks.filter((c) => c.status === "PASS").length, warn: checks.filter((c) => c.status === "WARN").length, block: checks.filter((c) => c.status === "BLOCK").length };
  return {
    schema: "GF-ENGINEER-GATE-0.4",
    checks,
    summary,
    releaseStatus: summary.block > 0 ? "BLOCKED" : summary.warn > 0 ? "ENGINEER_REVIEW_REQUIRED" : "PRE_DESIGN_READY",
    fabricationReleaseAllowed: false,
    constructionReleaseAllowed: false,
    requiredNextActions: [
      "Confirm project-specific actions, wind parameters, load categories and applicable Polish National Annex / Eurocode edition.",
      "Confirm profile manufacturing route, buckling curves, effective lengths, restraint conditions and joint stiffness assumptions.",
      "Cross-check global frame/stability results in an independent structural solver.",
      "Select the actual anchor system and verify all EN 1992-4 concrete/anchor failure modes with manufacturer data.",
      "Complete connection component-method checks, weld-group stresses and local steel checks.",
      "Provide geotechnical parameters and complete foundation concrete/reinforcement, settlement and frost design.",
      "Obtain review/approval by an appropriately qualified structural engineer before fabrication or construction.",
    ],
  };
}
