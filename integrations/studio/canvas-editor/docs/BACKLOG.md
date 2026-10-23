# Gamefields — backlog

Zakres od 2026-10-08: boiska, wzornictwo, nawierzchnie i mapa lokalizacji. PLAY nie jest rozwijany.

## P0
- Lekka wersja i kompaktowe karty opublikowane (Sites v41). Wspólna nawigacja Studio/Radar i aktualizacja menu WordPress — wdrożenie 2026-10-08.
- Test na fizycznym telefonie: materiały, trzy kamery, wzory, eksport/import i Radar.

## P1
- Podłączyć w Studio Radar zatwierdzone, zgodne z lokalizacjami zdjęcia przed/po zamiast ilustracji pilota.
- Budżet transferu obrazów: optymalizować na kopiach, zachowując oryginały.
- Potwierdzić linie, skalę i faktury ze specyfikacją wykonawczą / producenta.
- Kolejne sportowe sceny dopiero po potwierdzeniu jakości 3×3.
- Kraków pozostaje ukryty do zgody właściciela.

Nie usuwać wzorów, palet, gotowych grafik, danych klientów ani zastosowanych migracji. Starsze odrębne checkouts wymagają wskazania zakresu przed kasowaniem; nie przepisywać historii Git.

Panna Football: future dedicated arena geometry / photo calibration can follow the initial 10 × 6 m rectangular profile; no official regulation dimensions are claimed by this starter preset.

Panna Ø7m: round plan and 12 greenscreen scenes completed. Future photo work: surveyed perspective calibration, dynamic optional equipment/band branding in photographic views. Existing plan tools remain functional.

Homepage integration: `?home=1&sport=Piłka%20nożna%201×1` opens the Panna entry block with live round preview and design directions. Embedded blocks hide the sport selector; the primary CTA transfers sport and design into the full builder. WordPress homepage adds Panna immediately after the existing 3×3 embed.

2026-10-10: Homepage arrangement — WordPress 3462 opens with the live Street Football builder, concise navigation, compact before/after and author sections. Panna, process and location submission remain available in native disclosure sections. Repeated introductions are hidden. Embedded Street Football headline shortened to prevent an isolated numeral; no design, palette, project or scene behavior changed. WordPress source verified against the proposed targeted patches; live desktop iframe no longer scrolls inside the page. Mobile physical-device QA remains outstanding.
Validation for 2026-10-10 copy-only Studio change: TypeScript, Studio scope test and production build passed. Mobile regression was attempted but could not run because the Chromium headless executable is absent; no browser was installed. Live desktop checks cover disclosure sections and before/after slider.


2026-10-10: Blender construction catalogue prepared: W-1 (5.09 m external, 1 m height), O-1 (about 6 m external), P-1 (7.139 × 5.573 m). Separate products and arenaModel JSON identity; construction colors first, optional surface, three cameras. Legacy Panna removed from active selection, historical assets preserved. Clean conceptual backgrounds replace photos with baked-in old courts. Local catalogue QA passed 36 location/camera combinations, colors, text, JSON, mobile. Production checks and publication recorded below when complete.

Production validation: TypeScript, Sites Vinext build, Studio/Radar scope, round geometry, and 144 Blender + 48 Street Football combinations passed on 375/390/430/1440 px; JSON export/import and Radar navigation passed.

- W-1: use the original GLB as the single model source in the editor; implemented 2026-10-10.

W-1 withdrawn from the public offer and new-project selection on 2026-10-10. O-1 and P-1 remain available; saved model files preserved.


2026-10-10: P-1 now uses the optimized Blender slab (7.139 × 5.573 × 0.10 m; 220 triangles) instead of the flat floor. Four finishes use physically scaled colour, normal and roughness maps with mipmaps and anisotropic filtering. Artwork and chosen colours remain separate; turf preserves line and logo colours. Existing project JSON remains compatible. TypeScript, production build, Studio/Radar scope and watertight-slab tests passed. Browser regression results are recorded below.

Browser regression passed: 96 O-1/P-1 and 48 Street Football location/camera combinations at 375/390/430/1440 px; 16 P-1 material switches, non-empty WebGL rendering, no GL errors or overflow, preserved JSON colours/surface identity, and Radar navigation.


