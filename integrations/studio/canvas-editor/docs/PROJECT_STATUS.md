# Gamefields — stan projektu

## Studio — wspólne kolory, jeden podgląd 3D i budowanie modułowe (2026-10-24)

- Konstrukcja używa tych samych kontrolek `.studio-color` co nawierzchnia: Bandy, Rama, Bramki. Usunięto osobne presety.
- Własne modele oraz porównanie wariantów mają jeden obracany podgląd 3D. Boczny i Z góry usunięte. Historyczne dane kamer/projektów pozostają czytelne.
- „Budowanie modułowe” otwiera w Studio zachowany silnik OS, lokalne komponenty GLB i osobny zapis GF-OWNED-ASSEMBLY-1. Street Field zwiększa długość/szerokość pełnymi modułami; Circle Cage zmienia poziomy; Octagon zachowuje stały obrys. Jedna rodzina na konfigurację, skala części 1:1. P1 nie otrzymał niepotwierdzonego układu modułów.
- Edytor modułowy ma niezależny lokalny szkic, import/eksport i osobną wycenę. Nie zmienia projektu Studio, jego nawierzchni ani ceny bazowej. Brak zatwierdzonego BOM wykonawczego i kotwienia. Koszty produkcji nadal wyłącznie po stronie serwera.
- Źródło OS zachowane w components/gamefields/owned-modular; silnik bez zmian względem lib/vendor/owned-modular. Publiczny bundle zawiera Three.js 0.180.0, lokalne GLB i deklarację MIT. Opcjonalna regeneracja: NODE_PATH wskazujący instalację Three.js 0.180.0, node scripts/build-studio-modular.mjs (esbuild 0.28.0). Główny build korzysta z zachowanego bundla.
- Weryfikacja: tsc, test:studio i build; test przeglądarkowy modułów 390/1440 px: 3 rodziny, wzrost instancji, skala 1:1, zapis/import/odzyskiwanie, zachowanie koloru Studio. Dodatkowe testy mobilne i orbitowania zapisują wyniki w outputs.

## Wspólna nawigacja — 2026-10-08
GamefieldsHeader zastępuje osobne nagłówki Studio/Radar i stron lokalizacji. Wspólne Boiska / Radar · mapa / Projektuj boisko, aktywna sekcja, dostępne cele dotykowe i układ mobilny. Zakładki konfiguratora nie przeładowują projektu. WordPress: menu Main PL współdzielone przez desktop i mobile, Radar w miejscu linku City; homepage usuwa stary link PLAY; landing Studio usuwa niedziałające ulubione i avatar. Grafiki, wzory i geometria pozostają bez zmian. Style stron WordPress w integrations/wordpress/shared-navigation.css.

## Odchudzenie — 2026-10-08 (opublikowane Sites v41)
Na decyzję właściciela zakres to Studio / boiska i Radar / mapa. Usunięto 23 pliki PLAY: nieużywane biblioteki i schematy runtime, testy, instrukcje oraz lokalną bramkę WordPress. Publiczne trasy PLAY były już nieobecne.

Usunięto martwe konto projektów i wywołania /api/projects. JSON import/export i katalog WordPress pozostają. Manifest startuje od /, nie /play. Nie zmieniono cen ani wartości materiałów.

Usunięto preload wszystkich podglądów. Compositor buforuje maksymalnie trzy wybrane zdjęcia i grupuje szybkie zmiany w oknie 60 ms. Geometria i rozdzielczość są zachowane; błędy ładowania mają retry.

Zachowano kompaktowe karty czterech nawierzchni, szczegóły i zbliżenia. Zachowano wszystkie grafiki, 300 wzorów, 18 palet i 12 kierunków Signature. Park, Szkoła, Podwórko i Warszawa mają trzy perspektywy; Kraków enabled:false. Pozostają poprawki mobilnych bramek i identyfikacja Minimal v2.

Usunięto odtwarzalny cache pnpm i starą paczkę outputs/gamefields-studio-402fd74.tar.gz. Wolne miejsce wzrosło z około 41 MiB do 1,6 GiB (wartość zależy również od innych procesów).

WordPress: gateway PLAY trwale usunięto po zatwierdzeniu wymaganej operacji przez właściciela. Konfigurator osadza Site bezpośrednio przez iframe i nie potrzebuje bramki. Usunięto także rozpoznane stare paczki site-v14.tar.gz, site-v17.tar.gz i gamefields-wordpress-gateway.zip; ich przygotowane grafiki są nadal obecne w public/studio.

