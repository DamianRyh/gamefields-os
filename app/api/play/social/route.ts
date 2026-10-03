import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { playerFollows, playNotifications } from "@/db/play-social";
import { challengePlayers, challenges, courts, eloHistory, games, users } from "@/db/schema";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { newId } from "@/lib/play-engine";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  try {
    const db = getDb();
    const current = await requireCurrentPlayUser();

    const following = await db.select({ userId: playerFollows.followingUserId }).from(playerFollows).where(eq(playerFollows.followerUserId, current.id));
    const followerCount = Number((await db.select({ count: sql<number>`count(*)` }).from(playerFollows).where(eq(playerFollows.followingUserId, current.id)))[0]?.count || 0);
    const followingCount = following.length;
    const feedIds = [current.id, ...following.map((item) => item.userId)];

    const feed = feedIds.length ? await db
      .select({
        userId: users.id,
        nickname: users.nickname,
        avatarUrl: users.avatarUrl,
        sport: eloHistory.sport,
        before: eloHistory.before,
        after: eloHistory.after,
        change: eloHistory.change,
        createdAt: eloHistory.createdAt,
        gameId: games.id,
        scoreA: games.scoreA,
        scoreB: games.scoreB,
        courtId: courts.id,
        courtName: courts.name,
      })
      .from(eloHistory)
      .innerJoin(users, eq(users.id, eloHistory.userId))
      .innerJoin(games, eq(games.id, eloHistory.gameId))
      .innerJoin(courts, eq(courts.id, games.courtId))
      .where(inArray(eloHistory.userId, feedIds))
      .orderBy(desc(eloHistory.createdAt))
      .limit(60) : [];

    const storedNotifications = await db
      .select()
      .from(playNotifications)
      .where(eq(playNotifications.userId, current.id))
      .orderBy(desc(playNotifications.createdAt))
      .limit(50);

    const pendingLinks = await db
      .select({ challengeId: challengePlayers.challengeId })
      .from(challengePlayers)
      .where(and(eq(challengePlayers.userId, current.id), eq(challengePlayers.status, "pending"), eq(challengePlayers.role, "invitee")));

    let challengeNotifications: Array<Record<string, unknown>> = [];
    if (pendingLinks.length) {
      const ids = pendingLinks.map((item) => item.challengeId);
      const rows = await db
        .select({
          id: challenges.id,
          creatorUserId: challenges.creatorUserId,
          courtName: courts.name,
          sport: challenges.sport,
          format: challenges.format,
          startsAt: challenges.startsAt,
          message: challenges.message,
          createdAt: challenges.createdAt,
        })
        .from(challenges)
        .innerJoin(courts, eq(courts.id, challenges.courtId))
        .where(inArray(challenges.id, ids));
      const creatorIds = [...new Set(rows.map((row) => row.creatorUserId))];
      const creators = creatorIds.length ? await db.select({ id: users.id, nickname: users.nickname }).from(users).where(inArray(users.id, creatorIds)) : [];
      const names = new Map(creators.map((item) => [item.id, item.nickname]));
      challengeNotifications = rows.map((row) => ({
        id: `challenge-${row.id}`,
        type: "challenge_invite",
        entityId: row.id,
        actorUserId: row.creatorUserId,
        title: `@${names.get(row.creatorUserId) || "player"} rzuca Ci wyzwanie`,
        body: `${row.sport} ${row.format} · ${row.courtName}`,
        readAt: null,
        createdAt: row.createdAt,
      }));
    }

    const notifications = [...challengeNotifications, ...storedNotifications]
      .sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime())
      .slice(0, 50);

    return json({
      ok: true,
      followers: followerCount,
      following: followingCount,
      followingUserIds: following.map((item) => item.userId),
      feed,
      notifications,
      unreadCount: notifications.filter((item) => !item.readAt).length,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : 400);
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const current = await requireCurrentPlayUser();
    const body = await request.json();
    const action = String(body.action || "");
    const now = new Date();

    if (action === "follow" || action === "unfollow") {
      const targetUserId = String(body.userId || "");
      if (!targetUserId || targetUserId === current.id) throw new Error("INVALID_PLAYER");
      const target = (await db.select({ id: users.id, nickname: users.nickname }).from(users).where(eq(users.id, targetUserId)).limit(1))[0];
      if (!target) throw new Error("PLAYER_NOT_FOUND");
      const existing = (await db.select({ id: playerFollows.id }).from(playerFollows).where(and(eq(playerFollows.followerUserId, current.id), eq(playerFollows.followingUserId, targetUserId))).limit(1))[0];
      if (action === "follow" && !existing) {
        await db.insert(playerFollows).values({ id: newId("follow"), followerUserId: current.id, followingUserId: targetUserId, createdAt: now });
        await db.insert(playNotifications).values({
          id: newId("notify"),
          userId: targetUserId,
          actorUserId: current.id,
          type: "new_follower",
          entityId: current.id,
          title: `@${current.nickname} obserwuje Twój profil`,
          body: "Nowy gracz w Twojej sieci Gamefields PLAY.",
          createdAt: now,
        });
      }
      if (action === "unfollow" && existing) await db.delete(playerFollows).where(eq(playerFollows.id, existing.id));
      return json({ ok: true });
    }

    if (action === "mark_notifications_read") {
      await db.update(playNotifications).set({ readAt: now }).where(and(eq(playNotifications.userId, current.id), isNull(playNotifications.readAt)));
      return json({ ok: true });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return json({ ok: false, error: code }, code === "UNAUTHENTICATED" ? 401 : code.endsWith("NOT_FOUND") ? 404 : 400);
  }
}