2026-10-10: Arena aerial preview now uses yaw 0 and pitch π/2, so the top-down view aligns the court edges with the screen. Perspective and ground cameras keep their existing orientations. TypeScript, Studio scope and production build passed.
Camera regression passed: 96 arena and 48 Street Football location/camera combinations on 375/390/430/1440 px, materials, JSON and Radar; no overflow or runtime errors.


## Studio: dark workspace (2026-10-12, local work)
The approved dark/mint editor is connected to the retained court engine, including cameras, the 300-pattern library, material controls, equipment/branding editing, validated JSON import/export and browser-local draft saving. Source checks and TypeScript passed; browser captures are under design/studio-ux in the parent workspace. The required scene/material/JSON/Radar regression suite passed on 375/390/430/1440 px, including browser-draft restoration and same-model preservation. The approved dark interface is prepared for deployment to Studio and WordPress page 3644. See design-qa.md.


## Court Culture — 12.10.2026
Nowa identyfikacja Studio: fiolet, maślany żółty, bordo. Zachowano wszystkie wzory, sporty i dotychczasowe palety; dodano Court Culture (19 palet). Builder osadzany na głównej. Podsumowanie przekazuje parametry do formularza WordPress przez sprawdzany origin i źródło okna; logo pozostaje w eksporcie lokalnym. Sprawdzono: tsc --noEmit, test:studio i build. Browser QA oraz test:mobile pominięto — w tej sesji brak wymaganego control-browser dla managed preview. Publikacja jest wykonywana w tej sesji.


## Panna Circle Cage 2.0 i Street Football 15 × 10 — 2026-10-19

Dodano do wspólnego wyboru produktów Studio modele circle-cage-2 i street15. Circle Cage opiera się na rysunku Boisko 03-H i detalach paneli: Ø 6 m, wysokość 1,8 m, 12 paneli zwykłych, 2 bramkowe i 2 z wycięciem. Oba modele korzystają z nawierzchni 20 cm oraz wspólnych kolorów, wzorów, kamer i projektu JSON. Migracja historycznych projektów Ø 6 m nie nadpisuje nowego modelu Circle Cage. Bez nowych tras produktu. Sprawdzenie: TypeScript, Studio scope, build i tests/new-blender-arenas.mjs (390/1440 px, kolory, kamery, WebGL, JSON). Pełna regresja mobilna w tests/studio-mobile-goals.mjs.


## Panna Circle Cage 1.0 — 2026-10-19

Dodano jednopoziomową arenę Ø 6 m / 0,9 m według Boisko 03 i wspólnych detali: 5 zwykłych paneli, 2 bramki, 1 wejście. Osobna nawierzchnia 20 cm, edytowalne kolory, bez domyślnych napisów i linii. Model w istniejącym Studio (`?arena=circle-cage-1`), bez nowych tras; import JSON zachowuje średnicę 6 m. Źródła, generatory i audyt: `models/panna-circle-cage-1/`.

Sprawdzone: TypeScript, test:studio (300 wzorów, 19 palet, Radar), build oraz tests/new-blender-arenas.mjs dla trzech modeli na 390/1440 px: kolory, materiały, linie, kamery, widoczna geometria WebGL i zachowanie modelu w JSON. Model 1.0: 19 siatek, 48060 trójkątów; wysokość geometrii 0,9 m i osobne podłoże 0,2 m.


## Street Field — 2026-10-20

Dodano produkt street-field do wspólnego Studio. Pole 6,214 × 4,648 m, wysokość 1,091 m, dwie bramki i obniżone wejście; szerokości paneli dopasowane zgodnie z decyzją użytkownika do wcześniejszego zwymiarowanego złożenia. Osobna nawierzchnia 20 cm, bez domyślnych napisów i linii. Generatory, natywny Blender/GLB, źródła i audyt w models/street-field. Bez nowych tras.


Street Field — korekta podłoża 2026-10-20: nawierzchnia 7,30 × 5,30 m, grubość 20 cm. Obejmuje wszystkie podstawy słupów i oba kosze bramek z zapasem. Pole gry i geometria konstrukcji pozostają 6,214 × 4,648 m. Sprawdzono zawieranie wszystkich wierzchołków konstrukcji w obrysie podłoża.


