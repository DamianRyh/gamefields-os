# Gamefields OS

Repozytorium rozwijanej platformy Gamefields: Studio/Builder, PLAY, Engineering oraz Court Objects. Publiczna strona `gamefields.eu` działa w WordPressie; aplikacja i jej baza są odrębnymi elementami systemu.

## Od czego zacząć

- [Aktualny stan i dostęp](docs/PROJECT_STATUS.md) — potwierdzone fakty i ograniczenia.
- [Mapa dokumentacji](docs/README.md) — instrukcje modułów i materiały historyczne.
- [Mapa danych](docs/DATA-MAP.md) — gdzie są projekty, konta, treści, media i kopie.
- [Utrzymanie i publikacja](docs/OPERATIONS.md) — zasady zmian, backupu i wdrożenia.
- [Kolejka prac](docs/BACKLOG.md) — priorytety z warunkami zakończenia.

## Moduły i kod

| Moduł | Kod | Wejście aplikacji |
| --- | --- | --- |
| Studio / Builder | `app/page.tsx`, `lib/project.ts`, `lib/pattern-library.ts` | `/`, `/play/builder` |
| PLAY | `app/play`, `app/api/play`, `db` | `/play` |
| Engineering / Modular | `app/engineering`, `app/api/engineering` | `/engineering` |
| Court Objects | `app/objects`, `components/court-objects` | `/objects` |
| WordPress | `integrations/wordpress` | wymaga instalacji integracji |

Trasa w kodzie nie oznacza, że moduł jest opublikowany na `gamefields.eu`. Experimentalne `/studio-v2` pozostaje osobnym wariantem. Dotychczasowe obszary produktu zachowujemy zgodnie z [zasadą ciągłości](docs/GAMEFIELDS-PRODUCT-CONTINUITY.md).

## Praca lokalna

Wymagania: Node >=22.13.0 i pnpm 11.25.0, zgodnie z `package.json` i CI.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Polecenia uruchamiaj z katalogu repozytorium. `scripts/run-framework.mjs` wybiera profil wykonania; `dev` uruchamia lokalny podgląd, a `start` wymaga wcześniejszego buildu.

```sh
pnpm exec tsc --noEmit
pnpm build
pnpm test:play
```

Pełny zestaw wymaganych kontroli zawiera [CI](.github/workflows/ci.yml), w tym testy mobilne i Court Objects. Testy przeglądarkowe wymagają Chromium. Wycenę zasila konfiguracja `QUOTE_*`, a trwałe konta i projekty — Cloudflare D1 z bindingiem `DB`; bez nich nie należy deklarować pełnej gotowości aplikacji.

## Granice gotowości

Engineering ma status **PRE-DESIGN**. Nie zastępuje zatwierdzonych obliczeń konstrukcyjnych ani dokumentacji wykonawczej. Dane produkcyjne, hasła i tokeny przechowuj poza repozytorium. Szczegóły zakresu: [Engineering](docs/gamefields-engineering.md), [Modular](docs/gamefields-modular-geometry-v10.md).
