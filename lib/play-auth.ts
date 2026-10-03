import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { playSessions } from "@/db/play-auth";
import { users } from "@/db/schema";
import { ensurePlayer } from "@/lib/play-engine";
import { hashSessionToken } from "@/lib/play-password";

export const PLAY_SESSION_COOKIE = "gf_play_session";

async function getHostedPlayUser() {
  const auth = await getChatGPTUser();
  if (!auth) return null;

  const db = getDb();
  const existingById = (await db.select().from(users).where(eq(users.id, auth.userId)).limit(1))[0];
  if (existingById) return existingById;

  const existingByEmail = (await db.select().from(users).where(eq(users.email, auth.email.toLowerCase())).limit(1))[0];
  if (existingByEmail) return existingByEmail;

  return ensurePlayer({
    id: auth.userId,
    email: auth.email.toLowerCase(),
    displayName: auth.fullName || auth.displayName,
  });
}

async function getPublicSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PLAY_SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const tokenHash = await hashSessionToken(token);
  const row = (await db
    .select({ user: users })
    .from(playSessions)
    .innerJoin(users, eq(users.id, playSessions.userId))
    .where(and(eq(playSessions.tokenHash, tokenHash), gt(playSessions.expiresAt, new Date())))
    .limit(1))[0];

  return row?.user || null;
}

export async function getCurrentPlayUser() {
  return (await getHostedPlayUser()) || (await getPublicSessionUser());
}

export async function requireCurrentPlayUser() {
  const user = await getCurrentPlayUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