## Octagon — 2026-10-20

Produkt octagon w istniejącym Studio: obrys wewnętrzny 4,962 × 4,962 m, wysokość 1,218 m, 4 panele zwykłe, 2 bramkowe, 2 wejściowe i 8 słupów. Rodzina profili Street Field dopasowana do Boisko 01. Ośmiokątne podłoże 6 m / 20 cm obejmuje całość. Osobny model i nawierzchnia, kolory, wzory, linie i projekt JSON. Generatory i audyt w models/octagon. Bez nowych tras.

## Studio canvas — 20.10.2026
- Wariant 2 wdrożony w kodzie istniejącego edytora: lewy pasek i dolny panel, bez nowych tras.
- Dalsze dopracowanie: światło i cienie kontaktowe istniejącego renderera 3D; test na fizycznym telefonie. Nie zastępować modeli obrazami i nie zmieniać geometrii w ramach poprawek UI.


## Nazwy zatwierdzone — 20.10.2026

Panna Ring (GF-CT-001), Panna Play (GF-CT-002), Panna Court (GF-CT-003), Street Arena 15 (GF-CT-004), Panna Cage 90 (GF-CT-005), Panna Cage 180 (GF-CT-006), Panna Grid (GF-CT-007), Panna Octa (GF-CT-008). Nazwy centralnie w public/catalog/product-names.json. Kody, arenaModel, adresy i geometria bez zmian. Historyczne wpisy i rysunki mogą zawierać dawne nazwy jako aliasy. Automatyczne tytuły dawnych projektów aktualizowane podczas walidacji; własne nazwy użytkownika zachowane.


## Studio: użyteczność — 20.10.2026

Audyt czterech etapów i publiczne źródła Baymard/Tylko: `docs/STUDIO_UX_AUDIT.md`. Doprecyzowano lokalny szkic i pobranie JSON; przywrócono mobilne Ponów, cele dotykowe 44 px i widoczny zapis. Karty modeli pokazują kształt i wymiary oraz wyjaśniają reset ustawień. Nazwy własne projektów pozostają zachowane. Podsumowanie obejmuje kod modelu, kolory, wykończenie, napisy, logo, linie i wyposażenie; grupy można bezpośrednio edytować. Dialogi izolują tło i przywracają fokus. Zaznaczenie kompozycji odpowiada wariantowi, palecie i faktycznym kolorom.

Testy domenowe: `tests/studio-ux.mjs`; regresja interfejsu: `tests/studio-usability.mjs` (375/390/430/1440 px, Undo/Redo, JSON, fokus). Zachowano 300 wzorów, 19 palet, modele 3D, format projektów i Radar. To adaptacja publicznych badań, bez deklaracji certyfikacji Baymard lub pełnej zgodności WCAG.

Weryfikacja końcowa: TypeScript i build PASS; studio-scope (300/19) PASS; studio-ux i product-names PASS; studio-usability PASS (375/390/430/1440); studio-mobile-goals PASS (96 konfiguracji O-1/P-1, 48 Street, 16 zmian materiału, draft JSON i Radar); new-blender-arenas PASS (5 modeli, 390/1440, kamery i WebGL). Nie wysyłano zapytań ofertowych.


## Nawierzchnia i czytelność — 21.10.2026

Materiał, wzór, palety, kolory, linie i ich kolor oraz wariant kompozycji, skala, intensywność, cień, obrót, logo i tekst są dostępne w Nawierzchni. Grafika służy do edycji dodanych logo i napisów. Podsumowanie kieruje do właściwej sekcji. Domyślne wartości suwaków odpowiadają rendererowi.

Nowy `app/studio-readability.css` zwiększa tekst kontrolek i formularzy, zapewnia 44 px dla wariantów i suwaków oraz oddziela podgląd od przewijanego panelu. Krótkie okna przechodzą w pionowy układ strony. Bez zmian schematu JSON, geometrii i katalogu 300 wzorów / 19 palet.

Weryfikacja lokalna: TypeScript, test:studio i build PASS. Pełne test:mobile PASS (96 konfiguracji Panna Play/Court, 48 Street, 16 materiałów, JSON i Radar). Nowy test Surface PASS w siedmiu rozmiarach (375/390/430/810/1024/1440 oraz 844×390): suwaki, wariant, logo SVG, round-trip JSON i trzy kamery. Dowody: `outputs/studio-surface-readability/`. Po końcowej korekcie szerokości paska 810 px i tłumaczeniu Radaru ponowna regresja Surface również PASS.

