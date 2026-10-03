import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { builderProjectSupports, builderProjects } from "@/db/builder-projects";
import { courts, users } from "@/db/schema";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { newId } from "@/lib/play-engine";
import { projectSchema } from "@/lib/project";

const MAX_PROJECT_BYTES = 1_800_000;

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function fail(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  const status = code === "UNAUTHENTICATED" ? 401 : code.endsWith("NOT_FOUND") ? 404 : code === "FORBIDDEN" ? 403 : 400;
  return json({ ok: false, error: code }, status);
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const current = await requireCurrentPlayUser();
    const url = new URL(request.url);
    const id = String(url.searchParams.get("id") || "");
    const courtId = String(url.searchParams.get("courtId") || "");

    if (id) {
      const row = (await db
        .select({
          id: builderProjects.id,
          ownerUserId: builderProjects.ownerUserId,
          ownerNickname: users.nickname,
          projectKey: builderProjects.projectKey,
          courtId: builderProjects.courtId,
          name: builderProjects.name,
          sport: builderProjects.sport,
          projectJson: builderProjects.projectJson,
          source: builderProjects.source,
          visibility: builderProjects.visibility,
          status: builderProjects.status,
          publishedAt: builderProjects.publishedAt,
          updatedAt: builderProjects.updatedAt,
        })
        .from(builderProjects)
        .innerJoin(users, eq(users.id, builderProjects.ownerUserId))
        .where(eq(builderProjects.id, id))
        .limit(1))[0];
      if (!row) throw new Error("PROJECT_NOT_FOUND");
      if (row.ownerUserId !== current.id && row.visibility !== "public") throw new Error("FORBIDDEN");
      const supportCount = Number((await db.select({ count: sql<number>`count(*)` }).from(builderProjectSupports).where(eq(builderProjectSupports.projectId, id)))[0]?.count || 0);
      const supportedByMe = Boolean((await db.select({ id: builderProjectSupports.id }).from(builderProjectSupports).where(and(eq(builderProjectSupports.projectId, id), eq(builderProjectSupports.userId, current.id))).limit(1))[0]);
      return json({ ok: true, projectRecord: { ...row, project: JSON.parse(row.projectJson), supportCount, supportedByMe } });
    }

    if (courtId) {
      const rows = await db
        .select({
          id: builderProjects.id,
          ownerUserId: builderProjects.ownerUserId,
          ownerNickname: users.nickname,
          projectKey: builderProjects.projectKey,
          courtId: builderProjects.courtId,
          name: builderProjects.name,
          sport: builderProjects.sport,
          source: builderProjects.source,
          visibility: builderProjects.visibility,
          status: builderProjects.status,
          publishedAt: builderProjects.publishedAt,
          updatedAt: builderProjects.updatedAt,
          supportCount: sql<number>`count(${builderProjectSupports.id})`,
        })
        .from(builderProjects)
        .innerJoin(users, eq(users.id, builderProjects.ownerUserId))
        .leftJoin(builderProjectSupports, eq(builderProjectSupports.projectId, builderProjects.id))
        .where(and(eq(builderProjects.courtId, courtId), eq(builderProjects.visibility, "public"), eq(builderProjects.status, "published")))
        .groupBy(builderProjects.id, users.id)
        .orderBy(desc(sql<number>`count(${builderProjectSupports.id})`), desc(builderProjects.publishedAt))
        .limit(50);

      const ids = rows.map((row) => row.id);
      const mySupports = ids.length
        ? await db.select({ projectId: builderProjectSupports.projectId }).from(builderProjectSupports).where(and(eq(builderProjectSupports.userId, current.id), inArray(builderProjectSupports.projectId, ids)))
        : [];
      const mine = new Set(mySupports.map((row) => row.projectId));
      return json({ ok: true, projects: rows.map((row) => ({ ...row, supportCount: Number(row.supportCount || 0), supportedByMe: mine.has(row.id) })) });
    }

    const mine = await db
      .select({
        id: builderProjects.id,
        projectKey: builderProjects.projectKey,
        courtId: builderProjects.courtId,
        name: builderProjects.name,
        sport: builderProjects.sport,
        source: builderProjects.source,
        visibility: builderProjects.visibility,
        status: builderProjects.status,
        publishedAt: builderProjects.publishedAt,
        createdAt: builderProjects.createdAt,
        updatedAt: builderProjects.updatedAt,
        supportCount: sql<number>`count(${builderProjectSupports.id})`,
      })
      .from(builderProjects)
      .leftJoin(builderProjectSupports, eq(builderProjectSupports.projectId, builderProjects.id))
      .where(eq(builderProjects.ownerUserId, current.id))
      .groupBy(builderProjects.id)
      .orderBy(desc(builderProjects.updatedAt))
      .limit(100);

    return json({ ok: true, projects: mine.map((row) => ({ ...row, supportCount: Number(row.supportCount || 0) })) });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const current = await requireCurrentPlayUser();
    const body = await request.json();
    const action = String(body.action || "");
    const now = new Date();

    if (action === "save") {
      const parsed = projectSchema.safeParse(body.project);
      if (!parsed.success) throw new Error("INVALID_PROJECT");
      const project = parsed.data;
      const projectJson = JSON.stringify(project);
      if (new TextEncoder().encode(projectJson).byteLength > MAX_PROJECT_BYTES) throw new Error("PROJECT_TOO_LARGE");
      const courtId = body.courtId ? String(body.courtId) : null;
      if (courtId) {
        const court = (await db.select({ id: courts.id }).from(courts).where(eq(courts.id, courtId)).limit(1))[0];
        if (!court) throw new Error("COURT_NOT_FOUND");
      }
      const source = String(body.source || "studio").slice(0, 40);
      const existing = (await db.select().from(builderProjects).where(and(eq(builderProjects.ownerUserId, current.id), eq(builderProjects.projectKey, project.id))).limit(1))[0];
      if (existing) {
        await db.update(builderProjects).set({
          courtId: courtId ?? existing.courtId,
          name: project.name,
          sport: project.sport,
          projectJson,
          source,
          updatedAt: now,
        }).where(eq(builderProjects.id, existing.id));
        return json({ ok: true, id: existing.id, created: false });
      }
      const id = newId("builder");
      await db.insert(builderProjects).values({
        id,
        ownerUserId: current.id,
        projectKey: project.id,
        courtId,
        name: project.name,
        sport: project.sport,
        projectJson,
        source,
        visibility: "private",
        status: "draft",
        createdAt: now,
        updatedAt: now,
      });
      return json({ ok: true, id, created: true }, 201);
    }

    if (action === "publish" || action === "unpublish" || action === "delete") {
      const id = String(body.id || "");
      const project = (await db.select().from(builderProjects).where(eq(builderProjects.id, id)).limit(1))[0];
      if (!project) throw new Error("PROJECT_NOT_FOUND");
      if (project.ownerUserId !== current.id) throw new Error("FORBIDDEN");
      if (action === "delete") {
        await db.delete(builderProjects).where(eq(builderProjects.id, id));
        return json({ ok: true });
      }
      if (action === "publish") {
        if (!project.courtId) throw new Error("COURT_REQUIRED_FOR_PUBLISH");
        await db.update(builderProjects).set({ visibility: "public", status: "published", publishedAt: now, updatedAt: now }).where(eq(builderProjects.id, id));
        return json({ ok: true, visibility: "public", status: "published" });
      }
      await db.update(builderProjects).set({ visibility: "private", status: "draft", publishedAt: null, updatedAt: now }).where(eq(builderProjects.id, id));
      return json({ ok: true, visibility: "private", status: "draft" });
    }

    if (action === "support") {
      const id = String(body.id || "");
      const project = (await db.select().from(builderProjects).where(eq(builderProjects.id, id)).limit(1))[0];
      if (!project) throw new Error("PROJECT_NOT_FOUND");
      if (project.visibility !== "public" || project.status !== "published") throw new Error("PROJECT_NOT_PUBLIC");
      const existing = await db.select({ id: builderProjectSupports.id }).from(builderProjectSupports).where(and(eq(builderProjectSupports.projectId, id), eq(builderProjectSupports.userId, current.id))).limit(1);
      if (!existing[0]) await db.insert(builderProjectSupports).values({ id: newId("builder_support"), projectId: id, userId: current.id, createdAt: now });
      const supportCount = Number((await db.select({ count: sql<number>`count(*)` }).from(builderProjectSupports).where(eq(builderProjectSupports.projectId, id)))[0]?.count || 0);
      return json({ ok: true, supportCount });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (error) {
    return fail(error);
  }
}
