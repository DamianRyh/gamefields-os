ALTER TABLE play_tournament_matches ADD COLUMN submitted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE play_tournament_matches ADD COLUMN result_confirmed_at INTEGER;