Radar ma polskie nagłówki, filtry, linki, opisy sekcji i stopkę. Wewnętrzne identyfikatory sportów i filtrowanie zachowane. `tests/radar-polish-smoke.mjs` PASS przy 390/810/1440 px (filtr → koncepcja → powrót, brak przepełnienia i błędów runtime). Zmiany nie są jeszcze opublikowane.


Radar — kontrola czytelności 21.10.2026: filtry oraz linki koncepcji i powrotu mają tekst co najmniej 14 px i wysokość co najmniej 44 px. Zachowano przewijanie filtrów. TypeScript i końcowy build PASS; radar-polish-smoke PASS z rzeczywistym pomiarem fontów i wysokości przy 390/810/1440 px oraz filtrowaniem, przejściem do detalu i powrotem. Poprawka CSS dotyczy wyłącznie .radar-page; gotowa do publikacji wersji 70, jeszcze nieopublikowana.


## Reflow i klawiatura — 21.10.2026

Test `tests/reflow-keyboard.mjs`: 720×500 oraz 320×500 CSS px jako przybliżenie przestrzeni roboczej po powiększeniu 200% z 1440×1000 i 640×1000. Nie jest to natywny zoom przeglądarki ani test na fizycznym telefonie. Studio, wybór wzoru, Radar i szczegóły nie powodują poziomego przewijania strony. Klawiatura uruchamia filtry i linki Radaru; Tab/Shift+Tab pozostają w dialogach, Escape zamyka je i przywraca fokus do przycisku otwierającego.

Zrzut 320 px ujawnił zbyt niski nagłówek po zawinięciu akcji. Poprawiono układ tylko do 360 px; asercja sprawdza rzeczywiste zawarcie wszystkich kontrolek w nagłówku. TypeScript, build, test:studio i reflow-keyboard PASS. Dowody i ograniczenia pomiaru: `outputs/reflow-keyboard/results.json`, `studio-320.png`, `studio-720.png`, `radar-320.png`, `radar-720.png`. Bez deklaracji pełnej zgodności WCAG i bez badań z klientami.


## Live estimate rebuild — 2026-10-21

Owner requested re-enabling pricing. Debounced quote requests and itemised summary are restored with explicit rates, real Blender floor quantities, partial/unknown states, retry, stale-response protection and inquiry estimate snapshot. See [pricing contract](PRICING.md). Commercial runtime rates were absent; numeric production estimates require the owner rate sheet. No fixture prices are production defaults. Existing project schema, assets and migrations preserved.


## Construction budget rates — 2026-10-21

Owner supplied Pitch offer2026 as price inspiration. Eight model rates scaled by perimeter/height from five EUR anchors,converted with frozen NBP4.3641PLN/EUR; proposed net basis explicitly disclosed because the PDF does not specify VAT. Construction-only partial totals; surface/installation/transport remain unknown. See CONSTRUCTION_PRICING_2026.md and pricing/rate-card-2026-10-21.json. This supersedes the earlier missing-construction-rates state, not the outstanding prices for other scope.


## Inquiry handoff — 2026-10-21

Complete bounded JSON replaces blind 18,000-character truncation. Floor and panel artwork bytes are omitted with explicit attachment metadata; coordinates, text, colours and current estimate are retained. Oversized projects and blocked popup windows show actionable errors. Matching WordPress limits require 500,000 characters. See tests/inquiry-summary.mjs.


## Acknowledged inquiry transport — 2026-10-21

S5-03 now waits for an origin/source/request/length-matched WordPress acknowledgement before reporting attachment. Missing/rejected replies show a recoverable error after 15 seconds; retries use a new request ID and late replies are ignored. Standalone popup waits for receiver readiness; embedded modal closes only after acknowledgement. No automatic CF7 submission. Artwork files remain separate and price assumptions are unchanged. Tests: inquiry-transport (included in test:studio), wp-inquiry-bridge against rendered public homepage bytes. This confirms form attachment, not mailbox delivery.


