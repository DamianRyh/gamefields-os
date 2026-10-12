import type { DesignGeneratorV11Result } from "./design-generator-v11";

export type ProposalRateStatus = "BUDGETARY_DEFAULT" | "USER_CONFIRMED";

export interface CommercialPolicy {
  schema: "GF-COMMERCIAL-POLICY-1.2";
  label: string;
  sourceStatus: ProposalRateStatus;
  targetGrossMarginPct: number;
  vatPct: number;
  validityDays: number;
  paymentTerms: string;
  leadTimeWeeks: string;
  commercialContingencyPct: number;
}

export const DEFAULT_COMMERCIAL_POLICY: CommercialPolicy = {
  schema: "GF-COMMERCIAL-POLICY-1.2",
  label: "Gamefields commercial defaults — confirm before sending",
  sourceStatus: "BUDGETARY_DEFAULT",
  targetGrossMarginPct: 30,
  vatPct: 23,
  validityDays: 14,
  paymentTerms: "40% upon order / 50% before delivery / 10% after installation",
  leadTimeWeeks: "6–10 weeks from design freeze and advance payment",
  commercialContingencyPct: 3,
};

export interface ProposalClient {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface ProposalContext {
  proposalNumber: string;
  issueDate: string;
  sellerName: string;
  sellerLegalName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  projectName: string;
  projectLocation: string;
  client: ProposalClient;
}

export interface CommercialProposal {
  schema: "GF-COMMERCIAL-PROPOSAL-1.2";
  status: "DRAFT";
  context: ProposalContext;
  technical: {
    designFound: boolean;
    designId: string | null;
    engineerGate: string;
    windPressureKpa: number;
    postSection: string | null;
    railSection: string | null;
    postSpacingM: number | null;
    footing: string | null;
    anchors: string | null;
    estimatedSteelKg: number | null;
    technicalCostNetPln: number | null;
  };
  commercial: {
    internalCostNetPln: number | null;
    salesNetPln: number | null;
    vatPln: number | null;
    salesGrossPln: number | null;
    grossMarginPct: number | null;
    grossMarginPln: number | null;
  };
  scope: string[];
  exclusions: string[];
  schedule: string[];
  policy: CommercialPolicy;
  commercialWarnings: string[];
  footerNote: string;
}

function money(v: number) { return Math.round(v * 100) / 100; }
function clampMargin(v: number) { return Math.min(80, Math.max(1, v)); }
function salesFromMargin(cost: number, marginPct: number) {
  const margin = clampMargin(marginPct) / 100;
  return cost / (1 - margin);
}

export function buildCommercialProposal(args: {
  engineering: DesignGeneratorV11Result;
  context: ProposalContext;
  policy?: Partial<CommercialPolicy>;
  scope?: string[];
  exclusions?: string[];
}): CommercialProposal {
  const policy: CommercialPolicy = { ...DEFAULT_COMMERCIAL_POLICY, ...(args.policy ?? {}) };
  const technicalCost = args.engineering.cost?.totalNetPln ?? null;
  const internalCost = technicalCost === null ? null : technicalCost * (1 + Math.max(0, policy.commercialContingencyPct) / 100);
  const salesNet = internalCost === null ? null : salesFromMargin(internalCost, policy.targetGrossMarginPct);
  const vat = salesNet === null ? null : salesNet * Math.max(0, policy.vatPct) / 100;
  const salesGross = salesNet === null || vat === null ? null : salesNet + vat;
  const marginPln = internalCost === null || salesNet === null ? null : salesNet - internalCost;
  const selected = args.engineering.generator.selected;

  const scope = args.scope ?? [
    "Preparation and coordination of the final production design based on the accepted Gamefields concept",
    "Fabrication of the selected steel structural system",
    "Base plates, anchors and foundation works according to the approved project package",
    "Corrosion protection according to the active specification",
    "Delivery to the project location",
    "Structural installation and final geometry check",
    "Production BOM and technical handoff documentation",
  ];

  const exclusions = args.exclusions ?? [
    "VAT unless stated in the commercial summary",
    "Geotechnical investigation and survey services unless separately commissioned",
    "Building permits, administrative fees and third-party approvals",
    "Utility relocations and unforeseen underground conflicts",
    "Changes requested after design freeze that materially affect quantities or engineering",
    "Non-structural sports equipment, surfacing or branding unless explicitly included in the agreed scope",
  ];

  return {
    schema: "GF-COMMERCIAL-PROPOSAL-1.2",
    status: "DRAFT",
    context: args.context,
    technical: {
      designFound: selected.found,
      designId: selected.designId,
      engineerGate: args.engineering.generator.handoff?.engineerGate?.releaseStatus ?? "ENGINEER_REVIEW_REQUIRED",
      windPressureKpa: args.engineering.wind.windPressureKpa,
      postSection: selected.postSectionCode,
      railSection: selected.railSectionCode,
      postSpacingM: selected.postSpacingM,
      footing: selected.footing,
      anchors: selected.anchors,
      estimatedSteelKg: selected.estimatedSteelKg,
      technicalCostNetPln: technicalCost,
    },
    commercial: {
      internalCostNetPln: internalCost === null ? null : money(internalCost),
      salesNetPln: salesNet === null ? null : money(salesNet),
      vatPln: vat === null ? null : money(vat),
      salesGrossPln: salesGross === null ? null : money(salesGross),
      grossMarginPct: salesNet === null || internalCost === null ? null : money(((salesNet - internalCost) / salesNet) * 100),
      grossMarginPln: marginPln === null ? null : money(marginPln),
    },
    scope,
    exclusions,
    schedule: [
      "1. Commercial acceptance and advance payment",
      "2. Design freeze and project-specific verification",
      "3. Production documentation and fabrication",
      "4. Corrosion protection and quality control",
      "5. Delivery and installation",
      "6. Handover and close-out documentation",
    ],
    policy,
    commercialWarnings: [
      policy.sourceStatus === "BUDGETARY_DEFAULT" ? "Commercial policy uses default assumptions and must be reviewed before sending the proposal." : "Commercial policy has been user-confirmed.",
      args.engineering.commercialStatus === "BUDGETARY" ? "Underlying engineering cost still uses budgetary rate data; supplier/subcontractor rates should be confirmed before issue." : "Underlying engineering cost uses user-confirmed rates.",
      "Engineer Gate remains authoritative: a commercial proposal is not a fabrication or construction release.",
    ],
    footerNote: "Gamefields combines sports-space design, engineering coordination and production planning in one workflow. Final execution remains subject to project-specific verification and accepted commercial scope.",
  };
}

export function proposalToCsv(proposal: CommercialProposal): string {
  const rows = [
    ["proposal_number", proposal.context.proposalNumber],
    ["project", proposal.context.projectName],
    ["client", proposal.context.client.company || proposal.context.client.name],
    ["location", proposal.context.projectLocation],
    ["internal_cost_net_pln", proposal.commercial.internalCostNetPln ?? ""],
    ["sales_net_pln", proposal.commercial.salesNetPln ?? ""],
    ["vat_pln", proposal.commercial.vatPln ?? ""],
    ["sales_gross_pln", proposal.commercial.salesGrossPln ?? ""],
    ["gross_margin_pct", proposal.commercial.grossMarginPct ?? ""],
    ["gross_margin_pln", proposal.commercial.grossMarginPln ?? ""],
    ["engineer_gate", proposal.technical.engineerGate],
  ];
  return rows.map((row) => row.map((cell) => JSON.stringify(cell)).join(",")).join("\n");
}
