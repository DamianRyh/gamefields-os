# Gamefields — Studio i Radar

Zakres: projektowanie boisk i mapa lokalizacji / koncepcji renowacji. PLAY jest wycofany.

## Studio
Wybór rodzaju boiska → design → wyposażenie → wymiary i orientacyjna wycena. Zachowano 300 wzorów (25 × 12), 18 palet, 12 kierunków Signature, branding, wyposażenie, undo/redo i warianty.

Street Football 3×3: cztery materiały i trzy realistyczne perspektywy dla Parku, Szkoły, Podwórka i Warszawy. Kraków jest przygotowany, ale ukryty.

Projekty pozostają w pamięci sesji: zapisuj ważne projekty eksportem JSON. Import jest walidowany. Katalog WordPress (kategoria 629) i API /api/templates pozostają. Nie ma kont PLAY ani zapisu /api/projects. Wycena /api/quote jest orientacyjna, nie stanowi oferty.

## Radar
Studio i Radar używają wspólnego komponentu GamefieldsHeader: Boiska, Radar · mapa, Projektuj boisko. Studio zachowuje lokalne zakładki rodzajów, projektu i wzorów bez przeładowania projektu. Logo wraca do gamefields.eu także z iframe.

Mapa Leaflet / OpenStreetMap, pinezki, filtry, strony koncepcji i porównania przed/po. Dane Studio są pilotażowe; zastępczych ilustracji nie należy przedstawiać jako udokumentowanych realizacji. WordPress ma osobną zaakceptowaną koncepcję z materiałami przed/po.

## Lokalnie
Node 22.13+, pnpm przypięty w package.json. Uruchom pnpm install --frozen-lockfile i pnpm dev.
Sprawdzenie: pnpm exec tsc --noEmit, pnpm test:studio, pnpm build, pnpm test:mobile (wymaga Chromium).

## Hosting i dane
Ten sam Site: https://gamefields-studio.ryhfs90.chatgpt.site
WordPress: https://www.gamefields.eu/konfigurator-boisk/
Manifest zachowuje projekt i binding DB. Aktywne funkcje Studio / Radar nie używają tabel PLAY.
drizzle/ pozostaje niezmiennym rejestrem zastosowanych migracji; nie uruchamiaj ich automatycznie w testach Studio.
Nie kasuj istniejących danych klientów, oryginalnych grafik ani historii Git w ramach porządków.

Studio exposes Street Football 3×3 followed by Panna Football 1×1 (Street Football 1×1), with a round Ø7 m arena, shared design library, twelve dedicated greenscreen scenes and validated JSON compatibility.

Panna: circle area πD²/4 (38.48 m²); geometry tests: `node tests/panna-geometry.mjs`. Scene prompts and compositing limits: [docs/PANNA_SCENES.md](docs/PANNA_SCENES.md).

Homepage integration: `?home=1&sport=Piłka%20nożna%201×1` opens the Panna entry block with live round preview and design directions. Embedded blocks hide the sport selector; the primary CTA transfers sport and design into the full builder. WordPress homepage adds Panna immediately after the existing 3×3 embed.

2026-10-10: Homepage arrangement — WordPress 3462 opens with the live Street Football builder, concise navigation, compact before/after and author sections. Panna, process and location submission remain available in native disclosure sections. Repeated introductions are hidden. Embedded Street Football headline shortened to prevent an isolated numeral; no design, palette, project or scene behavior changed. WordPress source verified against the proposed targeted patches; live desktop iframe no longer scrolls inside the page. Mobile physical-device QA remains outstanding.
Validation for 2026-10-10 copy-only Studio change: TypeScript, Studio scope test and production build passed. Mobile regression was attempted but could not run because the Chromium headless executable is absent; no browser was installed. Live desktop checks cover disclosure sections and before/after slider.


2026-10-10: Blender construction catalogue prepared: Panna Ring (5.09 m external, 1 m height), O-1 (about 6 m external), Panna Court (7.139 × 5.573 m). Separate products and arenaModel JSON identity; construction colors first, optional surface, three cameras. Legacy Panna removed from active selection, historical assets preserved. Clean conceptual backgrounds replace photos with baked-in old courts. Local catalogue QA passed 36 location/camera combinations, colors, text, JSON, mobile. Production checks and publication recorded below when complete.

