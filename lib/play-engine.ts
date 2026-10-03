import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb, getD1 } from "@/db";
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
  }).onConflictDoNothing();
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
  const d1 = getD1();
  const safeAmount = Math.max(-5000, Math.min(5000, Math.trunc(amount)));
  if (!safeAmount) return false;
  const id = newId("coin");
  const now = Math.floor(Date.now() / 1000);
  const results = await d1.batch([
    d1.prepare("INSERT OR IGNORE INTO coin_ledger (id,user_id,source_type,source_id,amount,note,created_at) VALUES (?,?,?,?,?,?,?)").bind(id,userId,sourceType.slice(0,40),sourceId.slice(0,120),safeAmount,note?.slice(0,200)||null,now),
    d1.prepare("UPDATE users SET coins = coins + ?, updated_at = ? WHERE id = ? AND EXISTS (SELECT 1 FROM coin_ledger WHERE id = ?)").bind(safeAmount,now,userId,id),
  ]);
  return results[0].meta.changes > 0;
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
  if (game.status !== "open") throw new Error("GAME_NOT_OPEN");
  if (!isPlaySport(game.sport)) throw new Error("INVALID_SPORT");
  const players = await db.select({ id: gamePlayers.id, userId: gamePlayers.userId, elo: playerSports.elo })
    .from(gamePlayers).leftJoin(playerSports, and(eq(playerSports.userId, gamePlayers.userId), eq(playerSports.sport, game.sport)))
    .where(eq(gamePlayers.gameId, gameId));
  if (players.length !== game.maxPlayers) throw new Error("FULL_ROSTER_REQUIRED");
  const ranked = [...players].sort((a,b)=>(b.elo??1000)-(a.elo??1000) || a.userId.localeCompare(b.userId));
  let sumA=0, sumB=0, countA=0, countB=0;
  const assignments: Array<{id:string;team:"A"|"B"}> = [];
  for (const p of ranked) {
    const team = countA >= game.maxPlayers/2 ? "B" : countB >= game.maxPlayers/2 ? "A" : sumA <= sumB ? "A" : "B";
    assignments.push({id:p.id,team});
    if(team==="A"){sumA+=p.elo??1000;countA++;}else{sumB+=p.elo??1000;countB++;}
  }
  const d1=getD1();
  await d1.batch(assignments.map(a=>d1.prepare("UPDATE game_players SET team = ?, ready_at = NULL WHERE id = ? AND EXISTS (SELECT 1 FROM games WHERE id = ? AND status = 'open')").bind(a.team,a.id,gameId)));
  return {teamA:sumA,teamB:sumB,players:assignments};
}

