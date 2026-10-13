import { NextResponse } from "next/server";
import {
  GAMEFIELDS_COMPONENT_LIBRARY,
  COMPONENT_LIBRARY_SCHEMA,
} from "../../../engineering/component-library";
import measuredLibrary from "../../../../public/models/gamefields/library.json";
export function GET() {
  return NextResponse.json({
    schema: COMPONENT_LIBRARY_SCHEMA,
    components: Object.values(GAMEFIELDS_COMPONENT_LIBRARY),
    measuredLibrary,
    engineerApproval: "REQUIRED",
    manufacturingStatus: "UNCONFIRMED",
  });
}