Production validation: TypeScript, Sites Vinext build, Studio/Radar scope, round geometry, and 144 Blender + 48 Street Football combinations passed on 375/390/430/1440 px; JSON export/import and Radar navigation passed.

Panna Ring editor model: `public/arenas/boisko-w1.glb`, loaded directly with `components/glb-arena.ts`; surface design remains separate.

Panna Ring withdrawn from the public offer and new-project selection on 2026-10-10. O-1 and Panna Court remain available; saved model files preserved.


2026-10-10: Panna Court now uses the optimized Blender slab (7.139 × 5.573 × 0.10 m; 220 triangles) instead of the flat floor. Four finishes use physically scaled colour, normal and roughness maps with mipmaps and anisotropic filtering. Artwork and chosen colours remain separate; turf preserves line and logo colours. Existing project JSON remains compatible. TypeScript, production build, Studio/Radar scope and watertight-slab tests passed. Browser regression results are recorded below.

Browser regression passed: 96 O-1/Panna Court and 48 Street Football location/camera combinations at 375/390/430/1440 px; 16 Panna Court material switches, non-empty WebGL rendering, no GL errors or overflow, preserved JSON colours/surface identity, and Radar navigation.


2026-10-10: Arena aerial preview now uses yaw 0 and pitch π/2, so the top-down view aligns the court edges with the screen. Perspective and ground cameras keep their existing orientations. TypeScript, Studio scope and production build passed.
Camera regression passed: 96 arena and 48 Street Football location/camera combinations on 375/390/430/1440 px, materials, JSON and Radar; no overflow or runtime errors.


## Studio: dark workspace (2026-10-12, local work)
The approved dark/mint editor is connected to the retained court engine, including cameras, the 300-pattern library, material controls, equipment/branding editing, validated JSON import/export and browser-local draft saving. Source checks and TypeScript passed; browser captures are under design/studio-ux in the parent workspace. The required scene/material/JSON/Radar regression suite passed on 375/390/430/1440 px, including browser-draft restoration and same-model preservation. The approved dark interface is prepared for deployment to Studio and WordPress page 3644. See design-qa.md.


## Court Culture — 12.10.2026
Nowa identyfikacja Studio: fiolet, maślany żółty, bordo. Zachowano wszystkie wzory, sporty i dotychczasowe palety; dodano Court Culture (19 palet). Builder osadzany na głównej. Podsumowanie przekazuje parametry do formularza WordPress przez sprawdzany origin i źródło okna; logo pozostaje w eksporcie lokalnym. Sprawdzono: tsc --noEmit, test:studio i build. Browser QA oraz test:mobile pominięto — w tej sesji brak wymaganego control-browser dla managed preview. Publikacja jest wykonywana w tej sesji.


## Panna Cage 180 i Street Arena 15 — 2026-10-19

Dodano do wspólnego wyboru produktów Studio modele circle-cage-2 i street15. Circle Cage opiera się na rysunku Boisko 03-H i detalach paneli: Ø 6 m, wysokość 1,8 m, 12 paneli zwykłych, 2 bramkowe i 2 z wycięciem. Oba modele korzystają z nawierzchni 20 cm oraz wspólnych kolorów, wzorów, kamer i projektu JSON. Migracja historycznych projektów Ø 6 m nie nadpisuje nowego modelu Circle Cage. Bez nowych tras produktu. Sprawdzenie: TypeScript, Studio scope, build i tests/new-blender-arenas.mjs (390/1440 px, kolory, kamery, WebGL, JSON). Pełna regresja mobilna w tests/studio-mobile-goals.mjs.


## Panna Cage 90 — 2026-10-19

Dodano jednopoziomową arenę Ø 6 m / 0,9 m według Boisko 03 i wspólnych detali: 5 zwykłych paneli, 2 bramki, 1 wejście. Osobna nawierzchnia 20 cm, edytowalne kolory, bez domyślnych napisów i linii. Model w istniejącym Studio (`?arena=circle-cage-1`), bez nowych tras; import JSON zachowuje średnicę 6 m. Źródła, generatory i audyt: `models/panna-circle-cage-1/`.

