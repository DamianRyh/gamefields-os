# DLA CODEX — „Twoja ścieżka” w Studio (2026-11-25)

Wdrożenie tylko w Studio (`integrations/studio/canvas-editor`). Bez migracji bazy, bez nowych sekretów, bez zmian w WordPressie.

## Co to jest
- Pigułka „Ścieżka 3/8” albo karta „Twoja ścieżka” w lewym dolnym rogu sceny. 8 kroków: model, nawierzchnia, kolory, zapis projektu, Zapisz dla innych (Warsztat/konkurs), udostępnienie grafiki lub filmu, karta projektu PDF, finansowanie (Kampania BO). Kliknięcie kroku otwiera właściwe narzędzie.
- Przy pierwszej wizycie karta jest rozwinięta na komputerze i zwinięta na telefonie. Stan jest tylko w localStorage (`gf-journey-v1`), bez danych osobowych.
- Podpowiedzi przewodników (zawsze jedna naraz, każda tylko raz, najwyżej co 90 s, nie w trakcie przeciągania i pisania, znika po 15 s, Esc zamyka, wyciszenie po 2 odrzuceniach z rzędu):
  - Ola: po zmianie kolorów „Zapisz projekt”; po 4 min bez zapisu „projekt jest tylko w tej przeglądarce”.
  - Kuba: po wyborze nawierzchni, gdy trwa Projekt miesiąca, „Zgłoś projekt”.
  - Alex: po publikacji w Warsztacie „Udostępnij”.
  - Marek: w Podsumowaniu „Pobierz kartę PDF” i „Zobacz finansowanie”.

## Pliki
Nowe: `lib/journey.ts`, `components/journey-guide.tsx`, `app/journey-guide.css`.
Zmienione:
- `components/studio-workspace.tsx`: render `<JourneyGuide>`, `openJourneyStep`, zdarzenie `gf-journey-summary` w Podsumowaniu, `journey('save')` przy „Pobierz projekt”.
- `components/project-library.tsx`: zakładkę ustawia `window.gfLibraryTab` albo zdarzenie `gf-library-tab`.
- `components/workshop-save.tsx` (publish), `project-card.tsx` (card), `campaign-create.tsx` (financing), `project-link.tsx` (save): wywołania `journey(...)`.

## Analityka (dataLayer)
`{event:'gf_journey', journey_action, journey_id}`. Wartości `journey_action`: step_done, nudge_shown, nudge_click, nudge_dismiss, nudges_muted, path_open, path_close, path_click.

## Sprawdzenie po wdrożeniu
1. W oknie incognito otwórz /studio/: karta „Twoja ścieżka 0 z 8”.
2. Zmień kolor panelu, a po około 2 s pojawi się podpowiedź Oli. „Zapisz projekt” pobiera plik JSON i licznik pokazuje 3 z 8.
3. Na telefonie (390 px) widać tylko pigułkę i nie ma poziomego przewijania.
4. Kontrola: `pnpm build`, `npx tsc --noEmit`.
