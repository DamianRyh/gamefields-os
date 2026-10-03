export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) throw new Error("INVALID_ORIGIN");
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") throw new Error("INVALID_ORIGIN");
}

export function validImageUrl(value: unknown) {
  if (!value) return null;
  const url = new URL(String(value));
  if (url.protocol !== "https:" || url.username || url.password || url.href.length > 500) throw new Error("INVALID_IMAGE_URL");
  return url.href;
}

export function playError(error: unknown) {
  const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  const known = /^[A-Z][A-Z_]+$/.test(code);
  if (!known) console.error("Gamefields PLAY request failed", error);
  const status = code === "UNAUTHENTICATED" ? 401 : /FORBIDDEN|ONLY$|NOT_IN_|INVALID_ORIGIN/.test(code) ? 403 : code.endsWith("NOT_FOUND") ? 404 : /STATE_CHANGED|DUPLICATE|CLOSED|ALREADY/.test(code) ? 409 : known ? 400 : 503;
  return Response.json({ ok: false, error: known ? code : "SERVICE_UNAVAILABLE" }, { status, headers: { "Cache-Control": "no-store" } });
}
