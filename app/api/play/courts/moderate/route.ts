import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { courtSubmissions } from "@/db/play-courts";
import { courts, users } from "@/db/schema";
import { requirePlayAdmin } from "@/lib/play-admin";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { newId } from "@/lib/play-engine";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function slugify(value: string) {
  return value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "court";
}

export async function GET() {
  try {
    const db = getDb();
    const user = requirePlayAdmin(await requireCurrentPlayUser());
    void user;
    const rows = await db
      .select({ submission: courtSubmissions, submitterNickname: users.nickname, submitterEmail: users.email })
      .from(courtSubmissions)
      .innerJoin(users, eq(users.id, courtSubmissions.submitterUserId))
      .where(eq(courtSubmissions.status, "pending"))
      .orderBy(asc(courtSubmissions.createdAt))
      .limit(100);

    return json({ ok: true, submissions: rows.map((row) => ({ ...row.submission, sports: JSON.parse(row.submission.sports), submitterNickname: row.submitterNickname, submitterEmail: row.submitterEmail })) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : 400);
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const user = requirePlayAdmin(await requireCurrentPlayUser());
    const body = await request.json();
    const submissionId = String(body.submissionId || "");
    const action = String(body.action || "");
    const submission = (await db.select().from(courtSubmissions).where(and(eq(courtSubmissions.id, submissionId), eq(courtSubmissions.status, "pending"))).limit(1))[0];
    if (!submission) throw new Error("SUBMISSION_NOT_FOUND");
    const now = new Date();

    if (action === "reject") {
      await db.update(courtSubmissions).set({ status: "rejected", reviewedByUserId: user.id, reviewedAt: now, updatedAt: now }).where(eq(courtSubmissions.id, submission.id));
      return json({ ok: true, status: "rejected" });
    }

    if (action === "approve") {
      const courtId = newId("court");
      const slug = `${slugify(submission.name)}-${courtId.slice(-6)}`;
      await db.insert(courts).values({
        id: courtId,
        slug,
        name: submission.name,
        city: submission.city,
        district: submission.district,
        address: submission.address,
        latitude: submission.latitude,
        longitude: submission.longitude,
        sports: submission.sports,
        surface: submission.surface,
        lighting: submission.lighting,
        isFree: submission.isFree,
        imageUrl: null,
        builderProjectId: null,
        createdAt: now,
        updatedAt: now,
      });
      await db.update(courtSubmissions).set({ status: "approved", publishedCourtId: courtId, reviewedByUserId: user.id, reviewedAt: now, updatedAt: now }).where(eq(courtSubmissions.id, submission.id));
      return json({ ok: true, status: "approved", courtId, slug });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : code.endsWith("NOT_FOUND") ? 404 : 400);
  }
}
