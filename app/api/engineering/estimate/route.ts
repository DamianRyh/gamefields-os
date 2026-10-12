import { NextResponse } from "next/server";
import { estimateCourtStructure, type CourtEngineeringInput } from "../../../engineering/domain";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as CourtEngineeringInput;

    if (!input || !Number.isFinite(input.lengthM) || !Number.isFinite(input.widthM)) {
      return NextResponse.json({ error: "Invalid engineering input" }, { status: 400 });
    }

    const estimate = estimateCourtStructure(input);
    return NextResponse.json({ input, estimate });
  } catch {
    return NextResponse.json({ error: "Unable to calculate engineering estimate" }, { status: 400 });
  }
}