Sprawdzone: TypeScript, test:studio (300 wzorów, 19 palet, Radar), build oraz tests/new-blender-arenas.mjs dla trzech modeli na 390/1440 px: kolory, materiały, linie, kamery, widoczna geometria WebGL i zachowanie modelu w JSON. Model 1.0: 19 siatek, 48060 trójkątów; wysokość geometrii 0,9 m i osobne podłoże 0,2 m.


## Panna Grid — 2026-10-20

Dodano produkt street-field do wspólnego Studio. Pole 6,214 × 4,648 m, wysokość 1,091 m, dwie bramki i obniżone wejście; szerokości paneli dopasowane zgodnie z decyzją użytkownika do wcześniejszego zwymiarowanego złożenia. Osobna nawierzchnia 20 cm, bez domyślnych napisów i linii. Generatory, natywny Blender/GLB, źródła i audyt w models/street-field. Bez nowych tras.


Panna Grid — korekta podłoża 2026-10-20: nawierzchnia 7,30 × 5,30 m, grubość 20 cm. Obejmuje wszystkie podstawy słupów i oba kosze bramek z zapasem. Pole gry i geometria konstrukcji pozostają 6,214 × 4,648 m. Sprawdzono zawieranie wszystkich wierzchołków konstrukcji w obrysie podłoża.


## Panna Octa — 2026-10-20

Produkt octagon w istniejącym Studio: obrys wewnętrzny 4,962 × 4,962 m, wysokość 1,218 m, 4 panele zwykłe, 2 bramkowe, 2 wejściowe i 8 słupów. Rodzina profili Panna Grid dopasowana do Boisko 01. Ośmiokątne podłoże 6 m / 20 cm obejmuje całość. Osobny model i nawierzchnia, kolory, wzory, linie i projekt JSON. Generatory i audyt w models/octagon. Bez nowych tras.

## Studio — edytor na pełnym podglądzie (20.10.2026)
Wybrany wariant 2: podgląd 3D, lewy pasek Konstrukcja / Nawierzchnia / Grafika / Wyposażenie i dolny panel ustawień. Na telefonie narzędzia są nad dolnym panelem, a model pozostaje widoczny. Wybór modelu: „Zmień boisko”; materiały: „Zmień materiał”; pełna biblioteka 300 wzorów: „Zmień wzór”. „Zapisz projekt” pobiera JSON; import jest w „Pliki”. Zachowano kolory konstrukcji, puste domyślne napisy, kamery, lokalny szkic, Radar i wycenę indywidualną. Porównanie wizualne: `design-qa.md`.


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

Owner requested re-enabling pricing. Debounced quote requests and itemised summary are restored with explicit rates, real Blender floor quantities, partial/unknown states, retry, stale-response protection and inquiry estimate snapshot. See [pricing contract](docs/PRICING.md). Commercial runtime rates were absent; numeric production estimates require the owner rate sheet. No fixture prices are production defaults. Existing project schema, assets and migrations preserved.


## Construction budget rates — 2026-10-21

Owner supplied Pitch offer2026 as price inspiration. Eight model rates scaled by perimeter/height from five EUR anchors,converted with frozen NBP4.3641PLN/EUR; proposed net basis explicitly disclosed because the PDF does not specify VAT. Construction-only partial totals; surface/installation/transport remain unknown. See docs/CONSTRUCTION_PRICING_2026.md and pricing/rate-card-2026-10-21.json. This supersedes the earlier missing-construction-rates state, not the outstanding prices for other scope.


## Inquiry handoff — 2026-10-21

Complete bounded JSON replaces blind 18,000-character truncation. Floor and panel artwork bytes are omitted with explicit attachment metadata; coordinates, text, colours and current estimate are retained. Oversized projects and blocked popup windows show actionable errors. Matching WordPress limits require 500,000 characters. See tests/inquiry-summary.mjs.


## Acknowledged inquiry transport — 2026-10-21

