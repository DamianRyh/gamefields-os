import { getD1 } from "@/db";

const REQUIRED_TABLES = [
  "users",
  "player_sports",
  "courts",
  "home_courts",
  "games",
  "game_players",
  "result_confirmations",
  "elo_history",
  "court_checkins",
  "coin_ledger",
  "challenges",
  "challenge_players",
  "challenge_messages",
  "court_reports",
  "court_report_supports",
  "play_tournaments",
  "play_tournament_entries",
  "play_tournament_matches",
  "play_player_follows",
  "play_notifications",
  "play_accounts",
  "play_sessions",
] as const;

export async function GET() {
  try {
    const d1 = getD1();
    const result = await d1
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all<{ name: string }>();

    const present = new Set((result.results || []).map((row) => row.name));
    const missing = REQUIRED_TABLES.filter((table) => !present.has(table));

    return Response.json(
      {
        ok: missing.length === 0,
        service: "gamefields-play",
        database: "d1",
        schemaReady: missing.length === 0,
        requiredTables: REQUIRED_TABLES.length,
        presentTables: REQUIRED_TABLES.length - missing.length,
        missingTables: missing,
        checkedAt: new Date().toISOString(),
      },
      {
        status: missing.length === 0 ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        service: "gamefields-play",
        database: "d1",
        schemaReady: false,
        error: error instanceof Error ? error.message : "DATABASE_UNAVAILABLE",
        checkedAt: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
