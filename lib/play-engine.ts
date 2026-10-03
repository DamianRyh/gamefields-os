import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  coinLedger,
  eloHistory,
  gamePlayers,
  games,
  playerSports,
  resultConfirmations,
  users,
} from "@/db/schema";

export const PLAY_SPORTS = ["football", "basketball"] as const;
export type PlaySport = (typeof PLAY_SPORTS)[number];

export const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "competitive"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export function isPlaySport(value: string): value is PlaySport {
  return (PLAY_SPORTS as readonly string[]).includes(value);
}

export function isSkillLevel(value: string): value is SkillLevel {
  return (SKILL_LEVELS as readonly string[]).includes(value);
}

export function startingElo(level: SkillLevel) {
  if (level === "competitive") return 1350;
  if (level === "advanced") return 1200;
  if (level === "intermediate") return 1050;
  return 900;
}

export function playerTier(elo: number) {
  if (elo >= 1500) return "Legend";
  if (elo >= 1350) return "Elite";
  if (elo >= 1200) return "Challenger";
  if (elo >= 1050) return "Street";
  return "Rookie";
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function normalizeNickname(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return normalized || `player-${crypto.randomUUID().slice(0, 6)}`;
}

export async function ensurePlayer(input: {
  id: string;
  email: string;
  displayName?: string | null;
}) {
  const db = getDb();
  const now = new Date();
  const existing = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
  if (existing[0]) return existing[0];

  const base = normalizeNickname(input.displayName || input.email.split("@")[0] || "player");
  let nickname = base;
  for (let i = 0; i < 8; i += 1) {
    const conflict = await db.select({ id: users.id }).from(users).where(eq(users.nickname, nickname)).limit(1);
    if (!conflict[0]) break;
    nickname = `${base}-${Math.floor(100 + Math.random() * 900)}`;
  }

  await db.insert(users).values({
    id: input.id,
    email: input.email,
    nickname,
    displayName: input.displayName || null,
    city: "Warszawa",
    coins: 0,
    createdAt: now,
    updatedAt: now,
  });

  return (await db.select().from(users).where(eq(users.id, input.id)).limit(1))[0];
}

export async function ensurePlayerSport(userId: string, sport: PlaySport, skillLevel: SkillLevel = "beginner") {
  const db = getDb();
  const existing = await db
    .select()
    .from(playerSports)
    .where(and(eq(playerSports.userId, userId), eq(playerSports.sport, sport)))
    .limit(1);
  if (existing[0]) return existing[0];
  await db.insert(playerSports).values({
    id: newId("ps"),
    userId,
    sport,
    skillLevel,
    elo: startingElo(skillLevel),
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    provisionalGames: 0,
    updatedAt: new Date(),
  });
  return (await db
    .select()
    .from(playerSports)
    .where(and(eq(playerSports.userId, userId), eq(playerSports.sport, sport)))
    .limit(1))[0];
}

export async function setPlayerSkillLevel(userId: string, sport: PlaySport, skillLevel: SkillLevel) {
  const db = getDb();
  const current = await ensurePlayerSport(userId, sport, skillLevel);
  if (current.games > 0) throw new Error("SKILL_LEVEL_LOCKED");
  const elo = startingElo(skillLevel);
  await db.update(playerSports).set({ skillLevel, elo, updatedAt: new Date() }).where(eq(playerSports.id, current.id));
  return { skillLevel, elo, tier: playerTier(elo) };
}

export async function awardCoins(userId: string, sourceType: string, sourceId: string, amount: number, note?: string) {
  const db = getDb();
  const safeAmount = Math.max(-5000, Math.min(5000, Math.trunc(amount)));
  if (!safeAmount) return false;
  const existing = await db
    .select({ id: coinLedger.id })
    .from(coinLedger)
    .where(and(eq(coinLedger.userId, userId), eq(coinLedger.sourceType, sourceType), eq(coinLedger.sourceId, sourceId)))
    .limit(1);
  if (existing[0]) return false;

  await db.insert(coinLedger).values({
    id: newId("coin"),
    userId,
    sourceType: sourceType.slice(0, 40),
    sourceId: sourceId.slice(0, 120),
    amount: safeAmount,
    note: note?.slice(0, 200) || null,
    createdAt: new Date(),
  });
  await db.update(users).set({ coins: sql`${users.coins} + ${safeAmount}`, updatedAt: new Date() }).where(eq(users.id, userId));
  return true;
}

function kFactor(gamesPlayed: number) {
  if (gamesPlayed < 10) return 40;
  if (gamesPlayed < 30) return 32;
  return 24;
}

function expectedScore(rating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400));
}

export async function generateBalancedTeams(gameId: string) {
  const db = getDb();
  const game = (await db.select().from(games).where(eq(games.id, gameId)).limit(1))[0];
  if (!game) throw new Error("GAME_NOT_FOUND");
  if (!isPlaySport(game.sport)) throw new Error("INVALID_SPORT");

  const players = await db
    .select({
      id: gamePlayers.id,
      userId: gamePlayers.userId,
      elo: playerSports.elo,
    })
    .from(gamePlayers)
    .leftJoin(
      playerSports,
      and(eq(playerSports.userId, gamePlayers.userId), eq(playerSports.sport, game.sport)),
    )
    .where(eq(gamePlayers.gameId, gameId));

  if (players.length < 2) throw new Error("NOT_ENOUGH_PLAYERS");
  const ranked = [...players].sort((a, b) => (b.elo ?? 1000) - (a.elo ?? 1000));
  let sumA = 0;
  let sumB = 0;
  const assignments: Array<{ id: string; team: "A" | "B" }> = [];
  for (const player of ranked) {
    const elo = player.elo ?? 1000;
    const team = sumA <= sumB ? "A" : "B";
    assignments.push({ id: player.id, team });
    if (team === "A") sumA += elo;
    else sumB += elo;
  }

  for (const assignment of assignments) {
    await db.update(gamePlayers).set({ team: assignment.team }).where(eq(gamePlayers.id, assignment.id));
  }
  return { teamA: sumA, teamB: sumB, players: assignments };
}

