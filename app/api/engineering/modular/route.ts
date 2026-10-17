import { NextResponse } from "next/server";
import {
  generateModularProduct,
  modularRequestSchema,
} from "../../../engineering/modular-pipeline";
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = modularRequestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid modular parameters", issues: parsed.error.issues },
      { status: 400 },
    );
  return NextResponse.json(generateModularProduct(parsed.data));
}
