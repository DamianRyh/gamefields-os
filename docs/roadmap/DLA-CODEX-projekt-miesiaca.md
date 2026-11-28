# Dla Codexa: Projekt miesiąca w Studio (Sites), 25.11.2026

Wdrożyć PRZED zmianą sekcji Warsztat na stronie głównej (strona korzysta z nowego API).
Źródło: gałąź `claude/ecstatic-hamilton-dgjvt8`, katalog `integrations/studio/canvas-editor/`.

## Pliki
Nowe: `drizzle/0014_workshop_contest.sql` (+ wpis w `drizzle/meta/_journal.json`), `lib/workshop-contest.ts`,
`lib/workshop-server.ts`, `app/api/workshop/vote/route.ts`, `app/api/workshop/admin/route.ts`,
`app/workshop-admin/page.tsx`, `app/workshop-admin/layout.tsx`, `app/workshop-admin/workshop-admin.css`, `app/workshop-contest.css`.
Zmienione: `app/api/workshop/route.tsx`, `components/workshop-save.tsx`, `app/page.tsx` (jedna linia: `?remix=1` i podpis autora),
`components/share-media-panel.tsx` (domyślny podpis „@pseudonim”), `cloudflare-env.d.ts`, `.gitignore` (`.dev.vars`).

## Kroki
1. Migracja 0014 na produkcyjnej bazie D1 (tylko ADD COLUMN, nowe indeksy i tabela `studio_workshop_votes`; istniejące dane zostają).
2. Sekret Sites `WORKSHOP_ADMIN_KEY`: losowy ciąg min. 24 znaki, przekazać właścicielowi osobnym kanałem. Bez sekretu panel odpowiada 503.
3. Build, testy jak zwykle (TSC, build). `test:studio` nie przechodzi też bez tych zmian (surface-pro: 28 vs 36 rodzin).
4. Sprawdzić na wdrożeniu:
   - `GET /api/workshop?contest=current&sort=top` zwraca `contest` (Boisko pod blokiem, open: true) i `items`;
   - w Studio „Zapisz dla innych” otwiera panel: temat, pseudonim, „Zgłaszam projekt…”, zgoda; bez zgody przycisk „Opublikuj i zgłoś” jest nieaktywny;
   - `POST /api/workshop/vote` (body text/plain `{"id":"…"}`, Origin https://www.gamefields.eu) zwraca `likes`; drugi raz z tej samej sieci nie podbija licznika; `DELETE` cofa;
   - `/?workshop=<id>` podbija `remixes` (raz na sieć);
   - `/workshop-admin` z kluczem: lista, Finalista/Zwycięzca, Ukryj; ukryty projekt znika z `/api/workshop`.
5. Nie publikować żadnego testowego projektu na produkcji albo wycofać go po teście (przycisk „Wycofaj”).

## Zasady
- Bez kont i bez e-maili; pseudonim 2–24 znaki, bez linków i wulgaryzmów (`cleanNickname`).
- Udział w konkursie wymaga zgody na publikację w social mediach (sprawdzane też na serwerze).
- Polubienie: jedno na projekt z jednej sieci (skrót IP, adres nie jest zapisywany), maks. 60 na godzinę z jednej sieci.
- Kolejne tematy: tablica `THEMES` w `lib/workshop-contest.ts`.