export async function confirmResultAndApplyElo(gameId: string, confirmerUserId: string) {
  const db = getDb();
  const d1 = getD1();
  const game = (await db.select().from(games).where(eq(games.id,gameId)).limit(1))[0];
  if (!game) throw new Error("GAME_NOT_FOUND");
  if (!isPlaySport(game.sport)) throw new Error("INVALID_SPORT");
  const roster = await db.select().from(gamePlayers).where(eq(gamePlayers.gameId,gameId));
  const player = roster.find(p=>p.userId===confirmerUserId);
  if (!player) throw new Error("NOT_IN_GAME");
  if (game.resultConfirmedAt) return {alreadyApplied:true};
  if (game.status !== "awaiting_confirmation" || game.scoreA==null || game.scoreB==null || !game.submittedByUserId) throw new Error("RESULT_NOT_SUBMITTED");
  const submitter=roster.find(p=>p.userId===game.submittedByUserId);
  if (confirmerUserId===game.submittedByUserId) throw new Error("SECOND_PARTY_REQUIRED");
  if (!submitter?.team || !player.team || submitter.team===player.team) throw new Error("OPPOSING_TEAM_REQUIRED");
  if (roster.length!==game.maxPlayers || roster.some(p=>!p.team)) throw new Error("TEAMS_NOT_SET");
  const ratings = await db.select().from(playerSports).where(and(inArray(playerSports.userId,roster.map(p=>p.userId)),eq(playerSports.sport,game.sport)));
  const byUser = new Map(ratings.map(r=>[r.userId,r]));
  if (ratings.length!==roster.length) throw new Error("PLAYER_SPORT_REQUIRED");
  const teamA=roster.filter(p=>p.team==="A"),teamB=roster.filter(p=>p.team==="B");
  if (!teamA.length || teamA.length!==teamB.length) throw new Error("TEAMS_NOT_SET");
  const avgA=teamA.reduce((s,p)=>s+byUser.get(p.userId)!.elo,0)/teamA.length;
  const avgB=teamB.reduce((s,p)=>s+byUser.get(p.userId)!.elo,0)/teamB.length;
  const actualA=game.scoreA===game.scoreB?0.5:game.scoreA>game.scoreB?1:0;
  const now=Math.floor(Date.now()/1000), token=newId("settlement");
  const guard="EXISTS (SELECT 1 FROM play_game_settlements WHERE game_id = ? AND token = ?)";
  const ratingChecks=ratings.map(()=>"EXISTS (SELECT 1 FROM player_sports WHERE id = ? AND elo = ? AND games = ?)").join(" AND ");
  const batch = [d1.prepare(`INSERT INTO play_game_settlements (game_id,token,created_at) SELECT id,?,? FROM games WHERE id=? AND status='awaiting_confirmation' AND result_confirmed_at IS NULL AND score_a=? AND score_b=? AND submitted_by_user_id=? AND ${ratingChecks}`)
    .bind(token,now,gameId,game.scoreA,game.scoreB,game.submittedByUserId,...ratings.flatMap(r=>[r.id,r.elo,r.games]))];
  const changes: Array<{userId:string;before:number;after:number;change:number;tier:string}> = [];
  for (const p of roster) {
    const r=byUser.get(p.userId)!;
    const actual=p.team==="A"?actualA:1-actualA;
    const delta=Math.round(kFactor(r.games)*(actual-expectedScore(r.elo,p.team==="A"?avgB:avgA)));
    const next=Math.max(100,r.elo+delta),change=next-r.elo;
    const coins=25+(actual===1?15:actual===0.5?5:0);
    batch.push(d1.prepare(`INSERT INTO elo_history (id,game_id,user_id,sport,before,after,change,created_at) SELECT ?,?,?,?,?,?,?,? WHERE ${guard}`).bind(newId("elo"),gameId,p.userId,game.sport,r.elo,next,change,now,gameId,token));
    batch.push(d1.prepare(`UPDATE player_sports SET elo=?, games=games+1, wins=wins+?, losses=losses+?, draws=draws+?, provisional_games=provisional_games+1, updated_at=? WHERE id=? AND ${guard}`).bind(next,actual===1?1:0,actual===0?1:0,actual===0.5?1:0,now,r.id,gameId,token));
    batch.push(d1.prepare(`INSERT INTO coin_ledger (id,user_id,source_type,source_id,amount,note,created_at) SELECT ?,?,'game_complete',?,?,?,? WHERE ${guard}`).bind(newId("coin"),p.userId,gameId,coins,"Potwierdzony mecz",now,gameId,token));
    batch.push(d1.prepare(`UPDATE users SET coins=coins+?, updated_at=? WHERE id=? AND ${guard}`).bind(coins,now,p.userId,gameId,token));
    batch.push(d1.prepare(`INSERT INTO play_notifications (id,user_id,type,entity_id,title,body,created_at) SELECT ?,?,'game_result',?,?,?,? WHERE ${guard}`).bind(newId("notify"),p.userId,gameId,"Wynik potwierdzony",`${change>=0?"+":""}${change} ELO · ${game.scoreA}:${game.scoreB}`,now,gameId,token));
    changes.push({userId:p.userId,before:r.elo,after:next,change,tier:playerTier(next)});
  }
  batch.push(d1.prepare(`INSERT INTO result_confirmations (id,game_id,user_id,confirmed_at) SELECT ?,?,?,? WHERE ${guard}`).bind(newId("confirm"),gameId,confirmerUserId,now,gameId,token));
  batch.push(d1.prepare(`UPDATE games SET status='completed',result_confirmed_at=?,updated_at=? WHERE id=? AND ${guard}`).bind(now,now,gameId,gameId,token));
  try {
    const results=await d1.batch(batch);
    if (!results[0].meta.changes) throw new Error("STATE_CHANGED");
  } catch(error) {
    const settled=await db.select({id:games.id}).from(games).where(and(eq(games.id,gameId),eq(games.status,"completed"))).limit(1);
    if (settled[0]) return {alreadyApplied:true};
    throw error;
  }
  return {alreadyApplied:false,changes};
}