S5-03 now waits for an origin/source/request/length-matched WordPress acknowledgement before reporting attachment. Missing/rejected replies show a recoverable error after 15 seconds; retries use a new request ID and late replies are ignored. Standalone popup waits for receiver readiness; embedded modal closes only after acknowledgement. No automatic CF7 submission. Artwork files remain separate and price assumptions are unchanged. Tests: inquiry-transport (included in test:studio), wp-inquiry-bridge against rendered public homepage bytes. This confirms form attachment, not mailbox delivery.


## Brief zmiany.txt — geometry slice, 2026-10-21

Continue existing Product Intelligence plan with geometry, UX and progress agents. Shared generated metadata for eight live models now supplies both quote area and dimension presentation. Stored reference dimensions, floor bounds/top-face area and construction-with-goals envelope are separate. Legacy project fields, source meshes, current rate card and exact quote areas are unchanged; clearance and module pitch stay unknown. No R02 source rollout or engineering approval. See docs/PROJECT_DIMENSIONS.md and tests/project-dimensions.mjs. Full roadmap status is recorded separately; this slice does not complete every sprint.

## Odzyskiwanie i warianty — 22.10.2026

Pliki projektu zawierają ochronę uszkodzonego szkicu, poprzednią kopię i do sześciu pełnych nazwanych wariantów z porównaniem dwóch planów 2D. Przywrócenie podlega Cofnij i sprawdza rewizję modelu. Dane pozostają w przeglądarce; JSON jest niezależną kopią. Kontrakt i ograniczenia: [PROJECT_RECOVERY_VARIANTS](docs/PROJECT_RECOVERY_VARIANTS.md).

## Specyfikacja i cyfrowe artykuły — 22.10.2026

Podsumowanie eksportuje pełną konfigurację z SHA256 i rewizją modelu. Rejestr 56 cyfrowych elementów i adapter jednej rodziny przygotowują dalszą integrację BOM. Połączenia i artykuły wykonawcze pozostają niezatwierdzone. Kontrakt: [COMPONENT_SPECIFICATION](docs/COMPONENT_SPECIFICATION.md).

## Statyczne grafiki — 22.10.2026

Wspólny profil statycznego SVG chroni upload, import i odczyt projektów. Poprawne źródła zachowują bajty, odrzucone pliki mają czytelny komunikat; odzyskiwanie nie nadpisuje niezgodnego szkicu. PNG zachowuje poprzedni kontrakt. Zakres i ograniczenia: [GRAPHIC_SOURCE_POLICY](docs/GRAPHIC_SOURCE_POLICY.md).

## Inspektor OS — 22.10.2026

Pliki projektu zawierają niezależną kontrolę konfiguracji Systemu modułowego. Ilości są odtwarzane z config, załączone bom pomijane, wynik ma przypięte rewizje i osobny eksport. Projekt Studio i jego cena pozostają niezależne. Kontrakt: [OWNED_CONFIGURATION_INSPECTOR](docs/OWNED_CONFIGURATION_INSPECTOR.md).

## Renderer — 22.10.2026

Ukończono pierwszą lokalną bazę480próbek dla8modeli/2szerokości/6operacji/5powtórzeń. Współdzielone dekodowanie tekstur jest prawidłowo oczekiwane przez aktualną generację. Szczegóły, surowe dane, hashe, ograniczenia i kolejność optymalizacji: docs/RENDERER_BASELINE.md. Nie deklarujemy przyspieszenia względemv80 ani budżetu SLA. Następnie: panelowe grafiki Circle Cage2, porównywalny kandydat i pomiar rozrzutu; niezależnie jawne powiązanie OS–Project przed technicznym BOM.

## Grafiki paneli — 22.10.2026

DONE w ograniczonym zakresie: raster PNG współdzielony w jednej generacji po dokładnym rozmiarze i treści. CircleCage2:16→1kodowań;16uploadów GPU pozostaje. Porównanie480+480próbek/48identycznychcanvasów,84dokładneRGBA i niezależny przegląd PASS. Nie wszystkie operacje/maksima były szybsze; zachowano pełne wyniki. Szczegóły: docs/PANEL_ARTWORK_OPTIMIZATION.md. Następnie: pozostały koszt upload/draw i rozrzut czasów; osobno kontrakt stron paneli CircleCage, OS–Project i dane wykonawcze.

