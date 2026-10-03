export const GAME_FORMATS = ["1v1", "2v2", "3v3", "5v5"] as const;

export function formatCapacity(value: unknown) {
  const format = String(value);
  if (!(GAME_FORMATS as readonly string[]).includes(format)) throw new Error("INVALID_FORMAT");
  return Number(format[0]) * 2;
}

export function gameLifecycle(game: { status: string; maxPlayers: number }, players: Array<{ team: string | null; readyAt?: unknown }>) {
  if (game.status === "completed") return "completed";
  if (game.status === "awaiting_confirmation") return "waiting_confirmation";
  if (game.status === "in_progress") return "playing";
  const full = players.length === game.maxPlayers;
  if (full && players.every((p) => p.team && p.readyAt)) return "ready";
  return full ? "full" : "open";
}

export const lifecycleCopy: Record<string, { label: string; instruction: string }> = {
  open: { label: "OPEN", instruction: "Dołącz do składu. Gra ruszy, gdy zbierze się komplet graczy." },
  full: { label: "FULL", instruction: "Skład jest pełny. Organizator ustawia drużyny, potem każdy potwierdza gotowość." },
  ready: { label: "READY", instruction: "Wszyscy są gotowi. Organizator może rozpocząć mecz." },
  playing: { label: "PLAYING", instruction: "Grajcie. Po meczu jedna osoba wpisuje końcowy wynik." },
  waiting_confirmation: { label: "WAITING CONFIRMATION", instruction: "Wynik jest zapisany. Potwierdza go gracz z przeciwnej drużyny." },
  completed: { label: "COMPLETED", instruction: "Wynik potwierdzony. ELO i rankingi zostały zaktualizowane." },
};
