# Gamefields PLAY — Automatic Seasons

Seasons are derived from confirmed games. They are not organizer-managed competitions and do not duplicate game records.

## Core model

A season is a time window applied to the existing automatic league standings:

- Court Season — one court + one sport
- District Season — district + sport
- City Season — city + sport

Only games with `status='completed'` and `result_confirmed_at IS NOT NULL` count.

## Default cadence

- monthly season: calendar month in the user's local context
- current season is active automatically
- previous season is immutable because it is calculated from historical confirmed games

## Table rules

- win: 3 points
- draw: 1 point
- loss: 0 points
- tiebreaks: points → wins → goal difference → ELO delta → nickname

## Titles

- Court Champion — #1 in a completed Court Season
- District Champion — #1 in a completed District Season
- City Champion — #1 in a completed City Season

Titles are descriptive outcomes of completed seasons. No manual award flow is needed for MVP.

## Product goal

The game loop becomes:

`find game → play → confirm score → ELO → league table → seasonal title → next season`

This creates recurring competition without requiring Gamefields staff to organize leagues.