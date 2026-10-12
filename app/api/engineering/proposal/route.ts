import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_COST_CATALOG_PLN } from "../../../engineering/costing";
import { runDesignGeneratorV11 } from "../../../engineering/design-generator-v11";
import { buildCommercialProposal, DEFAULT_COMMERCIAL_POLICY } from "../../../engineering/commercial-proposal";

const schema = z.object({
  projectName: z.string().min(1),
  projectCode: z.string().min(1),
  city: z.string().min(1),
  courtType: z.enum(["3V3", "1V1", "CUSTOM_RECTANGULAR"]).default("3V3"),
  lengthM: z.number().min(3).max(60),
  widthM: z.number().min(3).max(40),
  boardHeightM: z.number().min(0).max(4),
  netHeightM: z.number().min(0).max(10),
  designPressureKpa: z.number().min(0).max(5),
  soilDesignBearingKpa: z.number().min(25).max(1000).default(150),
  clientName: z.string().min(1),
  clientCompany: z.string().optional(),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  proposalNumber: z.string().min(1),
  issueDate: z.string().min(1),
  sellerName: z.string().min(1).default("Gamefields"),
  sellerLegalName: z.string().optional(),
  sellerEmail: z.string().optional(),
  sellerPhone: z.string().optional(),
  targetGrossMarginPct: z.number().min(1).max(80).optional(),
  vatPct: z.number().min(0).max(30).optional(),
  validityDays: z.number().int().min(1).max(90).optional(),
  paymentTerms: z.string().optional(),
  leadTimeWeeks: z.string().optional(),
  commercialContingencyPct: z.number().min(0).max(50).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid proposal input", details: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;

  const engineering = runDesignGeneratorV11({
    brief: {
      projectName: body.projectName,
      projectCode: body.projectCode,
      city: body.city,
      courtType: body.courtType,
      lengthM: body.lengthM,
      widthM: body.widthM,
      boardHeightM: body.boardHeightM,
      netHeightM: body.netHeightM,
      soilDesignBearingKpa: body.soilDesignBearingKpa,
      priority: "BALANCED",
    },
    wind: {
      mode: "DESIGN_PRESSURE",
      designPressureKpa: body.designPressureKpa,
      sourceNote: "Project pressure input — engineer confirmation required",
    },
    costCatalog: DEFAULT_COST_CATALOG_PLN,
  });

  const proposal = buildCommercialProposal({
    engineering,
    context: {
      proposalNumber: body.proposalNumber,
      issueDate: body.issueDate,
      sellerName: body.sellerName,
      sellerLegalName: body.sellerLegalName,
      sellerEmail: body.sellerEmail,
      sellerPhone: body.sellerPhone,
      projectName: body.projectName,
      projectLocation: body.city,
      client: {
        name: body.clientName,
        company: body.clientCompany,
        email: body.clientEmail,
        phone: body.clientPhone,
      },
    },
    policy: {
      ...DEFAULT_COMMERCIAL_POLICY,
      ...(body.targetGrossMarginPct !== undefined ? { targetGrossMarginPct: body.targetGrossMarginPct } : {}),
      ...(body.vatPct !== undefined ? { vatPct: body.vatPct } : {}),
      ...(body.validityDays !== undefined ? { validityDays: body.validityDays } : {}),
      ...(body.paymentTerms ? { paymentTerms: body.paymentTerms } : {}),
      ...(body.leadTimeWeeks ? { leadTimeWeeks: body.leadTimeWeeks } : {}),
      ...(body.commercialContingencyPct !== undefined ? { commercialContingencyPct: body.commercialContingencyPct } : {}),
    },
  });

  return NextResponse.json({ engineering, proposal }, { status: engineering.generator.selected.found ? 200 : 422 });
}
