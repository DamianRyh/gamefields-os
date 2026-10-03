import type { InferSelectModel } from "drizzle-orm";
import { users } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";

type PlayUser = InferSelectModel<typeof users>;

export async function isPlayAdmin(user: PlayUser) {
  const configured = String(process.env.PLAY_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const trustedIds = String(process.env.PLAY_ADMIN_USER_IDS || "").split(",").map(v=>v.trim()).filter(Boolean);
  if (trustedIds.includes(user.id)) return true;
  if (!configured.includes(user.email.toLowerCase())) return false;
  const identity = await getChatGPTUser();
  return Boolean(identity && identity.email.toLowerCase() === user.email.toLowerCase() && identity.userId === user.id);
}

export async function requirePlayAdmin(user: PlayUser) {
  if (!await isPlayAdmin(user)) throw new Error("FORBIDDEN");
  return user;
}