Kontrola typów, test zakresu i produkcyjny build przeszły. Lokalny browser sprawdził 12 kombinacji materiał/kamera i układ 390 px. Test 375 px wykrył dziedziczony minimalny rozmiar elementów siatki; dodano min-width:0 przed końcową regresją.

Historyczne migracje, dane produkcyjne i Git nie są kasowane. Studio Radar pozostaje pilotażowy, WordPress ma osobne zatwierdzone materiały przed/po.

Odchudzenie potwierdzone: Sites v41, commit 710e0afc4678ef94aacd33ead42e072d96cc31a3. Testy 48 kombinacji oraz przejścia Radar projekt/powrót przeszły. Publikację kolejnych zmian potwierdza native deployment status.

2026-10-09: Added Panna Football 1×1 immediately after Street Football 3×3 in the entry selector. Reuses validated Piłka nożna 1×1 profile, 10 × 6 m start, two goals, materials and existing design library. Panna uses the proportionate SVG preview; calibrated 3×3 photos remain assigned to 3×3.

2026-10-09: Panna now uses a circular Ø7m plan and twelve dedicated greenscreen scenes (four locations × three cameras). Shared 300 patterns, 18 palettes, 12 Signature directions, four materials and project tools remain. JSON preserves explicit circle geometry; legacy rectangular imports remain rectangular. Quote and summary use circle area. Type check, build, geometry tests and 96 mobile/desktop scene combinations passed; Radar navigation remains covered. See PANNA_SCENES.md for conceptual projection and photo-equipment limitations.

Panna band branding follows the circular arc when moved, with rotation/scaling centred on its displayed position. Equipment choices now mirror Street Football 3×3, including benches and DJ booth.

Homepage integration: `?home=1&sport=Piłka%20nożna%201×1` opens the Panna entry block with live round preview and design directions. Embedded blocks hide the sport selector; the primary CTA transfers sport and design into the full builder. WordPress homepage adds Panna immediately after the existing 3×3 embed.

2026-10-10: Homepage arrangement — WordPress 3462 opens with the live Street Football builder, concise navigation, compact before/after and author sections. Panna, process and location submission remain available in native disclosure sections. Repeated introductions are hidden. Embedded Street Football headline shortened to prevent an isolated numeral; no design, palette, project or scene behavior changed. WordPress source verified against the proposed targeted patches; live desktop iframe no longer scrolls inside the page. Mobile physical-device QA remains outstanding.
Validation for 2026-10-10 copy-only Studio change: TypeScript, Studio scope test and production build passed. Mobile regression was attempted but could not run because the Chromium headless executable is absent; no browser was installed. Live desktop checks cover disclosure sections and before/after slider.


2026-10-10: Blender construction catalogue prepared: W-1 (5.09 m external, 1 m height), O-1 (about 6 m external), P-1 (7.139 × 5.573 m). Separate products and arenaModel JSON identity; construction colors first, optional surface, three cameras. Legacy Panna removed from active selection, historical assets preserved. Clean conceptual backgrounds replace photos with baked-in old courts. Local catalogue QA passed 36 location/camera combinations, colors, text, JSON, mobile. Production checks and publication recorded below when complete.

Production validation: TypeScript, Sites Vinext build, Studio/Radar scope, round geometry, and 144 Blender + 48 Street Football combinations passed on 375/390/430/1440 px; JSON export/import and Radar navigation passed.

W-1 now loads the original `/arenas/boisko-w1.glb` directly. Parts, transforms, branding UVs and Blender normals are preserved; floor remains the optional configurable surface. TypeScript and production build passed.

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

## Studio canvas — wybrany wariant 2, 2026-10-20

Edytor w istniejącej trasie Studio: duży podgląd WebGL, lewy pasek czterech narzędzi, dolny panel ustawień, skróty nawierzchni i paneli na podglądzie. Mobilnie widoczny model i poziomy pasek nad dolnym panelem. Zachowano 300 wzorów, 19 palet, wszystkie modele, kolory konstrukcji, tekst/logo, materiały, sceny, plan edycji, undo/redo, lokalny szkic, walidowany JSON, Radar i formularz wyceny. Domyślna kamera boczna; geometria i zapisane projekty bez migracji.