## Brief zmiany.txt — geometry slice, 2026-10-21

Continue existing Product Intelligence plan with geometry, UX and progress agents. Shared generated metadata for eight live models now supplies both quote area and dimension presentation. Stored reference dimensions, floor bounds/top-face area and construction-with-goals envelope are separate. Legacy project fields, source meshes, current rate card and exact quote areas are unchanged; clearance and module pitch stay unknown. No R02 source rollout or engineering approval. See docs/PROJECT_DIMENSIONS.md and tests/project-dimensions.mjs. Full roadmap status is recorded separately; this slice does not complete every sprint.

## Aktualizacja 22.10.2026

- DONE (lokalny zakres S3): odzyskanie poprzedniego szkicu, ochrona danych, nazwane warianty max6, porównanie dwóch i przywrócenie z Cofnij. Kontrakt: PROJECT_RECOVERY_VARIANTS.md.
- Zweryfikowano integralność 42 plików live/R02. Adopcja R02 nadal wymaga rozstrzygnięcia różnic geometrii i danych technicznych.
- Następnie: zatwierdzony rejestr artykułów/kompatybilności i techniczny BOM; brakujące stawki nawierzchni/montażu/transportu; specyfikacja z rewizją. Synchronizacja w chmurze i porównanie 3D/cen nie są częścią ukończonego lokalnego zakresu.

## Rejestr / eksport konfiguracji — 22.10.2026

- DONE: inwentaryzacja 56 cyfrowych artykułów i izolowany adapter jednej rodziny; źródła/revizje/ilości walidowane.
- DONE: eksport specyfikacji konfiguracji z pełnym Project i SHA256 w istniejącym Podsumowaniu.
- PENDING: zatwierdzenie artykułów i połączeń; spięcie instancji OS/Studio w techniczny BOM. Rejestr cyfrowy i lista dostępnych elementów nie stanowią BOM wybranego modelu.

## Aktualizacja S3-02 — 22.10.2026

- DONE (ograniczony profil): statyczne SVG, wspólny upload/schema, wrogie przypadki, zachowane bajty, ochrona odrzuconego importu i surowego szkicu.
- NEXT: powtarzalny pomiar renderera i kosztów złożonych grafik; głębsza walidacja rastrów wymaga osobnego zakresu zgodności PNG.
- Mapowanie13 aktywnych GLB F05/F06/F07 do rejestru potwierdzone po SHA. Następny niezależny etap cyfrowego BOM może użyć oddzielnego inspektora konfiguracji OS; nie wolno przypisać jego ilości do innego projektu Studio bez wiązania konfiguracji.
- Nadal wymagane dane: połączenia/artykuły wykonawcze i wybór rewizji R02, ceny pozostałych zakresów, urządzenia i badania z klientami.

## Inspektor OS — 22.10.2026

- DONE — cyfrowy zakres: niezależny import natywnej koperty OS, ścisły config, ponowne wygenerowanie instancji, mapowanie artykułów i eksport z rewizjami. Brak zaufania do wejściowego bom.
- NEXT: odtwarzalny scenariusz i pomiary renderera przed budżetem/zmianami wydajności.
- PENDING: jawne związanie konfiguracji OS z Project Studio i zatwierdzone dane połączeń/artykułów przed technicznym BOM oraz pełną wyceną. Nie przypisywać wyników po nazwie/rodzinie.

## Renderer — 22.10.2026

Ukończono pierwszą lokalną bazę480próbek dla8modeli/2szerokości/6operacji/5powtórzeń. Współdzielone dekodowanie tekstur jest prawidłowo oczekiwane przez aktualną generację. Szczegóły, surowe dane, hashe, ograniczenia i kolejność optymalizacji: docs/RENDERER_BASELINE.md. Nie deklarujemy przyspieszenia względemv80 ani budżetu SLA. Następnie: panelowe grafiki Circle Cage2, porównywalny kandydat i pomiar rozrzutu; niezależnie jawne powiązanie OS–Project przed technicznym BOM.

## Grafiki paneli — 22.10.2026

