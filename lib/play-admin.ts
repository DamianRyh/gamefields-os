import type { InferSelectModel } from "drizzle-orm";
import { users } from "@/db/schema";

type PlayUser = InferSelectModel<typeof users>;

export function isPlayAdmin(user: PlayUser) {
  const configured = String(process.env.PLAY_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (!configured.length) return false;
  return configured.includes(user.email.toLowerCase());
}

export function requirePlayAdmin(user: PlayUser) {
  if (!isPlayAdmin(user)) throw new Error("FORBIDDEN");
  return user;
}