Weryfikacja: TypeScript, test:studio i produkcyjny build przeszły. Pełna regresja mobile: 96 kombinacji O-1/P-1 i 48 Street Football; 16 zmian materiału P-1 z widocznym WebGL, bez błędów GL/JS i przepełnienia; kolory i materiał zachowane w JSON, szkic po odświeżeniu, Radar filtr/szczegóły/powrót na 375/390/430/1440 px. Dodatkowo pięć aren Blender (Circle Cage 1/2, Street Field, Octagon, Street15) na 390/1440 px: kolory, puste domyślne napisy/linie, materiały, warianty, 20 cm podłoża, JSON i trzy kamery. Wizualne porównanie desktop + mobilna adaptacja: design-qa.md, wynik passed.

Zależności: istniejące zależności pnpm ze współdzielonego lokalnego katalogu wystarczyły; instalator wymaga narzędzi Linux na tym Macu, więc nie instalowano nowych pakietów. Brak zmian zależności i backendu. Ostrzeżenia builda o rozmiarze pakietu i statycznej klasyfikacji tras pozostają.


## Nazwy zatwierdzone — 20.10.2026

Panna Ring (GF-CT-001), Panna Play (GF-CT-002), Panna Court (GF-CT-003), Street Arena 15 (GF-CT-004), Panna Cage 90 (GF-CT-005), Panna Cage 180 (GF-CT-006), Panna Grid (GF-CT-007), Panna Octa (GF-CT-008). Nazwy centralnie w public/catalog/product-names.json. Kody, arenaModel, adresy i geometria bez zmian. Historyczne wpisy i rysunki mogą zawierać dawne nazwy jako aliasy. Automatyczne tytuły dawnych projektów aktualizowane podczas walidacji; własne nazwy użytkownika zachowane.

Walidacja nazw: tests/product-names.mjs PASS (8 nazw, stałe kody/arenaModel, aktualizacja automatycznych tytułów i zachowanie własnych nazw). TypeScript, test:studio, build, pełna regresja mobile oraz pięć nowych aren PASS. Bez zmiany geometrii, materiałów i parametrów zapisanych projektów.


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

## Odzyskiwanie i warianty — 22.10.2026

S3-01/S3-03 wykonane w zakresie lokalnym: kopia przed zastąpieniem, ochrona uszkodzonego szkicu i błędów pamięci, sześć pełnych wariantów, porównanie dwóch planów/parametrów, przywrócenie i Cofnij, kontrola rewizji. Testy domenowe, TypeScript, build i pełny mobile PASS. Szczegóły w PROJECT_RECOVERY_VARIANTS.md. Rejestr 42 plików live/R02 zweryfikowany osobno; kandydaci R02 nadal nieprzeznaczeni do publikacji. Nie zmieniono modeli ani stawek.

## Rejestr / eksport konfiguracji — 22.10.2026

56 cyfrowych artykułów zweryfikowanych po SHA źródła; adapter odrzuca rodziny mieszane, podmianę źródła/rewizji/skali i duplikaty instancji. Podsumowanie eksportuje pełny projekt z deterministycznym SHA256, rewizją modelu/katalogu i ilością nawierzchni. Brak technicznych instancji pozostaje rows=null, swobodne obiekty nie są artykułami. Bez zatwierdzenia produkcyjnego i bez podmiany R02. Szczegóły: COMPONENT_SPECIFICATION.md.

Bramki etapu rejestru/eksportu: TypeScript/build/test:studio/quote/construction-pricing/mobile PASS. Rzeczywisty download specyfikacji potwierdzony; SHA zgodny z niezależnym odtworzeniem. 375px bez przepełnienia, przycisk50px/tekst16px.

## S3-02 — 22.10.2026

Wdrożono wspólny ograniczony profil statycznego SVG w upload i projectSchema; dotyczy także importu, szkiców, wariantów, szablonów i specyfikacji. Bez cichej sanitizacji; oryginalne dane niezgodnego szkicu chroni recovery. Mieszany upload i brak zmiany projektu po odrzuceniu importu potwierdzone w przeglądarce. TypeScript/build/studio/mobile oraz Surface7viewport PASS. PNG i tor paneli zachowane, bez nowej walidacji sygnatur PNG i bez gwarancji kosztu renderowania ścieżek. Szczegóły: GRAPHIC_SOURCE_POLICY.md.

## Inspektor OS — 22.10.2026