DONE w ograniczonym zakresie: raster PNG współdzielony w jednej generacji po dokładnym rozmiarze i treści. CircleCage2:16→1kodowań;16uploadów GPU pozostaje. Porównanie480+480próbek/48identycznychcanvasów,84dokładneRGBA i niezależny przegląd PASS. Nie wszystkie operacje/maksima były szybsze; zachowano pełne wyniki. Szczegóły: docs/PANEL_ARTWORK_OPTIMIZATION.md. Następnie: pozostały koszt upload/draw i rozrzut czasów; osobno kontrakt stron paneli CircleCage, OS–Project i dane wykonawcze.

## Strony paneli Circle Cage — 22.10.2026

DONE w zakresie wizualizacji Circle1/2: inner/outer według orientacji faset względem środka; niewybrane powierzchnie zachowują kolor panelu. Both oraz inne modele zachowują oryginalne meshe.58przypadków WebGL/JSON/odtwarzania/switch PASS;480próbek i48identycznychcanvasów both względemStudio82. Wyłącznie runtimeadapter, bez podmiany źródeł i bez potwierdzenia technologii nadruku. Szczegóły: docs/CIRCLE_PANEL_SIDES.md. Następne: pozostały upload/draw i budżet czasowy; kontrakt OS–Project i dane wykonawcze.


## Powiązanie wersji Studio i OS — 23.10.2026

DONE w zakresie referencyjnym: pełny Project z grafikami i znormalizowany config OS zapisane w jednym pliku GF-PROJECT-OWNED-REFERENCE-1. Ponowny import odtwarza ilości i kontroluje SHA oraz przypięte rewizje. Wymagana zgodna rodzina i poziomy Circle; komponent nie staje się całym boiskiem. Zmiana projektu daje status historyczny, spóźniony odczyt nie zastępuje nowszego wyniku. Projekt i cena pozostają niezależne. Zgodność geometryczna UNCONFIRMED, technicalBill.rows=null; brak zatwierdzenia produkcyjnego. Kontrakt: [PROJECT_OWNED_REFERENCE](PROJECT_OWNED_REFERENCE.md).

NEXT: profil pozostałych kosztów upload/draw i rozrzutu czasów. Przed technicznym BOM wymagane potwierdzenie geometrii Studio–OS, R02, połączeń, rozstawów i artykułów wykonawczych. Powiązanie snapshotów nie zamyka tego zadania.


Bramki publikacji23.10: TypeScript/build/test:studio/quote-engine/construction-pricing PASS;10przypadków przeglądarkowych375/1440 z pełnym SVG, statusami i ochroną spóźnionego odczytu PASS; Surface7rozmiarów PASS; pełne test:mobile PASS (96scen aren,48Street,16zmian materiałów, JSON i Radar,375/390/430/1440).


## Wczytywanie grafik paneli — 23.10.2026

Wspólny Image dla identycznego źródła PNG w jednej generacji. Osobne tekstury GPU, uploady i draw zachowane; cache błędów pozwala ponowić próbę, a stare/zniszczone zadania nie nadpisują aktualnych. Podłoże i materiały bez zmian. Kontrakt i wyniki: [DECODED_PANEL_IMAGES](DECODED_PANEL_IMAGES.md). Liczba load nie jest pomiarem dekodera CPU ani FPS.

NEXT: profil pozostałego kosztu upload/draw i rozrzutu czasów. Zgodność geometrii OS–Studio oraz zatwierdzenia danych wykonawczych nadal wymagane przed technicznym BOM.


Bramki wydania23.10: TypeScript/build/test:studio/quote-engine/construction-pricing PASS;48/48stanów Circle Cage identycznych pikselowo z wersją84, bufory/kolory/design i upload/draw zgodne; pełne test:mobile96aren/48Street/16materiałów/JSON/Radar PASS; Surface7rozmiarów PASS; niezależny oracle stron paneli58przypadków PASS. Surowe raporty i SHA w decoded-panel-images-2026-10-23.


## Końcowe rysowanie paneli — 23.10.2026

Panelowe uploady wyłączają pośredni draw całego boiska. Aktywna generacja czeka na wszystkie zadania, czyści nieudane tekstury i rysuje raz. Błąd/anulowanie nie publikuje ukończenia. Domyślna ścieżka Renderer, podłoże, materiały i resize zachowane; nie ma globalnego batchowania ani gwarancji atomowego widoku podczas resize. Kontrakt: [PANEL_UPLOAD_BATCH](PANEL_UPLOAD_BATCH.md). Licznik wywołań nie jest FPS lub czasem GPU.

