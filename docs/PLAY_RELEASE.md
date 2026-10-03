# Gamefields PLAY — release runbook

Ten dokument opisuje minimalny proces wypuszczenia Gamefields PLAY na środowisko publiczne.

## 1. Wymagania

- Node.js >= 22.13
- działający build aplikacji
- binding Cloudflare D1 pod nazwą `DB`
- HTTPS na środowisku produkcyjnym
- wszystkie migracje PLAY / Builder zastosowane w kolejności
- opcjonalnie `PLAY_ADMIN_EMAILS` jako lista e-maili moderatorów oddzielonych przecinkami

## 2. Migracje D1

Stosuj migracje po kolei. Nie pomijaj wcześniejszych plików na nowej bazie:

1. `drizzle/0001_gamefields_play.sql`
2. `drizzle/0002_play_social_engine.sql`
3. `drizzle/0003_play_tournaments.sql`
4. `drizzle/0004_play_tournament_confirmation.sql`
5. `drizzle/0005_play_social_graph.sql`
6. `drizzle/0006_play_public_auth.sql`
7. `drizzle/0007_play_discovery.sql`
8. `drizzle/0008_play_court_network.sql`
9. `drizzle/0009_builder_persistence.sql and 0010_play_pilot.sql`

Migracja `0009_builder_persistence.sql and 0010_play_pilot.sql` jest wymagana przed użyciem trwałych projektów konta i publikowaniem redesignów społeczności.

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

## 6. Smoke test — Court Network

1. Wejdź na `/play/courts/add`.
2. Użyj lokalizacji telefonu lub wpisz współrzędne ręcznie.
3. Dodaj nazwę, sport i parametry obiektu.
4. Wyślij zgłoszenie i potwierdź status `PENDING` w sekcji „Twoje zgłoszenia”.
5. Na środowisku moderatorskim ustaw `PLAY_ADMIN_EMAILS`.
6. Zaloguj się kontem moderatora i otwórz `/play/admin/courts`.
7. Sprawdź lokalizację zgłoszenia i wybierz `OPUBLIKUJ NA MAPIE`.
8. Potwierdź zmianę statusu na `APPROVED` i powstanie `publishedCourtId`.
9. Otwórz `/play/map` i sprawdź nowy obiekt w poprawnej lokalizacji.
10. Osobno sprawdź ścieżkę `ODRZUĆ` — odrzucone zgłoszenie nie może trafić do `courts`.

## 7. Smoke test — PLAY loop

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

## 8. Smoke test — Court / Infrastructure

1. Otwórz kartę court.
2. Sprawdź osobno `PLAYERS HERE NOW` i `READY TO PLAY`.
3. Utwórz grę przez `PLAY HERE`.
4. Wróć do court i opublikuj `REPORT PROBLEM`.
5. Drugim kontem kliknij `SUPPORT`.
6. Potwierdź, że jedno konto nie może naliczyć poparcia drugi raz.
7. Otwórz `REDESIGN IN BUILDER` i sprawdź przekazanie court id, nazwy, sportu i współrzędnych.

## 9. Smoke test — Builder persistence

1. Otwórz `/projects` jako zalogowany użytkownik.
2. Zaimportuj poprawny eksport JSON ze Studio i sprawdź trwały zapis w `builder_projects`.
3. Odśwież stronę i potwierdź, że projekt nadal istnieje.
4. Otwórz projekt przez `OPEN / EDIT` po podłączeniu natywnego load flow w Studio.
5. Dla projektu przypisanego do court wybierz `PUBLISH TO COMMUNITY`.
6. Potwierdź `visibility=public`, `status=published` i `published_at`.
7. Drugim kontem dodaj support i sprawdź pojedyncze naliczenie per konto.
8. Sprawdź `UNPUBLISH` oraz `DELETE`.
9. Sprawdź limit rozmiaru projektu i odrzucenie niepoprawnego `projectSchema`.

## 10. Smoke test — Player Discovery

- wyszukiwanie po nicku / imieniu,
- filtr READY NOW,
- filtr GRA TERAZ,
- zakres ELO,
- sortowanie po ELO, READY, liczbie gier i win rate,
- przejście z profilu gracza do challenge.

## 11. Smoke test — social / competition

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

## 12. Hosting publiczny

Preferowana architektura:

- `gamefields.eu/play` — jeśli aplikacja jest reverse-proxy / native pod tą samą domeną,
- albo `play.gamefields.eu` — dedykowany subdomain aplikacji.

Nie rekomendujemy docelowego publicznego auth wyłącznie w cross-site iframe z obcej domeny. Ograniczenia third-party cookies mogą powodować problemy z sesją użytkownika.

WordPress może linkować do PLAY lub osadzać część widoków informacyjnych, ale właściwa aplikacja z kontami powinna działać na domenie należącej do Gamefields.

## 13. Security checklist

- HTTPS aktywne
- `Secure` cookie w produkcji
- brak tokenów sesyjnych w logach
- w D1 przechowywany wyłącznie hash tokenu sesji
- hasła PBKDF2 + losowy salt
- brak haseł i tokenów w Analytics / error payloads
- lokalizacja użytkownika jest opcjonalna i używana w przeglądarce wyłącznie do sortowania lub dobrowolnego zgłoszenia obiektu
- Court Network publikuje obiekty dopiero po moderacji
- `PLAY_ADMIN_EMAILS` nie powinno być ujawniane w kliencie
- projekty Buildera są walidowane przez `projectSchema` przed zapisem
- publiczny redesign wymaga powiązania z istniejącym court
- support projektu i improvement request ma unikalność per konto
- rate limiting na warstwie edge zalecany przed szerokim publicznym launch'em
- reset hasła / weryfikacja e-mail wymagane przed pełnym produkcyjnym rolloutem

## 14. Definition of ready for pilot

Pilot można uruchomić, gdy:

- CI jest zielone,
- `/api/play/health` jest zielone po migracjach 0001–0009,
- rejestracja, onboarding i ponowne logowanie działają,
- MAP pokazuje poprawne współrzędne, live activity i READY TO PLAY,
- użytkownik może zgłosić nowe miejsce, a moderator zatwierdzić je na mapę,
- dwa niezależne konta potrafią rozegrać i potwierdzić mecz,
- ELO aktualizuje się dokładnie raz,
- Challenge działa end-to-end,
- turniej działa co najmniej dla drabinki 4-osobowej,
- Court → Problem → Support działa end-to-end,
- Court → Builder zachowuje kontekst obiektu,
- projekt Buildera może zostać zapisany trwale na koncie,
- mobile navigation działa na iOS/Android viewportach.

Pilot validation: CI runs tests/play-smoke.mjs against the production Worker and tests/play-mobile.mjs at 375×812, 390×844 and 430×932. The WordPress gateway and installation instructions are in integrations/wordpress. The hosting file manager/SFTP is required to install the gateway; the connected WordPress API cannot edit files.
