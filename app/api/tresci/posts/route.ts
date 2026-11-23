import { asc, eq } from "drizzle-orm";
import { getDb, getD1 } from "@/db";
import { contentPosts } from "@/db/content-studio";
import { EIGHT_WEEK_PLAN, parseMetrics, validatePostInput, type ContentPost } from "@/lib/content-studio";
import { requirePlayAdmin } from "@/lib/play-admin";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { assertSameOrigin, playError } from "@/lib/play-http";

// Studio treści (/tresci) — tylko dla administratora skonfigurowanego w PLAY_ADMIN_EMAILS / PLAY_ADMIN_USER_IDS.

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });

type Row = typeof contentPosts.$inferSelect;
const toPost = (r: Row): ContentPost => ({
  id: r.id,
  title: r.title,
  pillar: r.pillar as ContentPost["pillar"],
  channel: r.channel as ContentPost["channel"],
  status: r.status as ContentPost["status"],
  date: r.publishDate,
  body: r.body,
  notes: r.notes,
  url: r.url,
  metrics: parseMetrics(r.metricsJson),
  updatedAt: r.updatedAt,
});

async function listPosts() {
  const rows = await getDb().select().from(contentPosts).orderBy(asc(contentPosts.publishDate), asc(contentPosts.createdAt)).limit(2000);
  return rows.map(toPost);
}

export async function GET() {
  try {
    await requirePlayAdmin(await requireCurrentPlayUser());
    return json({ ok: true, posts: await listPosts() });
  } catch (e) {
    return playError(e);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requirePlayAdmin(await requireCurrentPlayUser());
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) throw new Error("INVALID_REQUEST");
    const action = String(body.action || "");
    const db = getDb();
    const stamp = Math.floor(Date.now() / 1000);

    if (action === "save") {
      const input = validatePostInput(body.post);
      const id = body.id ? String(body.id) : null;
      const values = {
        title: input.title,
        pillar: input.pillar,
        channel: input.channel,
        status: input.status,
        publishDate: input.date,
        body: input.body,
        notes: input.notes,
        url: input.url,
        metricsJson: JSON.stringify(input.metrics),
        updatedAt: stamp,
      };
      if (id) {
        const result = await db.update(contentPosts).set(values).where(eq(contentPosts.id, id)).returning({ id: contentPosts.id });
        if (!result.length) throw new Error("POST_NOT_FOUND");
        return json({ ok: true, id });
      }
      const newId = "post_" + crypto.randomUUID().replace(/-/g, "").slice(0, 20);
      await db.insert(contentPosts).values({ id: newId, ...values, createdByUserId: user.id, createdAt: stamp });
      return json({ ok: true, id: newId });
    }

    if (action === "metrics") {
      const id = String(body.id || "");
      const metrics = parseMetrics(body.metrics);
      const result = await db.update(contentPosts).set({ metricsJson: JSON.stringify(metrics), updatedAt: stamp }).where(eq(contentPosts.id, id)).returning({ id: contentPosts.id });
      if (!result.length) throw new Error("POST_NOT_FOUND");
      return json({ ok: true, id });
    }

    if (action === "delete") {
      const id = String(body.id || "");
      await db.delete(contentPosts).where(eq(contentPosts.id, id));
      return json({ ok: true });
    }

    if (action === "seed") {
      // Idempotentne: stałe identyfikatory, więc ponowne wczytanie nie duplikuje wpisów.
      const d1 = getD1();
      await d1.batch(EIGHT_WEEK_PLAN.map(([date, channel, pillar, title]) =>
        d1.prepare("INSERT OR IGNORE INTO content_posts (id,title,pillar,channel,status,publish_date,body,notes,url,metrics_json,created_by_user_id,created_at,updated_at) VALUES (?,?,?,?,'zaplanowany',?,'','',NULL,'{}',?,?,?)")
          .bind(`plan_${date}_${channel}`, title, pillar, channel, date, user.id, stamp, stamp)));
      return json({ ok: true, posts: await listPosts() });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (e) {
    if (e instanceof TypeError && /URL/i.test(e.message)) return playError(new Error("INVALID_URL"));
    return playError(e);
  }
}