NEXT: pomiar rozrzutu i czasu na porównywalnych seriach oraz osobny profil uploadów. Zgodność geometryczna OS–Studio i dane wykonawcze pozostają zależnościami technicznego BOM.


Bramki publikacji23.10: TypeScript/build/test:studio/quote-engine/construction-pricing PASS;48/48zgodnych stanów z wersją85 i mniejsza liczba rysowań w36stanach grafiki; dwa scenariusze rzeczywistych błędów/retry/starego wyniku PASS; pełne test:mobile96aren/48Street/16materiałów/JSON/Radar PASS; Surface7rozmiarów i58przypadków stron paneli PASS.


## Resety tekstur i audyt geometrii — 23.10.2026

Osobna flaga białej tekstury pozwala ominąć zbędny upload, zachowując unieważnienie oczekującej pracy oraz wymagane czyszczenie wcześniejszej grafiki po błędzie. Kontrakt: [WHITE_TEXTURE_RESETS](WHITE_TEXTURE_RESETS.md). Wyniki i bramki publikacji dopisywane po zakończeniu.

Powstał również odtwarzalny [audyt8modeli Studio i OS](STUDIO_OWNED_GEOMETRY_GAPS.md), źródłowe SHA oraz opis brakujących danych. To ukończona inwentaryzacja, nie zatwierdzenie równoważności geometrii lub technicznego BOM. Cztery rodziny źródłowe nie mają potwierdzonego złożenia w OS; Circle/Grid mają różnice deskryptorów podłoża, a Octagon nadal wymaga przypiętego mesha/orientacji podłoża do porównania.

NEXT: powtarzalne serie czasu/rozrzutu, pomiary na urządzeniach i zatwierdzone mapowanie instancji, połączeń oraz obrysów przed BOM.


Bramki publikacji 23.10: TypeScript, build, test:studio, quote-engine i construction-pricing PASS. Ponowione sekwencyjnie test:mobile (96 scen aren,48 Street,16 materiałów, JSON i Radar), Surface w7rozmiarach oraz58przypadków stron paneli PASS. Porównanie60stanów i2scenariusze błędów/retry/starej pracy PASS. Audyt8rewizji Studio i25komponentów OS odtworzony dwukrotnie z identycznym SHA.


## 23.10.2026 — porównanie z Gamefields.eu.txt i ceny wariantów

[Zestawienie pełnego dokumentu](GAMEFIELDS_EU_CROSSCHECK.md): zakres etapów0–6, potwierdzone funkcje, częściowe wdrożenia i zależności. Nie oznaczamy całych sprintówDONE. Źródło właściciela SHA256 af77fb6ee8bbc79d305fac5ec0bd0e139c976041343d62cc3d6d58f9750f91d2; końcówka dokumentu pozostaje urwana.

W Plikach projektu dwa wybrane warianty mają niezależne bieżące kalkulacje bez przywracania zapisów. Wspólny silnik/API i karta zakresu, osobny retry, blokada niezgodnej rewizji, anulowanie po odznaczeniu. Częściowe sumy nie są pełną ofertą. [Kontrakt](VARIANT_PRICING.md).

PASS: TypeScript, build, test:studio, quote-engine/construction-pricing, pełne test:mobile (96scen aren/48Street/16materiałów/JSON/Radar,375/390/430/1440) i Surface7rozmiarów. Nowy test375/1440: różne wyniki z jawnymi fixture TEST-NOT-FOR-SALE, błąd/retry, stara rewizja, spóźniona odpowiedź, dokładna niezmienność Project i biblioteki, reflow. Nie zmieniono stawek komercyjnych, silnika renderera, modeli, Project JSON, SQL lub BOM; nie wysyłano formularzy. Nie powtarzano ABBA niezmienionego renderera.

Następne: osobny profil Street Field1440tekst i timeout O1, odzyskiwanie błędów3D, porównanie3D z pełnym zakresem personalizacji. Geometria/R02, zatwierdzone połączenia/BOM, brakujące stawki i fizyczne urządzenia pozostająPARTIAL/PENDING. Publikację potwierdza centralny raport wydania i receipt poza checkoutem.
