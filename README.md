# Gamefields Platform

Gamefields to połączony ekosystem dwóch głównych warstw:

- **Gamefields Studio / Builder** — projektowanie i wycena koncepcji boisk oraz przestrzeni sportowych.
- **Gamefields PLAY** — społecznościowa aplikacja sportowa: boiska, gry, zawodnicy, rankingi, challenge i turnieje.

Aplikacja jest oparta na React 19, Next/Vinext, Drizzle ORM i Cloudflare D1.

## Gamefields PLAY

Aktualny rdzeń PLAY obejmuje:

- publiczne konto Gamefields: rejestracja, logowanie i wylogowanie,
- profile zawodników,
- osobne ELO dla dyscyplin,
- poziomy i tiery graczy,
- Football i Basketball jako sporty startowe,
- mapę / bazę boisk,
- Home Court i Court Ranking,
- check-in na obiekcie,
- tworzenie gier i dołączanie do nich,
- Game Room,
- generowanie zespołów na podstawie ELO,
- submit + confirm wyniku,
- zabezpieczenie przed podwójnym naliczeniem ELO,
- Gamefields Coins,
- Player Discovery,
- Follow / Community / Notifications,
- Challenges i Challenge Room,
- wiadomości w ramach challenge,
- Tournament Engine i drabinki,
- submit / confirm wyniku turniejowego i automatyczny awans,
- zgłoszenia problemów z boiskiem,
- przejście Court → Gamefields Builder z kontekstem obiektu,
- mobilny shell i manifest PWA.

Główne ścieżki:

- `/play`
- `/play/auth`
- `/play/account`
- `/play/courts`
- `/play/games`
- `/play/players`
- `/play/tournaments`
- `/play/community`

Health check bazy:

`GET /api/play/health`

Pełny runbook wydaniowy znajduje się w `docs/PLAY_RELEASE.md`.

## Gamefields Account

Publiczny auth PLAY wykorzystuje:

- sesję 30-dniową,
- cookie HttpOnly,
- `SameSite=Lax`,
- `Secure` w produkcji,
- hash tokenu sesyjnego SHA-256 zapisywany w D1,
- PBKDF2 SHA-256 + losowy salt dla haseł,
- czasową blokadę po serii błędnych logowań.

Hosted auth środowiska pozostaje kompatybilnym, równoległym providerem.

## Baza danych

PLAY używa trwałej bazy Cloudflare D1 przez binding `DB`.

Migracje znajdują się w `drizzle/` i muszą być wykonywane kolejno:

1. `0001_gamefields_play.sql`
2. `0002_play_social_engine.sql`
3. `0003_play_tournaments.sql`
4. `0004_play_tournament_confirmation.sql`
5. `0005_play_social_graph.sql`
6. `0006_play_public_auth.sql`

Nie należy ponownie wykonywać starych migracji na istniejącej bazie bez sprawdzenia stanu schematu.

## Gamefields Studio / Builder

Studio obsługuje m.in.:

- wymiary, nawierzchnie, kolory i oznakowanie sportowe,
- Pattern Engine: 25 rodzin × 12 kompozycji = 300 bazowych wzorów,
- 18 palet kolorystycznych,
- parametryczne SVG,
- import logo PNG/SVG i tekst,
- bibliotekę sponsorów i wyposażenia,
- przesuwanie, obrót, skalowanie i przezroczystość,
- grafiki na bandach,
- undo/redo,
- warianty A/B/C,
- scenę dzienną, nocną i eventową,
- orientacyjny budżet,
- walidowany import i eksport JSON,
- gotowe projekty z WordPressa,
- wejście do redesignu bezpośrednio z profilu boiska w PLAY.

### Pattern Engine

Biblioteka wzorów znajduje się w `lib/pattern-library.ts`.

Kategorie:

- Organic
- Geometric
- Street
- Premium
- Brand
- Play

Kod wzoru ma format `GF-<RODZINA>-<WARIANT>`.

## Ważne ograniczenie Studio

**PLAY posiada już trwałe konta i bazę danych.**

Natomiast projekty samego Buildera nadal w dużej części działają w stanie sesji przeglądarki. Do czasu przeniesienia projektów Buildera do trwałej warstwy projektowej należy korzystać z eksportu JSON przy ważnych projektach.

Budżet Buildera ma charakter orientacyjny i nie jest ofertą wykonawczą.

## Uruchomienie lokalne

```bash
pnpm install
pnpm dev
```

Walidacja:

```bash
pnpm exec tsc --noEmit
pnpm build
```

Generowanie zmian Drizzle:

```bash
pnpm db:generate
```

## Hosting

Konfiguracja hostingu używa bindingu D1 `DB` z `.openai/hosting.json`.

Aktualne integracje historyczne:

- Studio: `https://gamefields-studio.ryhfs90.chatgpt.site`
- WordPress: `https://www.gamefields.eu/konfigurator-boisk/`

Dla publicznego Gamefields PLAY preferowane jest uruchomienie aplikacji pod domeną należącą do Gamefields, np. `gamefields.eu/play` albo `play.gamefields.eu`, zamiast polegania na cross-site iframe dla sesji użytkownika.

## Gotowe projekty — WordPress

Zarządzanie wzorami odbywa się przez wpisy WordPress w kategorii `gamefields-wzory` (ID 629).

Wpis może zawierać:

- nazwę,
- zajawkę,
- obrazek wyróżniający,
- plik eksportu projektu.

Katalog aplikacji czyta wyłącznie opublikowane wpisy z tej kategorii.

API katalogu:

- `/api/templates`
- `/api/templates?id=<post_id>`

Pliki projektu są walidowane przed otwarciem, a otwarcie gotowego wzoru tworzy jego kopię.

## Release

Przed pilotem PLAY wymagane są:

- zielone CI,
- poprawne migracje D1,
- zielony `/api/play/health`,
- test dwóch niezależnych kont,
- potwierdzenie pojedynczej aktualizacji ELO,
- działający Challenge flow,
- działający turniej,
- działający Court → Builder,
- test mobile.

Szczegóły: `docs/PLAY_RELEASE.md`.