export async function confirmResultAndApplyElo(gameId: string, confirmerUserId: string) {
  const db = getDb();
  const game = (await db.select().from(games).where(eq(games.id, gameId)).limit(1))[0];
  if (!game) throw new Error("GAME_NOT_FOUND");
  if (!isPlaySport(game.sport)) throw new Error("INVALID_SPORT");
  if (game.scoreA == null || game.scoreB == null || !game.submittedByUserId) throw new Error("RESULT_NOT_SUBMITTED");
  if (game.resultConfirmedAt) return { alreadyApplied: true };
  if (confirmerUserId === game.submittedByUserId) throw new Error("SECOND_PARTY_REQUIRED");

  const player = (await db
    .select()
    .from(gamePlayers)
    .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, confirmerUserId)))
    .limit(1))[0];
  if (!player) throw new Error("NOT_IN_GAME");

  const submitter = (await db
    .select()
    .from(gamePlayers)
    .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, game.submittedByUserId)))
    .limit(1))[0];
  if (!submitter || !submitter.team || !player.team || submitter.team === player.team) {
    throw new Error("OPPOSING_TEAM_REQUIRED");
  }

  const existingHistory = await db.select({ id: eloHistory.id }).from(eloHistory).where(eq(eloHistory.gameId, gameId)).limit(1);
  if (existingHistory[0]) {
    await db.update(games).set({ resultConfirmedAt: new Date(), status: "completed", updatedAt: new Date() }).where(eq(games.id, gameId));
    return { alreadyApplied: true };
  }

  const roster = await db
    .select({ id: gamePlayers.id, userId: gamePlayers.userId, team: gamePlayers.team })
    .from(gamePlayers)
    .where(eq(gamePlayers.gameId, gameId));
  if (roster.some((p) => p.team !== "A" && p.team !== "B")) throw new Error("TEAMS_NOT_SET");

  const userIds = roster.map((p) => p.userId);
  for (const userId of userIds) await ensurePlayerSport(userId, game.sport);
  const ratings = await db
    .select()
    .from(playerSports)
    .where(and(inArray(playerSports.userId, userIds), eq(playerSports.sport, game.sport)));
  const byUser = new Map(ratings.map((r) => [r.userId, r]));
  const teamA = roster.filter((p) => p.team === "A");
  const teamB = roster.filter((p) => p.team === "B");
  const avgA = teamA.reduce((s, p) => s + (byUser.get(p.userId)?.elo ?? 1000), 0) / teamA.length;
  const avgB = teamB.reduce((s, p) => s + (byUser.get(p.userId)?.elo ?? 1000), 0) / teamB.length;
  const actualA = game.scoreA === game.scoreB ? 0.5 : game.scoreA > game.scoreB ? 1 : 0;
  const actualB = 1 - actualA;
  const now = new Date();
  const changes: Array<{ userId: string; before: number; after: number; change: number; tier: string }> = [];

  for (const p of roster) {
    const current = byUser.get(p.userId)!;
    const expected = p.team === "A" ? expectedScore(current.elo, avgB) : expectedScore(current.elo, avgA);
    const actual = p.team === "A" ? actualA : actualB;
    const delta = Math.round(kFactor(current.games) * (actual - expected));
    const next = Math.max(100, current.elo + delta);
    const won = actual === 1;
    const lost = actual === 0;
    const drawn = actual === 0.5;

    await db.update(playerSports).set({
      elo: next,
      games: sql`${playerSports.games} + 1`,
      wins: won ? sql`${playerSports.wins} + 1` : current.wins,
      losses: lost ? sql`${playerSports.losses} + 1` : current.losses,
      draws: drawn ? sql`${playerSports.draws} + 1` : current.draws,
      provisionalGames: sql`${playerSports.provisionalGames} + 1`,
      updatedAt: now,
    }).where(eq(playerSports.id, current.id));

    await db.insert(eloHistory).values({
      id: newId("elo"),
      gameId,
      userId: p.userId,
      sport: game.sport,
      before: current.elo,
      after: next,
      change: delta,
      createdAt: now,
    });

    await awardCoins(p.userId, "game_complete", gameId, 25, "Completed game");
    if (won) await awardCoins(p.userId, "game_win", gameId, 15, "Game win");
    if (drawn) await awardCoins(p.userId, "game_draw", gameId, 5, "Game draw");

    changes.push({ userId: p.userId, before: current.elo, after: next, change: delta, tier: playerTier(next) });
  }

  await db.insert(resultConfirmations).values({
    id: newId("confirm"),
    gameId,
    userId: confirmerUserId,
    confirmedAt: now,
  });
  await db.update(games).set({ status: "completed", resultConfirmedAt: now, updatedAt: now }).where(eq(games.id, gameId));
  return { alreadyApplied: false, changes };
}
