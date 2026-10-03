import { assertSameOrigin,playError } from "@/lib/play-http";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb,getD1 } from "@/db";
import { tournamentEntries, tournamentMatches, tournaments } from "@/db/play-competition";
import { courts, playerSports, users } from "@/db/schema";
import { requireCurrentPlayUser } from "@/lib/play-auth";
import { awardCoins, ensurePlayerSport, isPlaySport, newId, playerTier } from "@/lib/play-engine";

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

async function tournamentDetail(tournamentId: string, currentUserId: string) {
  const db = getDb();
  const tournament = (await db
    .select({
      id: tournaments.id,
      organizerUserId: tournaments.organizerUserId,
      organizerNickname: users.nickname,
      courtId: tournaments.courtId,
      courtName: courts.name,
      name: tournaments.name,
      sport: tournaments.sport,
      format: tournaments.format,
      maxEntries: tournaments.maxEntries,
      startsAt: tournaments.startsAt,
      status: tournaments.status,
      createdAt: tournaments.createdAt,
    })
    .from(tournaments)
    .innerJoin(users, eq(users.id, tournaments.organizerUserId))
    .innerJoin(courts, eq(courts.id, tournaments.courtId))
    .where(eq(tournaments.id, tournamentId))
    .limit(1))[0];
  if (!tournament) throw new Error("TOURNAMENT_NOT_FOUND");

  const entries = await db
    .select({
      id: tournamentEntries.id,
      userId: users.id,
      nickname: users.nickname,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      seed: tournamentEntries.seed,
      status: tournamentEntries.status,
      elo: playerSports.elo,
    })
    .from(tournamentEntries)
    .innerJoin(users, eq(users.id, tournamentEntries.userId))
    .leftJoin(playerSports, and(eq(playerSports.userId, users.id), eq(playerSports.sport, tournament.sport)))
    .where(eq(tournamentEntries.tournamentId, tournamentId))
    .orderBy(asc(tournamentEntries.seed), desc(playerSports.elo));

  const matches = await db
    .select({
      id: tournamentMatches.id,
      round: tournamentMatches.round,
      position: tournamentMatches.position,
      playerAUserId: tournamentMatches.playerAUserId,
      playerBUserId: tournamentMatches.playerBUserId,
      scoreA: tournamentMatches.scoreA,
      scoreB: tournamentMatches.scoreB,
      submittedByUserId: tournamentMatches.submittedByUserId,
      resultConfirmedAt: tournamentMatches.resultConfirmedAt,
      winnerUserId: tournamentMatches.winnerUserId,
      nextMatchId: tournamentMatches.nextMatchId,
      status: tournamentMatches.status,
    })
    .from(tournamentMatches)
    .where(eq(tournamentMatches.tournamentId, tournamentId))
    .orderBy(asc(tournamentMatches.round), asc(tournamentMatches.position));

  const names = new Map(entries.map((entry) => [entry.userId, entry.nickname]));
  return {
    tournament,
    entries: entries.map((entry) => ({ ...entry, elo: entry.elo ?? 1000, tier: playerTier(entry.elo ?? 1000) })),
    matches: matches.map((match) => ({
      ...match,
      playerANickname: match.playerAUserId ? names.get(match.playerAUserId) || null : null,
      playerBNickname: match.playerBUserId ? names.get(match.playerBUserId) || null : null,
      winnerNickname: match.winnerUserId ? names.get(match.winnerUserId) || null : null,
    })),
    isOrganizer: tournament.organizerUserId === currentUserId,
    isEntered: entries.some((entry) => entry.userId === currentUserId),
  };
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const user = await requireCurrentPlayUser();
    const url = new URL(request.url);
    const tournamentId = url.searchParams.get("id");
    if (tournamentId) return json({ ok: true, ...(await tournamentDetail(tournamentId, user.id)) });

    const rows = await db
      .select({
        id: tournaments.id,
        name: tournaments.name,
        sport: tournaments.sport,
        format: tournaments.format,
        maxEntries: tournaments.maxEntries,
        startsAt: tournaments.startsAt,
        status: tournaments.status,
        organizerNickname: users.nickname,
        courtName: courts.name,
        entryCount: sql<number>`count(${tournamentEntries.id})`,
      })
      .from(tournaments)
      .innerJoin(users, eq(users.id, tournaments.organizerUserId))
      .innerJoin(courts, eq(courts.id, tournaments.courtId))
      .leftJoin(tournamentEntries, eq(tournamentEntries.tournamentId, tournaments.id))
      .groupBy(tournaments.id)
      .orderBy(tournaments.startsAt)
      .limit(100);
    return json({ ok: true, tournaments: rows });
  } catch (error) {
    return playError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const db = getDb(),d1=getD1();
    const user = await requireCurrentPlayUser();
    const body = await request.json();
    const action = String(body.action || "");
    const now = new Date();

    if (action === "create") {
      const sport = String(body.sport || "");
      if (!isPlaySport(sport)) throw new Error("INVALID_SPORT");
      const courtId = String(body.courtId || "");
      const court = (await db.select({ id: courts.id,sports:courts.sports }).from(courts).where(eq(courts.id, courtId)).limit(1))[0];
      if (!court) throw new Error("COURT_NOT_FOUND");
      if(!court.sports.includes(sport))throw new Error("COURT_SPORT_MISMATCH");
      if(String(body.format||"1v1")!=="1v1")throw new Error("INVALID_FORMAT");
      const startsAt = new Date(body.startsAt);
      if (!Number.isFinite(startsAt.getTime()) || startsAt.getTime()<Date.now()-300000) throw new Error("INVALID_START_TIME");
      const maxEntries = Number(body.maxEntries || 8);
      if (![2, 4, 8, 16, 32].includes(maxEntries)) throw new Error("INVALID_BRACKET_SIZE");
      const tournamentId = newId("tournament");
      await ensurePlayerSport(user.id, sport);
      await db.batch([db.insert(tournaments).values({
        id: tournamentId,
        organizerUserId: user.id,
        courtId,
        name: String(body.name || "Gamefields Tournament").trim().slice(0, 100),
        sport,
        format: String(body.format || "1v1").slice(0, 12),
        maxEntries,
        startsAt,
        status: "open",
        createdAt: now,
        updatedAt: now,
      }), db.insert(tournamentEntries).values({ id: newId("entry"), tournamentId, userId: user.id, status: "active", createdAt: now })]);
      return json({ ok: true, tournamentId });
    }

    const tournamentId = String(body.tournamentId || "");
    const tournament = (await db.select().from(tournaments).where(eq(tournaments.id, tournamentId)).limit(1))[0];
    if (!tournament) throw new Error("TOURNAMENT_NOT_FOUND");
    if (!isPlaySport(tournament.sport)) throw new Error("INVALID_SPORT");

    if (action === "join") {
      const existing=(await db.select({id:tournamentEntries.id}).from(tournamentEntries).where(and(eq(tournamentEntries.tournamentId,tournamentId),eq(tournamentEntries.userId,user.id))).limit(1))[0];
      if(existing)return json({ok:true,...await tournamentDetail(tournamentId,user.id)});
      await ensurePlayerSport(user.id,tournament.sport);
      const result=await d1.prepare("INSERT OR IGNORE INTO play_tournament_entries (id,tournament_id,user_id,status,created_at) SELECT ?,id,?,'active',? FROM play_tournaments WHERE id=? AND status='open' AND max_entries>(SELECT count(*) FROM play_tournament_entries WHERE tournament_id=?)").bind(newId("entry"),user.id,Math.floor(now.getTime()/1000),tournamentId,tournamentId).run();
      if(!result.meta.changes)throw new Error("TOURNAMENT_FULL");
      await awardCoins(user.id,"tournament_join",tournamentId,10,"Joined tournament");
      return json({ok:true,...await tournamentDetail(tournamentId,user.id)});
    }

    if (action === "leave") {
      if (tournament.status !== "open") throw new Error("TOURNAMENT_CLOSED");
      if (tournament.organizerUserId === user.id) throw new Error("ORGANIZER_CANNOT_LEAVE");
      await d1.prepare("DELETE FROM play_tournament_entries WHERE tournament_id=? AND user_id=? AND EXISTS (SELECT 1 FROM play_tournaments WHERE id=? AND status='open')").bind(tournamentId,user.id,tournamentId).run();
      return json({ ok: true });
    }

    if (action === "start") {
      if (tournament.organizerUserId !== user.id) throw new Error("ORGANIZER_ONLY");
      if (tournament.status !== "open") throw new Error("TOURNAMENT_ALREADY_STARTED");
      const entries = await db
        .select({ entryId: tournamentEntries.id, userId: tournamentEntries.userId, elo: playerSports.elo })
        .from(tournamentEntries)
        .leftJoin(playerSports, and(eq(playerSports.userId, tournamentEntries.userId), eq(playerSports.sport, tournament.sport)))
        .where(eq(tournamentEntries.tournamentId, tournamentId));
      const size = entries.length;
      if (size < 2 || (size & (size - 1)) !== 0) throw new Error("ENTRIES_MUST_BE_POWER_OF_TWO");
      if (size > tournament.maxEntries) throw new Error("TOO_MANY_ENTRIES");
      const seeded = [...entries].sort((a, b) => (b.elo ?? 1000) - (a.elo ?? 1000));
      const rounds = Math.log2(size);
      const ids: string[][] = [];
      for (let round = 1; round <= rounds; round += 1) {
        const matchCount = size / 2 ** round;
        ids[round] = Array.from({ length: matchCount }, () => newId("tm"));
      }
      const stamp=Math.floor(now.getTime()/1000),writes:D1PreparedStatement[]=[];
      const guard="EXISTS (SELECT 1 FROM play_tournament_matches WHERE id=?)";
      for (let round = 1; round <= rounds; round += 1) {
        const matchCount = size / 2 ** round;
        for (let position = 0; position < matchCount; position += 1) {
          let playerAUserId: string | null = null;
          let playerBUserId: string | null = null;
          if (round === 1) {
            playerAUserId = seeded[position].userId;
            playerBUserId = seeded[size - 1 - position].userId;
          }
          const nextMatchId = round < rounds ? ids[round + 1][Math.floor(position / 2)] : null;
          const first=round===1&&position===0;
          const condition=first?`EXISTS (SELECT 1 FROM play_tournaments WHERE id=? AND status='open') AND (SELECT count(*) FROM play_tournament_entries WHERE tournament_id=?)=? AND NOT EXISTS (SELECT 1 FROM play_tournament_entries WHERE tournament_id=? AND id NOT IN (${seeded.map(()=>"?").join(",")}))`:guard;
          const args=first?[tournamentId,tournamentId,size,tournamentId,...seeded.map(x=>x.entryId)]:[ids[1][0]];
          writes.push(d1.prepare(`INSERT INTO play_tournament_matches (id,tournament_id,round,position,player_a_user_id,player_b_user_id,next_match_id,status,created_at,updated_at) SELECT ?,?,?,?,?,?,?,?,?,? WHERE ${condition}`).bind(ids[round][position],tournamentId,round,position+1,playerAUserId,playerBUserId,nextMatchId,round===1?"ready":"pending",stamp,stamp,...args));
        }
      }
      seeded.forEach((entry,i)=>writes.push(d1.prepare(`UPDATE play_tournament_entries SET seed=? WHERE id=? AND ${guard}`).bind(i+1,entry.entryId,ids[1][0])));
      writes.push(d1.prepare(`UPDATE play_tournaments SET status='in_progress',updated_at=? WHERE id=? AND status='open' AND ${guard}`).bind(stamp,tournamentId,ids[1][0]));
      const results=await d1.batch(writes);
      if(!results[0].meta.changes)throw new Error("STATE_CHANGED");
      return json({ ok: true, ...(await tournamentDetail(tournamentId, user.id)) });
    }

    if (action === "submit_match") {
      const matchId = String(body.matchId || "");
      const match = (await db.select().from(tournamentMatches).where(and(eq(tournamentMatches.id, matchId), eq(tournamentMatches.tournamentId, tournamentId))).limit(1))[0];
      if (!match) throw new Error("MATCH_NOT_FOUND");
      if (!match.playerAUserId || !match.playerBUserId) throw new Error("MATCH_NOT_READY");
      if (user.id !== match.playerAUserId && user.id !== match.playerBUserId && user.id !== tournament.organizerUserId) throw new Error("NOT_MATCH_PARTICIPANT");
      const scoreA = Number(body.scoreA);
      const scoreB = Number(body.scoreB);
      if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0 || scoreA > 99 || scoreB > 99 || scoreA === scoreB) throw new Error("INVALID_SCORE");
      const result=await d1.prepare("UPDATE play_tournament_matches SET score_a=?,score_b=?,submitted_by_user_id=?,status='awaiting_confirmation',updated_at=? WHERE id=? AND status='ready' AND result_confirmed_at IS NULL AND EXISTS (SELECT 1 FROM play_tournaments WHERE id=? AND status='in_progress')").bind(scoreA,scoreB,user.id,Math.floor(now.getTime()/1000),matchId,tournamentId).run();
      if(!result.meta.changes)throw new Error("MATCH_NOT_READY");
      return json({ ok: true });
    }

    if (action === "confirm_match") {
      const matchId = String(body.matchId || "");
      const match = (await db.select().from(tournamentMatches).where(and(eq(tournamentMatches.id, matchId), eq(tournamentMatches.tournamentId, tournamentId))).limit(1))[0];
      if (!match) throw new Error("MATCH_NOT_FOUND");
      if (match.status === "completed") return json({ ok: true, ...(await tournamentDetail(tournamentId, user.id)) });
      if (match.status !== "awaiting_confirmation" || match.scoreA == null || match.scoreB == null || !match.submittedByUserId) throw new Error("RESULT_NOT_SUBMITTED");
      if (user.id === match.submittedByUserId) throw new Error("SECOND_PARTY_REQUIRED");
      if (user.id !== tournament.organizerUserId && user.id !== match.playerAUserId && user.id !== match.playerBUserId) throw new Error("NOT_MATCH_PARTICIPANT");
      const winnerUserId = match.scoreA > match.scoreB ? match.playerAUserId : match.playerBUserId;
      if (!winnerUserId) throw new Error("WINNER_UNAVAILABLE");
      const stamp=Math.floor(now.getTime()/1000),writes=[d1.prepare("UPDATE play_tournament_matches SET winner_user_id=?,result_confirmed_at=?,status='completed',updated_at=? WHERE id=? AND status='awaiting_confirmation' AND submitted_by_user_id=? AND score_a=? AND score_b=?").bind(winnerUserId,stamp,stamp,matchId,match.submittedByUserId,match.scoreA,match.scoreB)];
      const guard="EXISTS (SELECT 1 FROM play_tournament_matches WHERE id=? AND status='completed' AND winner_user_id=?)";
      if(match.nextMatchId){const slot=match.position%2===1?"player_a_user_id":"player_b_user_id";
        writes.push(d1.prepare(`UPDATE play_tournament_matches SET ${slot}=?,updated_at=? WHERE id=? AND ${slot} IS NULL AND ${guard}`).bind(winnerUserId,stamp,match.nextMatchId,matchId,winnerUserId));
        writes.push(d1.prepare("UPDATE play_tournament_matches SET status='ready' WHERE id=? AND status='pending' AND player_a_user_id IS NOT NULL AND player_b_user_id IS NOT NULL").bind(match.nextMatchId));
      }else writes.push(d1.prepare(`UPDATE play_tournaments SET status='completed',updated_at=? WHERE id=? AND ${guard}`).bind(stamp,tournamentId,matchId,winnerUserId));
      for(const reward of [{type:"tournament_match_win",source:matchId,coins:25},...(!match.nextMatchId?[{type:"tournament_win",source:tournamentId,coins:250}]:[])]){
        const coinId=newId("coin");writes.push(d1.prepare(`INSERT OR IGNORE INTO coin_ledger (id,user_id,source_type,source_id,amount,note,created_at) SELECT ?,?,?,?,?,?,? WHERE ${guard}`).bind(coinId,winnerUserId,reward.type,reward.source,reward.coins,"Tournament result",stamp,matchId,winnerUserId));
        writes.push(d1.prepare("UPDATE users SET coins=coins+?,updated_at=? WHERE id=? AND EXISTS (SELECT 1 FROM coin_ledger WHERE id=?)").bind(reward.coins,stamp,winnerUserId,coinId));
      }
      await d1.batch(writes);
      return json({ ok: true, ...(await tournamentDetail(tournamentId, user.id)) });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (error) {
    return playError(error);
  }
}