## Strony paneli Circle Cage — 22.10.2026

DONE w zakresie wizualizacji Circle1/2: inner/outer według orientacji faset względem środka; niewybrane powierzchnie zachowują kolor panelu. Both oraz inne modele zachowują oryginalne meshe.58przypadków WebGL/JSON/odtwarzania/switch PASS;480próbek i48identycznychcanvasów both względemStudio82. Wyłącznie runtimeadapter, bez podmiany źródeł i bez potwierdzenia technologii nadruku. Szczegóły: docs/CIRCLE_PANEL_SIDES.md. Następne: pozostały upload/draw i budżet czasowy; kontrakt OS–Project i dane wykonawcze.


## Powiązanie wersji Studio i OS — 23.10.2026

Pliki projektu zapisują i sprawdzają pełne snapshoty Studio i OS z SHA256 oraz rewizjami źródeł. Zmiana bieżącego projektu oznacza zapis historyczny. Powiązanie jednej rodziny nie potwierdza geometrii ani technicznego BOM i nie zmienia ceny. [Kontrakt](docs/PROJECT_OWNED_REFERENCE.md).


## Wczytywanie grafik paneli — 23.10.2026

Identyczne PNG paneli współdzielą wczytany Image w jednej aktualizacji podglądu. Tekstury i uploady GPU pozostają osobne, a cache nie przechodzi między generacjami. [Kontrakt i wyniki](docs/DECODED_PANEL_IMAGES.md).


## Końcowe rysowanie paneli — 23.10.2026

Aktualizacja podglądu czeka na panelowe uploady i wykonuje wspólne końcowe rysowanie. Chronione błędy, retry i anulowanie; osobne tekstury GPU oraz format projektu zachowane. [Kontrakt i dowody](docs/PANEL_UPLOAD_BATCH.md).


## Resety tekstur i zgodność modeli — 23.10.2026

Puste panele nie wymagają kolejnych białych uploadów; rzeczywista grafika nadal jest czyszczona, także po błędzie. [Kontrakt](docs/WHITE_TEXTURE_RESETS.md). Osobny [audyt8modeli Studio/OS](docs/STUDIO_OWNED_GEOMETRY_GAPS.md) zapisuje rewizje i potwierdzone różnice; nie zatwierdza technicznego BOM.


## 23.10.2026 — porównanie z Gamefields.eu.txt i ceny wariantów

[Zestawienie pełnego dokumentu](docs/GAMEFIELDS_EU_CROSSCHECK.md): zakres etapów0–6, potwierdzone funkcje, częściowe wdrożenia i zależności. Nie oznaczamy całych sprintówDONE. Źródło właściciela SHA256 af77fb6ee8bbc79d305fac5ec0bd0e139c976041343d62cc3d6d58f9750f91d2; końcówka dokumentu pozostaje urwana.

W Plikach projektu dwa wybrane warianty mają niezależne bieżące kalkulacje bez przywracania zapisów. Wspólny silnik/API i karta zakresu, osobny retry, blokada niezgodnej rewizji, anulowanie po odznaczeniu. Częściowe sumy nie są pełną ofertą. [Kontrakt](docs/VARIANT_PRICING.md).

PASS: TypeScript, build, test:studio, quote-engine/construction-pricing, pełne test:mobile (96scen aren/48Street/16materiałów/JSON/Radar,375/390/430/1440) i Surface7rozmiarów. Nowy test375/1440: różne wyniki z jawnymi fixture TEST-NOT-FOR-SALE, błąd/retry, stara rewizja, spóźniona odpowiedź, dokładna niezmienność Project i biblioteki, reflow. Nie zmieniono stawek komercyjnych, silnika renderera, modeli, Project JSON, SQL lub BOM; nie wysyłano formularzy. Nie powtarzano ABBA niezmienionego renderera.

Następne: osobny profil Street Field1440tekst i timeout O1, odzyskiwanie błędów3D, porównanie3D z pełnym zakresem personalizacji. Geometria/R02, zatwierdzone połączenia/BOM, brakujące stawki i fizyczne urządzenia pozostająPARTIAL/PENDING. Publikację potwierdza centralny raport wydania i receipt poza checkoutem.