Oddzielny inspektor w Plikach odtwarza cyfrowe ilości z konfiguracji OS przez istniejący przypięty silnik.594konstrukcje+25części i negatywne przypadki PASS;25hashy runtime zweryfikowanych. UI/export sprawdzone ręcznie; pełny Project pozostał identyczny po poprawnych i błędnych działaniach. Brak powiązania z technicznym BOM Studio jest celowy; manufacturingReady=false. TypeScript/build/studio/quote/construction-pricing i pełne mobile PASS po rozróżnieniu selektorów inputów. Surface7viewport również PASS. Szczegóły: OWNED_CONFIGURATION_INSPECTOR.md.

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


## 23.10.2026 — priorytety po88: renderer,3D i robocze stawki

Zrealizowano programowy zakres [priorytetów](PRIORITIES_2026_10_23.md): profil Street Field i cache lokalizacji GL/wymiaru panelu; granice czasu obrazu/modelu/generacji, utrata WebGL i ręczne retry, token ABA; opcjonalne porównanie3D A/B z jedną dodatkową sceną i wspólną kamerą; bieżące ceny i jawne pokrycie obiektów2D/3D. Cache materiałów usuwa nieudane lub wygasłe wczytania, aby kolejna próba nie odziedziczyła nieskończonego oczekiwania.

Właściciel potwierdził brak danych i polecił podstawić wartości: osobna robocza karta6nawierzchni/29typów wyposażenia/montażu/transportu/personalizacji, oznaczeniaAPI/UIworkingAssumptions, bez zatwierdzonego VAT;8cen konstrukcji zachowano. [Założenia i kwoty](WORKING_RATES.md). Nieznane dodatki nadalpartial.

Zaktualizowano audyt8modeli/25zasobów oraz F04(26artykułów), zachowując niezatwierdzone statusy. [Checklista](ENGINEERING_COMMERCIAL_GAPS.md) i szablon danych przypinają rewizje. technicalBill.rows=null; nie dobrano fikcyjnych kotew lub fundamentów. Pełne3Dswobodnego wyposażenia wymaga własnych modeli; obecne pominięcia jawne obok planu2D. Fizyczne urządzenia i pełny budżet wydajności pozostają otwarte.

Kontrola wydania obejmuje TypeScript/build/domain,40nawigacjiO1, fault-injection375/1440,3D/quote375/1440, pełne mobile+Surface+nowe areny,58przypadków Circle,84rastery i60stanów tekstur. Raporty wdocs/priorities-2026-10-23; końcowy profil i receipt publikowane obok centralnego raportu. Czasy profilowane nie sąABBA/GPU/FPS i nie dowodzą ogólnego przyspieszenia. Wewnętrzne arkusze produkcyjne pozostają poza publicznym repo. Stawki robocze nie zatwierdzają geometrii lub finalnej oferty.


## 23.10.2026 — zgodność Gamefields.eu.txt i budżet palety

Opcjonalna polityka kolorów w nowej karcie roboczej v2; stare karty zachowują wyniki. Hook zachowuje kolory i paletę; Podsumowanie rozdziela dopłatę od złożoności wzoru. To budżet wybranych kolorów, nie zatwierdzona receptura farb. Szczegóły: [zestawienie](GAMEFIELDS_EU_RECONCILIATION_2026_10_23.md). Testy i publikacja odnotowane w centralnym raporcie. Nadal wymagane dane konstruktora, własne modele akcesoriów, zatwierdzone ceny/VAT i badania na urządzeniach.


## 24.10.2026 — koszty wewnętrzne, ceny sprzedaży

Wcześniejsze stawki są kosztami produkcji zgodnie z decyzją właściciela. Klient otrzymuje wyłącznie ceny sprzedaży przeliczone na serwerze. Tabele przeniesiono do biblioteki wewnętrznej; nowe źródło i testy nie publikują kosztów. [Zakres i ograniczenia](SALES_PRICE_PRIVACY.md). Dawne rewizje mogą nadal zachowywać wcześniej publiczne dane.


## 24.10.2026 — skupione Studio i obracany model

Wyposażenie i wybór scenerii wyłączone w Studio; większe grupy kolorów konstrukcji; Boczny/Z góry/Model3D z obrotem i bieżącymi teksturami. Starsze dane pozostają w JSON, ale niedostępne wyposażenie nie jest prezentowane ani wyceniane. [Zakres i testy](STUDIO_UX_2026_10_24.md). Ceny sprzedaży nadal są przeliczane na serwerze, koszty ukryte.
