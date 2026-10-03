import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { challengeMessages, challengePlayers, challenges, courts, users } from "@/db/schema";
import { requireCurrentPlayUser } from "@/lib/play-auth";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const current = await requireCurrentPlayUser();
    const challengeId = String(new URL(request.url).searchParams.get("id") || "");
    if (!challengeId) return json({ ok: false, error: "CHALLENGE_ID_REQUIRED" }, 400);

    const challenge = (await db
      .select({
        id: challenges.id,
        creatorUserId: challenges.creatorUserId,
        courtId: challenges.courtId,
        courtName: courts.name,
        sport: challenges.sport,
        format: challenges.format,
        startsAt: challenges.startsAt,
        status: challenges.status,
        message: challenges.message,
        gameId: challenges.gameId,
        createdAt: challenges.createdAt,
      })
      .from(challenges)
      .innerJoin(courts, eq(courts.id, challenges.courtId))
      .where(eq(challenges.id, challengeId))
      .limit(1))[0];
    if (!challenge) return json({ ok: false, error: "CHALLENGE_NOT_FOUND" }, 404);

    const participants = await db
      .select({
        userId: users.id,
        nickname: users.nickname,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        side: challengePlayers.side,
        role: challengePlayers.role,
        status: challengePlayers.status,
        respondedAt: challengePlayers.respondedAt,
      })
      .from(challengePlayers)
      .innerJoin(users, eq(users.id, challengePlayers.userId))
      .where(eq(challengePlayers.challengeId, challengeId));

    const me = participants.find((item) => item.userId === current.id) || null;
    if (!me) return json({ ok: false, error: "NOT_IN_CHALLENGE" }, 403);

    const messages = await db
      .select({
        id: challengeMessages.id,
        userId: users.id,
        nickname: users.nickname,
        avatarUrl: users.avatarUrl,
        body: challengeMessages.body,
        createdAt: challengeMessages.createdAt,
      })
      .from(challengeMessages)
      .innerJoin(users, eq(users.id, challengeMessages.userId))
      .where(eq(challengeMessages.challengeId, challengeId))
      .orderBy(asc(challengeMessages.createdAt))
      .limit(200);

    return json({
      ok: true,
      challenge,
      participants,
      messages,
      currentUserId: current.id,
      me,
      canRespond: me.role === "invitee" && me.status === "pending" && challenge.status === "pending",
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : code.endsWith("NOT_FOUND") ? 404 : 400);
  }
}
