import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensurePlayer } from "@/lib/play-engine";

export async function getCurrentPlayUser() {
  const auth = await getChatGPTUser();
  if (!auth) return null;
  return ensurePlayer({
    id: auth.userId,
    email: auth.email,
    displayName: auth.fullName || auth.displayName,
  });
}

export async function requireCurrentPlayUser() {
  const user = await getCurrentPlayUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
