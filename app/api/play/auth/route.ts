import { assertSameOrigin } from "@/lib/play-http";
import { cookies } from "next/headers";
import { and, eq, lt, sql } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { playAccounts, playSessions } from "@/db/play-auth";
import { users } from "@/db/schema";
import { getCurrentPlayUser, getPublicSessionUser, PLAY_SESSION_COOKIE } from "@/lib/play-auth";
import { isPlayAdmin } from "@/lib/play-admin";
import { ensurePlayer, newId } from "@/lib/play-engine";
import { hashPassword, hashSessionToken, newSessionToken, verifyPassword } from "@/lib/play-password";

const SESSION_SECONDS = 60 * 60 * 24 * 30;
const LOCK_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase().slice(0, 254);
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(value: unknown) {
  const password = String(value || "");
  if (password.length < 10 || password.length > 128) throw new Error("PASSWORD_LENGTH");
  return password;
}

async function setSession(userId: string) {
  const db = getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_SECONDS * 1000);
  const token = newSessionToken();
  const tokenHash = await hashSessionToken(token);

  await db.delete(playSessions).where(and(eq(playSessions.userId, userId), lt(playSessions.expiresAt, now)));
  await db.insert(playSessions).values({
    id: newId("session"),
    userId,
    tokenHash,
    expiresAt,
    createdAt: now,
    lastSeenAt: now,
  });

  const cookieStore = await cookies();
  cookieStore.set(PLAY_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PLAY_SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    const tokenHash = await hashSessionToken(token);
    await db.delete(playSessions).where(eq(playSessions.tokenHash, tokenHash));
  }
  cookieStore.set(PLAY_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function GET() {
  try {
    const hostedIdentity = await getChatGPTUser();
    const user = await getCurrentPlayUser();
    if (!user) return json({ ok: true, authenticated: false, provider: null });
    return json({
      ok: true,
      authenticated: true,
      provider: await getPublicSessionUser() ? "gamefields" : hostedIdentity ? "hosted" : "gamefields",
      isAdmin: await isPlayAdmin(user),
      user: { id: user.id, email: user.email, nickname: user.nickname, displayName: user.displayName, city: user.city },
    });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "UNKNOWN_ERROR" }, 400);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const db = getDb();
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "register") {
      const email = normalizeEmail(body.email);
      const password = validatePassword(body.password);
      const displayName = String(body.displayName || "").trim().slice(0, 80) || null;
      if (!validEmail(email)) throw new Error("INVALID_EMAIL");

      const existingAccount = (await db.select({ id: playAccounts.id }).from(playAccounts).where(eq(playAccounts.email, email)).limit(1))[0];
      if (existingAccount) throw new Error("ACCOUNT_EXISTS");

      let user = (await db.select().from(users).where(sql`lower(${users.email}) = ${email}`).limit(1))[0];
      if (user) {
        const hosted = await getChatGPTUser();
        if (!hosted || hosted.userId !== user.id || hosted.email.toLowerCase() !== email) throw new Error("ACCOUNT_EXISTS");
      } else user = await ensurePlayer({ id: newId("user"), email, displayName });

      const passwordData = await hashPassword(password);
      const now = new Date();
      await db.insert(playAccounts).values({
        id: newId("account"),
        userId: user.id,
        email,
        passwordHash: passwordData.hash,
        passwordSalt: passwordData.salt,
        passwordVersion: 2,
        failedAttempts: 0,
        lockedUntil: null,
        createdAt: now,
        updatedAt: now,
      });

      await setSession(user.id);
      return json({ ok: true, provider: "gamefields", user: { id: user.id, email: user.email, nickname: user.nickname } });
    }

    if (action === "login") {
      const email = normalizeEmail(body.email);
      const password = validatePassword(body.password);
      if (!validEmail(email)) throw new Error("INVALID_CREDENTIALS");

      const account = (await db.select().from(playAccounts).where(eq(playAccounts.email, email)).limit(1))[0];
      if (!account) {
        await hashPassword(password);
        throw new Error("INVALID_CREDENTIALS");
      }

      const now = new Date();
      if (account.lockedUntil && account.lockedUntil.getTime() > now.getTime()) throw new Error("AUTH_TEMP_LOCKED");

      const valid = await verifyPassword(password, account.passwordSalt, account.passwordHash);
      if (!valid) {
        const failedAttempts = account.failedAttempts + 1;
        const lockedUntil = failedAttempts >= MAX_FAILED_ATTEMPTS
          ? new Date(now.getTime() + LOCK_MINUTES * 60 * 1000)
          : null;
        await db.update(playAccounts).set({
          failedAttempts: lockedUntil ? 0 : failedAttempts,
          lockedUntil,
          updatedAt: now,
        }).where(eq(playAccounts.id, account.id));
        throw new Error("INVALID_CREDENTIALS");
      }

      await db.update(playAccounts).set({ failedAttempts: 0, lockedUntil: null, updatedAt: now }).where(eq(playAccounts.id, account.id));
      await setSession(account.userId);
      const user = (await db.select().from(users).where(eq(users.id, account.userId)).limit(1))[0];
      return json({ ok: true, provider: "gamefields", user: user ? { id: user.id, email: user.email, nickname: user.nickname } : null });
    }

    if (action === "logout") {
      await clearSession();
      return json({ ok: true });
    }

    throw new Error("UNKNOWN_ACTION");
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status = code === "INVALID_CREDENTIALS" || code === "AUTH_TEMP_LOCKED" ? 401 : 400;
    return json({ ok: false, error: code }, status);
  }
}
