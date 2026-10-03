import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { courtSubmissions } from "@/db/play-courts";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { newId } from "@/lib/play-engine";

const ALLOWED_SPORTS = new Set(["football", "basketball"]);

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  try {
    const db = getDb();
    const user = await requireCurrentPlayUser();
    const rows = await db.select().from(courtSubmissions).where(eq(courtSubmissions.submitterUserId, user.id)).orderBy(desc(courtSubmissions.createdAt)).limit(50);
    return json({ ok: true, submissions: rows.map((row) => ({ ...row, sports: JSON.parse(row.sports) })) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : 400);
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const user = await requireCurrentPlayUser();
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 120);
    const city = String(body.city || "Warszawa").trim().slice(0, 80);
    const district = String(body.district || "").trim().slice(0, 80) || null;
    const address = String(body.address || "").trim().slice(0, 180) || null;
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const sports = Array.isArray(body.sports)
      ? body.sports.map(String).filter((sport: string) => ALLOWED_SPORTS.has(sport))
      : [];
    const surface = String(body.surface || "").trim().slice(0, 60) || null;
    const notes = String(body.notes || "").trim().slice(0, 1000) || null;

    if (name.length < 3) throw new Error("INVALID_NAME");
    if (!Number.isFinite(latitude) || latitude < 49 || latitude > 55) throw new Error("INVALID_LATITUDE");
    if (!Number.isFinite(longitude) || longitude < 14 || longitude > 24.5) throw new Error("INVALID_LONGITUDE");
    if (!sports.length) throw new Error("SPORT_REQUIRED");

    const now = new Date();
    const id = newId("court_submission");
    await db.insert(courtSubmissions).values({
      id,
      submitterUserId: user.id,
      name,
      city,
      district,
      address,
      latitude,
      longitude,
      sports: JSON.stringify([...new Set(sports)]),
      surface,
      lighting: Boolean(body.lighting),
      isFree: body.isFree !== false,
      notes,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return json({ ok: true, id, status: "pending" }, 201);
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : 400);
  }
}
