# Dla Codexa: strony kampanii do budżetu obywatelskiego w Studio (Sites), 25.11.2026

Wymaga wcześniejszego wdrożenia Projektu miesiąca (`DLA-CODEX-projekt-miesiaca.md`: `lib/workshop-server.ts`,
`lib/workshop-contest.ts`, sekret `WORKSHOP_ADMIN_KEY`). Źródło: gałąź `claude/ecstatic-hamilton-dgjvt8`, `integrations/studio/canvas-editor/`.

## Pliki
Nowe: `drizzle/0015_bo_campaigns.sql` (+ wpis w `_journal.json`), `lib/campaign.ts`, `app/api/campaign/route.ts`,
`app/api/campaign/support/route.ts`, `app/api/campaign/admin/route.ts`, `app/kampania/page.tsx`, `app/kampania/layout.tsx`,
`app/kampania/kampania.css`, `components/campaign-create.tsx`, `app/campaign-create.css`.
Zmienione: `components/project-library.tsx` (zakładka „Kampania BO”; `?tool=kampania` otwiera ją od razu),
`app/page.tsx` (`?kampania=<id>` przekierowuje na `/kampania?id=<id>`), `components/share-media-panel.tsx`
(propsy `defaultCaption`, `heading`), `lib/workshop-contest.ts` (eksport `rude`), `app/workshop-admin/*` (lista kampanii).

## Kroki
1. Migracja 0015 na produkcyjnej D1 (nowe tabele `studio_campaigns`, `studio_campaign_support`; nic nie zmienia w istniejących).
2. Build i wdrożenie. Sprawdzić:
   - Studio → Pliki projektu → „Kampania BO”: formularz, „Utwórz stronę kampanii” nieaktywne bez zgody na publiczną stronę;
   - po utworzeniu link `https://www.gamefields.eu/studio/?kampania=<id>` (zadziała po zmianie na WordPressie, patrz DLA-CHATGPT-kampania-bo.txt);
     bezpośrednio: `/kampania?id=<id>`;
   - strona: licznik, „Popieram ten projekt” (+1, drugi raz z tej samej sieci nie zwiększa, można cofnąć), oficjalne głosowanie,
     pakiet do udostępnienia (grafika/film z podpisem „Popieram!”), karta techniczna z cenami i „Pobierz kartę projektu (PDF)”;
   - `/workshop-admin`: sekcja „Kampanie do budżetu obywatelskiego”, kampanie z prośbą o pomoc na zielono z e-mailem;
   - strony kampanii mają `noindex`.
3. Usunąć testowe kampanie po teście (panel organizatora na stronie: „Wycofaj stronę”).

## Zasady
- Publiczny zakres projektu jak w Warsztacie: układ, wzór, kolory, bez prywatnej nazwy, napisów i logo.
- Teksty: bez linków, adresów e-mail i wulgaryzmów (`cleanCampaign`); link do projektu w budżecie tylko https, z `rel="nofollow ugc"`.
- E-mail zapisujemy wyłącznie, gdy organizator zaznaczył prośbę o pomoc we wniosku; widzi go tylko panel właściciela.
- „Popieram”: jedno na kampanię z jednej sieci (skrót IP), maks. 60 na godzinę; strona mówi wprost, że to nie głos w budżecie.
- Maks. 3 nowe strony z jednej sieci w 10 minut.
