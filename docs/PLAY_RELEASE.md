# Gamefields PLAY — release runbook

Ten dokument opisuje minimalny proces wypuszczenia Gamefields PLAY na środowisko publiczne.

## 1. Wymagania

- Node.js >= 22.13
- działający build aplikacji
- binding Cloudflare D1 pod nazwą `DB`
- HTTPS na środowisku produkcyjnym
- wszystkie migracje PLAY zastosowane w kolejności

## 2. Migracje D1

Stosuj migracje po kolei. Nie pomijaj wcześniejszych plików na nowej bazie:

1. `drizzle/0001_gamefields_play.sql`
2. `drizzle/0002_play_social_engine.sql`
3. `drizzle/0003_play_tournaments.sql`
4. `drizzle/0004_play_tournament_confirmation.sql`
5. `drizzle/0005_play_social_graph.sql`
6. `drizzle/0006_play_public_auth.sql`
7. `drizzle/0007_play_discovery.sql`

Na środowisku, które ma już PLAY v0.1–v0.6, przed discovery layer wymagana jest migracja `0007_play_discovery.sql`.

Nigdy nie uruchamiaj ponownie migracji `CREATE TABLE` w ciemno na istniejącej bazie. Najpierw sprawdź stan przez health endpoint.

## 3. Health check

Po deployu wywołaj:

`GET /api/play/health`

Poprawna odpowiedź ma mieć:

- HTTP 200
- `ok: true`
- `schemaReady: true`
- `missingTables: []`

HTTP 503 oznacza, że binding D1 jest niedostępny albo brakuje tabel.

## 4. Smoke test — konto i onboarding

1. Otwórz `/play/auth` w prywatnym oknie.
2. Utwórz konto testowe.
3. Potwierdź przekierowanie do onboardingu.
4. Wybierz sport, poziom i Home Court.
5. Potwierdź przejście do `/play`.
6. Otwórz `/play/account`.
7. Wyloguj się.
8. Zaloguj ponownie tym samym kontem.
9. Sprawdź powrót na stronę podaną w `returnTo`.

W produkcji cookie sesji powinno być `HttpOnly`, `Secure`, `SameSite=Lax`.

## 5. Smoke test — MAP / PLAY NOW

Na co najmniej dwóch kontach testowych:

1. otwórz `/play/map`,
2. ustaw `READY TO PLAY` na 60 minut,
3. potwierdź pojawienie się gracza w sekcji PLAY NOW,
4. potwierdź licznik `SZUKA GRY` na właściwym obiekcie,
5. wykonaj check-in drugim kontem i sprawdź licznik `GRA TERAZ`,
6. sprawdź filtry `GRAJĄ TERAZ`, `SZUKAJĄ GRY`, `OTWARTE GRY`,
7. opcjonalnie zezwól na lokalizację przeglądarki i sprawdź sortowanie najbliższych obiektów,
8. wyłącz READY i potwierdź zniknięcie statusu,
9. sprawdź automatyczne wygaśnięcie availability po zadanym czasie.

## 6. Smoke test — PLAY loop

Na dwóch kontach testowych:

1. wybierz sport,
2. ustaw Home Court,
3. wykonaj check-in,
4. utwórz grę,
5. dołącz drugim kontem,
6. wygeneruj zespoły,
7. wpisz wynik,
8. potwierdź wynik drugim kontem,
9. sprawdź zmianę ELO i Court Ranking,
10. sprawdź historię ELO na profilu.

## 7. Smoke test — Player Discovery

- wyszukiwanie po nicku / imieniu,
- filtr READY NOW,
- filtr GRA TERAZ,
- zakres ELO,
- sortowanie po ELO, READY, liczbie gier i win rate,
- przejście z profilu gracza do challenge.

## 8. Smoke test — social / competition

- Follow / Unfollow
- Challenge z profilu gracza
- Accept / Decline
- Challenge Room + wiadomość
- przejście accepted challenge → Game Room
- utworzenie turnieju
- JOIN
- START BRACKET
- submit result
- confirm result
- automatyczny awans zwycięzcy

## 9. Court → Builder

Na karcie boiska kliknij `REDESIGN IN BUILDER` i sprawdź:

- poprawny sport,
- kontekst `court_id`,
- nazwę projektu redesignu,
- otwarcie właściwego presetu Buildera.

## 10. Hosting publiczny

Preferowana architektura:

- `gamefields.eu/play` — jeśli aplikacja jest reverse-proxy / native pod tą samą domeną,
- albo `play.gamefields.eu` — dedykowany subdomain aplikacji.

Nie rekomendujemy docelowego publicznego auth wyłącznie w cross-site iframe z obcej domeny. Ograniczenia third-party cookies mogą powodować problemy z sesją użytkownika.

WordPress może linkować do PLAY lub osadzać część widoków informacyjnych, ale właściwa aplikacja z kontami powinna działać na domenie należącej do Gamefields.

## 11. Security checklist

- HTTPS aktywne
- `Secure` cookie w produkcji
- brak tokenów sesyjnych w logach
- w D1 przechowywany wyłącznie hash tokenu sesji
- hasła PBKDF2 + losowy salt
- brak haseł i tokenów w Analytics / error payloads
- lokalizacja użytkownika jest opcjonalna i używana w przeglądarce wyłącznie do sortowania odległości
- rate limiting na warstwie edge zalecany przed szerokim publicznym launch'em
- reset hasła / weryfikacja e-mail wymagane przed pełnym produkcyjnym rolloutem

## 12. Definition of ready for pilot

Pilot można uruchomić, gdy:

- CI jest zielone,
- `/api/play/health` jest zielone,
- rejestracja, onboarding i ponowne logowanie działają,
- MAP pokazuje poprawne współrzędne, live activity i READY TO PLAY,
- dwa niezależne konta potrafią rozegrać i potwierdzić mecz,
- ELO aktualizuje się dokładnie raz,
- Challenge działa end-to-end,
- turniej działa co najmniej dla drabinki 4-osobowej,
- Court → Builder zachowuje kontekst obiektu,
- mobile navigation działa na iOS/Android viewportach.
