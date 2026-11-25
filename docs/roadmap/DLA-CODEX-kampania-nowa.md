# DLA CODEX — kreator kampanii BO jako osobna strona (2026-11-25)

Kampania do budżetu obywatelskiego wychodzi ze Studio na własną stronę z opiekunem. Bez migracji bazy, bez nowych sekretów, API bez zmian.

## Adresy
- `/kampania/nowa`: nowa strona aplikacji Studio, `noindex`.
- `gamefields.eu/studio/?kampania=nowa` przekierowuje na `/kampania/nowa` (`app/page.tsx`, obok istniejącego `?kampania=<id>`).
- Strona do wyszukiwarek to WordPress `/budzet-obywatelski/` (osobna instrukcja DLA-CHATGPT-budzet-obywatelski.txt). Link „Jak to działa?” w nagłówku kreatora prowadzi właśnie tam.

## Co robi strona
1. **Wybór projektu.**
   - Projekt ze Studio: przekazany przez localStorage `gf-campaign-project` (`lib/campaign-handoff.ts`, ten sam origin). Świeże przekazanie, młodsze niż 10 minut, otwiera od razu kreator.
   - Albo projekt z galerii Warsztatu (6 najpopularniejszych, `/api/workshop?page=1&sort=top`).
   - Albo link do Studio.
2. **Kreator.** Ten sam komponent `CampaignCreate` w trybie `page`. Podgląd strony pokazuje prawdziwy model 3D (`PannaStudioPreview`). „← Zmień projekt” wraca do wyboru.
3. **Opiekun kampanii:** Damian Gawrych, Grodzisk Mazowiecki. Link „Napisz do mnie” prowadzi do gamefields.eu/kontakt/. Dane są w stałej `GUARDIAN` w `app/kampania/nowa/page.tsx`.

## Studio
- Zakładka „Kampania BO” w bibliotece projektów znika. Stare linki `?tool=kampania` pokazują krótką kartę z przyciskiem do kreatora.
- W Podsumowaniu pojawia się blok „Boisko z budżetu obywatelskiego? Załóż kampanię ↗”, który otwiera kreator w nowej karcie z bieżącym projektem.
- Krok „Finansowanie” w „Twojej ścieżce” otwiera kreator.
- Podpowiedź tytułu w kreatorze: „Osiedle X” → „Boisko dla osiedla X”, „ul. X” → „Boisko przy ul. X”, szkoła/park/plac → „Nowe boisko: …”.

## Pliki
Nowe:
- `app/kampania/nowa/page.tsx`
- `app/kampania/nowa/layout.tsx`
- `app/kampania/nowa/nowa.css`
- `lib/campaign-handoff.ts`

Zmienione:
- `components/campaign-create.tsx` (props `page`, `hero`, `onBack`; podpowiedź tytułu)
- `components/project-library.tsx`
- `components/studio-workspace.tsx` (blok w Podsumowaniu, krok financing)
- `app/studio-workspace.css`
- `app/page.tsx` (przekierowanie `?kampania=nowa`)

## Sprawdzenie po wdrożeniu
1. W Studio otwórz Podsumowanie i kliknij „Załóż kampanię ↗”. Otworzy się nowa karta z kreatorem i podglądem 3D Twojego projektu.
2. Wejdź na `gamefields.eu/studio/?kampania=nowa` w oknie incognito. Zobaczysz stronę z opiekunem, „Otwórz Studio” i galerią Warsztatu. Kliknięcie projektu z galerii otwiera kreator.
3. Na telefonie (390 px) nie ma poziomego przewijania.
4. Kontrola: `pnpm build`, `npx tsc --noEmit`.
