## P2 — sporty i droga do zapytania, 2026-10-29

Dodano Teqball, Street Football, Panna, koszykówkę 3×3 i pełną koszykówkę, wymagane wyposażenie w podglądzie i kalkulacji, udostępniane wersje z wycofaniem, wyszukiwanie/paginację Warsztatu, bibliotekę projektów oraz pakiet zapytania z wyceną. Zachowano najnowszy pływający edytor, karuzele i niezależne kolory konstrukcji; poprawiono mobilną paletę i hydratację. Zakres, testy, migracja i ograniczenia: [P2](docs/P2_IMPLEMENTATION_2026_10_29.md). Produkcyjny CREW pozostaje zależny od poprawienia odrzuconego klucza OpenAI (502/AUTH); wyposażenie bez stawek wymaga indywidualnej wyceny.

## P1 - odporność 3D, zapis i wycena, 2026-10-29

Limit czasu kalkulacji z walidacją odpowiedzi i ponowieniem, limit startu PBR z przejściem do istniejącego renderera standardowego oraz jawny wybór nawierzchni z linku przy odzyskiwaniu szkicu. Zachowano Project, modele, 300 wzorów, 19 palet, lokalne warianty i stawki. Punkt odniesienia, dowody i granice: [P1](docs/P1_FOUNDATION_2026_10_29.md). TypeScript, test:studio, build, testy kalkulacji/API, awarii P1, PBR/WebGL1 oraz test:mobile 375/390/430/1440 PASS. Publikacja potwierdzana osobnym receipt Sites.

## GAMEFIELDS CREW — aktualizacja widoczności, 2026-10-29

Diagnostyka API CREW: błędy OpenAI są klasyfikowane według kodów HTTP (klucz, uprawnienia, limit, model, żądanie) bez zapisywania treści klucza i wiadomości. Sama obecność sekretu nie potwierdza możliwości generowania odpowiedzi.

Cztery głowy doradców są ponownie widoczne w górnym pasku Studio, bez osobnego przycisku otwierającego wybór. Dymek wybranego doradcy nadal można zwinąć. API CREW korzysta z sekretu `OPENAI_API_KEY` przypiętego do środowiska Cloudflare Worker. Weryfikacja produkcyjna i test małego ekranu są wymagane po wdrożeniu.

## Standard jakości produktu — pierwszy etap PBR, 2026-10-29

Panna Play / Panna Court: osobny, leniwie ładowany renderer Three.js z materiałami fizycznymi, oświetleniem studyjnym, odbiciami środowiska, cieniem i zacienieniem styku, mapami nawierzchni oraz filtrowaną perforacją. Obrót/kolory/tekst/logo zachowane. Jakość rośnie po zatrzymaniu, brak stałej pętli w idle; urządzenia bez WebGL2 wracają do starego podglądu. Warsztat czeka na finalną klatkę. Referencja właściciela i kryteria: `docs/PRODUCT_PRESENTATION_STANDARD.md`. Walidacja: TypeScript, build, test:studio, mobilny eksport JSON/materiały/Radar i Warsztat przeszły. Przyczyną wcześniejszej blokady eksportu był pasek CREW nad przyciskiem; pomoc jest teraz dokowana w nagłówku. Status: pierwszy etap do wizualnej oceny względem wzorca, nie deklaracja identycznego renderu.

## Studio — materiały Panna Play / Panna Court, 2026-10-29

Oba interaktywne modele otrzymały oświetlenie lakierowanej stali (światło główne i wypełniające, refleks zależny od kamery i wykończenia), cień z geometrii na poziomie nawierzchni oraz filtrowaną perforację zapobiegającą dużym smugom przy oddaleniu. Cień korzysta z istniejących buforów GPU i maski stencil, bez dodatkowego kontekstu WebGL. Panna Play korzysta teraz również z istniejących map nawierzchni PBR. Geometria/revizje/kolory użytkownika, logo, wzór i obrót pozostają obsługiwane. To render czasu rzeczywistego, nie identyczny obraz z przygotowanych renderów strony głównej.

Walidacja: TypeScript, build, test:studio, test Panna Court v6, `tests/studio-realism.mjs` (o1/p1 × 390/1440 px, widoczny WebGL, stencil, brak błędów GPU, obrót i zmiana koloru). Dowody lokalne: `outputs/studio-realism/`. Znane ograniczenie poprzedniego wydania: szerszy test mobilny potrafi zatrzymać się przy pobieraniu JSON; nie jest dowodem przejścia całego flow eksportu.

## Perspective Lab — światło i cień, 2026-10-29

Dodano oświetlenie kierunkowe, delikatny refleks metalu i perforację paneli O-1/P-1. Miękki cień z geometrii jest rzutowany na płaskie podłoże tą samą kamerą; maska stencil zapobiega sumowaniu ciemności nakładających się elementów. Kierunek światła 0–360° i siła cienia 0–60% są dostępne w zaawansowanym dopasowaniu. Eksport PNG zawiera cień, tryb przed/po i krycie pozostają tanim kompozytowaniem gotowego renderu. Zasoby GPU są zwalniane także po błędzie.

Testy: `tests/makeover-lab-optimization.mjs` — 390/1440 px, zmiany pikseli po zmianie siły/kierunku, eksport, zero ponownych uploadów geometrii dla krycia/przed-po, brak overflow. TypeScript, kompilacja, test kamery, test:studio i test:mobile. Dowody wizualne: `outputs/perspective-lab/shadow-390.png`, `shadow-1440.png`. Wizualizacja nadal koncepcyjna: brak przesłaniania przez obiekty na zdjęciu, kalibracji terenu i automatycznej analizy światła zdjęcia.

## Perspective Lab — optymalizacja 2026-10-28

Podgląd przed ustawieniami na mobile, białe tło, dotykowe punkty kalibracji, zaawansowane parametry w sekcjach rozwijanych. Zmiana modelu zachowuje narożniki. Krycie i przed/po kompozytują gotowy render bez ponownych uploadów geometrii; import zdjęcia nie koduje pośredniego PNG. Ustabilizowano lokalny zakres przeszukiwania ogniskowej. Zachowano eksport koncepcyjny i istniejące modele.

Walidacja: TypeScript, build, test:studio, test kamery, `tests/makeover-lab-optimization.mjs` (390/1440 px: eksport, brak overflow, zachowane punkty, ponowne wczytanie zdjęcia; zero dodatkowych uploadów GPU przy kryciu i przed/po). Ograniczenia: nadal kalibracja przybliżona, bez przesłonięć i pomiaru terenu.

## 2026-10-28 — podgląd 3D w Warsztacie

Dodano lekki odczytowy podgląd /workshop-preview?id=UUID, który renderuje faktyczną zapisaną konfigurację przez ten sam silnik 3D co Studio. Nie zapisuje szkicu i nie zmienia projektu. Homepage kolejkuje widoczne karty, tworzy renderowane miniatury 3D i pozwala obracać wybraną pracę; utrzymuje maksymalnie jedną aktywną ramkę/WebGL naraz. Komunikaty miniatury sprawdzają źródło, origin, ID i limit obrazu. TypeScript, build, test:studio oraz test preview 390/1440 (P1/O1/układ modułowy, snapshot, obrót, brak zapisu szkicu, maks. jedna ramka) PASS. Publikacja jest następnym krokiem.

## 2026-10-26 — jednoklikowy Warsztat

Nowy przycisk „Zapisz dla innych” publikuje bez formularza i moderacji układ, wzór i kolory w nowej tabeli D1 studio_workshop_designs. Serwer usuwa prywatne nazwy, obiekty, napisy, logo i wyceny; tytuł nadaje z katalogu. Ostatnie 10 prac jest publiczne od razu, z datą i kopią otwieraną w Studio. Losowy klucz umożliwia autorowi wycofanie publikacji. Endpoint waliduje projekt, źródło żądania, wielkość i atomowy limit 3 nowych projektów / 10 min; deduplikacja konfiguracji, parametryzowany SQL, żadnych poświadczeń WP w kliencie. Migracja 0011 jest wyłącznie addytywna, historyczne migracje niezmienione. TypeScript, test:studio, build, test:mobile i test D1/API/UI 390/1440: PASS. Publikacja tego źródła jest następnym krokiem; jej wynik trafia do potwierdzenia wydania.

## 2026-10-26 — projekty nawierzchni w ofercie

12 gotowych projektów Signature jest pierwszą karuzelą w istniejącym Nawierzchnia → Wzór, przed 25 kierunkami i 12 kompozycjami. Wybór stosuje atomowo rodzinę, wariant i paletę bez zmiany konstrukcji, sportu, obiektów ani otwierania okna. Usunięto konieczność otwierania Signature w modalu; płaski układ zastępuje wycofany eksperyment kroków z v104. Strona główna pokazuje osobną nawierzchnię, a wizualizację koncepcyjną po najechaniu/fokusie lub przełączeniu na dotyku. TypeScript, test:studio, build, test:mobile i test wyboru ofert 390/1440 px: PASS. Publikacja tego źródła jest kolejnym krokiem; wynik wdrożenia zapisujemy w oddzielnym potwierdzeniu wydania.

# Gamefields — Studio i Radar
## Kolekcje przed wariantami — 26.10.2026

Nawierzchnia→Wzór rozpoczyna się od25kolekcji. Dopiero kolejny krok odsłania12kompozycji wybranej rodziny. Jedna karuzela naraz, widok wszystkich kolekcji, łatwy powrót, losowanie innego wariantu i przejście do kolorów. Samo przeglądanie nie zmieniaProject; ponowny wybór tej samej rodziny zachowuje kompozycję. Modele,300wzorów i19palet zachowane. [Kontrakt i kontrola](docs/visual-studio-2026-10-25/KOLEKCJE_I_WARIANTY.md).

## Proste Studio: większy model i progresywna grafika — 25.10.2026

Dwie równe części przestrzeni roboczej: model/wybór, pionowo na telefonie i obok siebie na szerokim ekranie. Usunięto przełącznikModel3D, Plan edycji, Radar i powtarzane nagłówki. Nazwa na scenie, większe kwadratowe karty i model. Rozbudowa obsługiwanych rodzin bez aktywacji; zmiana dopiero przy świadomym kroku. Grafika ma Linie/Logo/Tekst, warstwy i położenie na żywym3D, centrowanie, duplikację i Cofnij. [Kontrakt, zakres i testy](docs/visual-studio-2026-10-25/PROSTY_PODZIAL_I_GRAFIKA.md).

## Duże karty kolorów i realistyczne materiały — 25.10.2026

Odcienie i części mają nazwane prostokątne karty zamiast małych kółek. Konstrukcja i nawierzchnia korzystają ze wspólnego wzorca wyboru. Trzy nowe makrografikiAI pokazują granulat, ażurowe płytki i sztuczną murawę; Malowana pokazuje aktualny wzór. Szczegóły próbek wyjaśniają ilustracyjne pochodzenie. Wspólny model3D, kolory, zapis i Cofnij zachowane. [Zakres, prompty i kontrola](docs/visual-studio-2026-10-25/KARTY_KOLOROW_I_MATERIALOW.md).

## Wizualne Studio — 25.10.2026

Karuzele rzeczywistych konstrukcji, ośmiu nawierzchni sportowych,25rodzin/12kompozycji i czterech faktur materiałów; wspólny wybór kolorów konstrukcji i nawierzchni. Nawierzchnia ma krótkie zakładki Wzór/Kolory/Materiał/Sport. Numery kompozycji zastąpiono grafikami. Swipe, kliknięcie, strzałki i klawiatura zmieniają wspólny projekt3D; bez autoplay i dodatkowych scenWebGL. Pięć dekoracji linii niezależnie od oznaczeń sportowych, zapis JSON i częściowa wycena wykonania. Białe mobilne Studio zachowuje ograniczony viewport. [Audyt, źródła i ograniczenia](docs/visual-studio-2026-10-25/AUDYT_I_WDROZENIE.md).

## Białe tło i mobilne Studio na jednym ekranie — 25.10.2026

Modele3D i budowanie modułowe korzystają z białego tła bez zdjęcia, gradientu i dekoracyjnej płaszczyzny. Mobilna wysokość jest ograniczona dostępnym viewportem; nagłówek układa się według treści. Przewija się tylko panel ustawień, a model pozostaje na miejscu. W poziomie model i ustawienia stoją obok siebie. Usunięto raportowanie scrollHeight do rodzica iframe. Nie zmieniono modeli, Project, cen ani danych. Szczegóły: MOBILE_WHITE_STUDIO_2026_10_25.md.


## Podgląd konstrukcji po kliknięciu menu — 25.10.2026

Wejście w Konstrukcję lub wybór boiska zamyka plan edycji i przywraca główny model 3D. Przycisk zmiany konstrukcji ma natychmiastową miniaturę stalowego modelu z katalogu, bez oczekiwania na zrzut canvasu (archiwalny W1 zachowuje zrzut). Gdy projekt zawiera tylko nawierzchnię, panel pokazuje wyraźnie oznaczony podgląd Street Arena 15. Podgląd nie dodaje konstrukcji, nie zmienia JSON ani ceny; właściwe dołączenie zgodnego modelu lub wybór innego boiska pozostaje jawne. Powrót do Nawierzchni przywraca rzeczywisty projekt. Na telefonach Konstrukcja rezerwuje osobny większy obszar na pełny model 3D nad przewijanym panelem ustawień.


## Rozdzielenie narzędzi: stal i nawierzchnie — 24.10.2026

Wybór ośmiu nawierzchni sportowych, ich wymiary i pliki przeniesiono do Nawierzchni, przed wzorem, kolorami, liniami i materiałem. Wybór oraz zamknięcie katalogu wracają do Nawierzchni; przycisk tego narzędzia pozostaje zaznaczony w katalogu. Konstrukcja pokazuje wyłącznie wybór stalowego modelu, zgodne dołączanie/odłączanie, kolory i rozbudowę. Nie zmieniono geometrii, danych projektu ani cen. Naprawiono dostęp do kolorów przyciskiem Panele także po dołączeniu konstrukcji do osobnej nawierzchni. Stałe formaty sportowe nie pokazują niezgodnych pól ręcznej zmiany wymiarów w katalogu konstrukcji.


## Osiem niezależnych nawierzchni 20 cm — 2026-10-24

Street Football 3×3 przeniesiono do osobnego katalogu nawierzchni wraz z koszykówką 3×3 i pełną, tenisem, padlem, siatkówką, pickleball i futsalem. Osobne modele Blender/GLB, miniatury, pole gry versus cała płyta, obrót 3D, JSON i wycena powierzchni. Street Football może dołączyć/odłączyć samą Street Arena 15. Pozostałe formaty wskazują brak zgodnej konstrukcji; nie skalujemy istniejących boisk. Stare projekty zachowane. [Wymiary, zgodność i ograniczenia](docs/SPORT_SURFACES_2026_10_24.md). Dalsze: dedykowane konstrukcje i zatwierdzenie technologii/stref dla lokalizacji.



## Miniatury konstrukcji w wyborze boiska — 2026-10-24

Karty „Wybierz boisko” pokazują nad nazwą i ceną statyczne rendery siedmiu własnych konstrukcji, w jednej perspektywie, bez nawierzchni i oznaczeń. Pliki WebP 640×400 mają łącznie około 130 kB i nie uruchamiają dodatkowych kontekstów WebGL. Street Football 3×3, będący projektem nawierzchni bez własnego modelu konstrukcji, ma osobną ilustrację i etykietę „Projekt nawierzchni”. Zachowano nazwy, ceny sprzedaży, wymiary, zaznaczenie i powrót do Konstrukcji.

Źródła i hashe renderów: public/arenas/thumbnails/manifest.json; odtworzenie: node scripts/build-construction-thumbnails.mjs (lokalny Chromium). Test mobilny sprawdza osiem załadowanych miniatur i wybór modelu na czterech szerokościach. Panel wyboru ma więcej miejsca na porównanie kart. Geometria i dane projektów nie zmienione.

## Panel Konstrukcja jak Nawierzchnia — 2026-10-24

Górny rząd Konstrukcji używa układu Nawierzchni: miniatura bieżącego modelu 3D, nazwa boiska i jedyne „Zmień boisko”, obok Bandy/Rama/Bramki. Miniatura pochodzi z istniejącego canvasu, bez kolejnego WebGL ani zapisu do projektu. Usunięto „Zmień boisko” spod podglądu i działanie kliknięcia etykiety modelu na scenie. Wybór modelu i anulowanie wracają do Konstrukcji. Moduły pozostają w tym panelu w rozwijanej sekcji; przycisk Budowanie modułowe otwiera ją bezpośrednio. Geometria, kolory, nawierzchnie, zapis projektów i prywatność kosztów zachowane.

Sprawdzenie: tsc, build, test:studio i wymagany test:mobile; osiem przypadków panelu (P1/O1 × 4 szerokości) sprawdza miniaturę, trzy kolory, jedną zmianę modelu w panelu i brak aktywnego wyboru na scenie.

## Wspólny edytor modułów i kolorów — 2026-10-24 (zastępuje osobny edytor Studio93)

- Budowanie modułowe działa w panelu Konstrukcja na tym samym obracanym modelu, razem z kolorami band/ramy/bramek, tekstem/logo oraz nawierzchnią i grafikami. Nie otwiera modalu ani iframe.
- Naprawiono znaki obrotu komponentów: panele Panna Octa są styczne do obrysu i dochodzą do sąsiednich słupków; bramki Panna Grid oraz Panna Octa wystają na zewnątrz. Źródłowe GLB zachowano bez deformacji (1:1).
- Parametry są częścią Project.modular z rewizją GF-STUDIO-MODULAR-2: wspólne Cofnij/Ponów, szkic, JSON, specyfikacja, warianty i podgląd A/B. Zmiana produktu czyści niezgodne moduły. Jedna rodzina na boisko; P1/O1/W1/Street15 bez potwierdzonego układu modułów nadal mają model bazowy.
- Panna Grid rośnie całymi panelami na długość/szerokość; Panna Cage 90/180 obsługuje poziomy; Panna Octa ma stały obrys. Bramki i wejścia 0–2. Obrys oraz ilość nawierzchni wynikają z konfiguracji; warstwa ma 20 cm. Kolory i grafiki nie znikają przy rozbudowie.
- Cena konstrukcji i montażu modułowego: do ustalenia; nie podstawiamy ceny bazowego produktu. Nawierzchnię wyceniamy według aktualnego obrysu. Koszty produkcji pozostają wyłącznie na serwerze. BOM wykonawczy/połączenia/kotwy nadal niezatwierdzone.
- Historyczny silnik inspektora OS i manifesty zachowane bez zmian. Poprawiony adapter Studio ma oddzielną rewizję i hashe komponentów. Starsza trasa /modular zachowana z poprawionymi obrotami; stare szkice nie są usuwane.
- Sprawdzenie: 243 układy (bramki na zewnątrz, dojście końców Octagonu do słupków, rodzina/skala), hashe źródeł, walidacja modułów, JSON i rewizje wariantów, faktyczna powierzchnia i częściowa kalkulacja. Przeglądarka: 4 modele × 390/1440 px, kolory + nawierzchnia + moduły, obrót bez utraty pozycji, Cofnij/Ponów, import/eksport, zmiana poziomów i brak ceny bazowej.
- Regeneracja metadanych po zmianie geometrii: node scripts/build-studio-modular-sources.mjs; test node tests/studio-modular-geometry.mjs. Bundle historycznej trasy: node scripts/build-studio-modular.mjs z Three.js 0.180.0 w NODE_PATH.

## Studio — wspólne kolory, jeden podgląd 3D i budowanie modułowe (2026-10-24)

- Konstrukcja używa tych samych kontrolek `.studio-color` co nawierzchnia: Bandy, Rama, Bramki. Usunięto osobne presety.
- Własne modele oraz porównanie wariantów mają jeden obracany podgląd 3D. Boczny i Z góry usunięte. Historyczne dane kamer/projektów pozostają czytelne.
- „Budowanie modułowe” otwiera w Studio zachowany silnik OS, lokalne komponenty GLB i osobny zapis GF-OWNED-ASSEMBLY-1. Street Field zwiększa długość/szerokość pełnymi modułami; Circle Cage zmienia poziomy; Octagon zachowuje stały obrys. Jedna rodzina na konfigurację, skala części 1:1. P1 nie otrzymał niepotwierdzonego układu modułów.
- Edytor modułowy ma niezależny lokalny szkic, import/eksport i osobną wycenę. Nie zmienia projektu Studio, jego nawierzchni ani ceny bazowej. Brak zatwierdzonego BOM wykonawczego i kotwienia. Koszty produkcji nadal wyłącznie po stronie serwera.
- Źródło OS zachowane w components/gamefields/owned-modular; silnik bez zmian względem lib/vendor/owned-modular. Publiczny bundle zawiera Three.js 0.180.0, lokalne GLB i deklarację MIT. Opcjonalna regeneracja: NODE_PATH wskazujący instalację Three.js 0.180.0, node scripts/build-studio-modular.mjs (esbuild 0.28.0). Główny build korzysta z zachowanego bundla.
- Weryfikacja: tsc, test:studio i build; test przeglądarkowy modułów 390/1440 px: 3 rodziny, wzrost instancji, skala 1:1, zapis/import/odzyskiwanie, zachowanie koloru Studio. Dodatkowe testy mobilne i orbitowania zapisują wyniki w outputs.

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


## 23.10.2026 — priorytety po88: renderer,3D i robocze stawki

Zrealizowano programowy zakres [priorytetów](docs/PRIORITIES_2026_10_23.md): profil Street Field i cache lokalizacji GL/wymiaru panelu; granice czasu obrazu/modelu/generacji, utrata WebGL i ręczne retry, token ABA; opcjonalne porównanie3D A/B z jedną dodatkową sceną i wspólną kamerą; bieżące ceny i jawne pokrycie obiektów2D/3D. Cache materiałów usuwa nieudane lub wygasłe wczytania, aby kolejna próba nie odziedziczyła nieskończonego oczekiwania.

Właściciel potwierdził brak danych i polecił podstawić wartości: osobna robocza karta6nawierzchni/29typów wyposażenia/montażu/transportu/personalizacji, oznaczeniaAPI/UIworkingAssumptions, bez zatwierdzonego VAT;8cen konstrukcji zachowano. [Założenia i kwoty](docs/WORKING_RATES.md). Nieznane dodatki nadalpartial.

Zaktualizowano audyt8modeli/25zasobów oraz F04(26artykułów), zachowując niezatwierdzone statusy. [Checklista](docs/ENGINEERING_COMMERCIAL_GAPS.md) i szablon danych przypinają rewizje. technicalBill.rows=null; nie dobrano fikcyjnych kotew lub fundamentów. Pełne3Dswobodnego wyposażenia wymaga własnych modeli; obecne pominięcia jawne obok planu2D. Fizyczne urządzenia i pełny budżet wydajności pozostają otwarte.

Kontrola wydania obejmuje TypeScript/build/domain,40nawigacjiO1, fault-injection375/1440,3D/quote375/1440, pełne mobile+Surface+nowe areny,58przypadków Circle,84rastery i60stanów tekstur. Raporty wdocs/priorities-2026-10-23; końcowy profil i receipt publikowane obok centralnego raportu. Czasy profilowane nie sąABBA/GPU/FPS i nie dowodzą ogólnego przyspieszenia. Wewnętrzne arkusze produkcyjne pozostają poza publicznym repo. Stawki robocze nie zatwierdzają geometrii lub finalnej oferty.


## 23.10.2026 — zgodność Gamefields.eu.txt i budżet palety

Opcjonalna polityka kolorów w nowej karcie roboczej v2; stare karty zachowują wyniki. Hook zachowuje kolory i paletę; Podsumowanie rozdziela dopłatę od złożoności wzoru. To budżet wybranych kolorów, nie zatwierdzona receptura farb. Szczegóły: [zestawienie](docs/GAMEFIELDS_EU_RECONCILIATION_2026_10_23.md). Testy i publikacja odnotowane w centralnym raporcie. Nadal wymagane dane konstruktora, własne modele akcesoriów, zatwierdzone ceny/VAT i badania na urządzeniach.


## 24.10.2026 — koszty wewnętrzne, ceny sprzedaży

Wcześniejsze stawki są kosztami produkcji zgodnie z decyzją właściciela. Klient otrzymuje wyłącznie ceny sprzedaży przeliczone na serwerze. Tabele przeniesiono do biblioteki wewnętrznej; nowe źródło i testy nie publikują kosztów. [Zakres i ograniczenia](docs/SALES_PRICE_PRIVACY.md). Dawne rewizje mogą nadal zachowywać wcześniej publiczne dane.


## 24.10.2026 — skupione Studio i obracany model

Wyposażenie i wybór scenerii wyłączone w Studio; większe grupy kolorów konstrukcji; Boczny/Z góry/Model3D z obrotem i bieżącymi teksturami. Starsze dane pozostają w JSON, ale niedostępne wyposażenie nie jest prezentowane ani wyceniane. [Zakres i testy](docs/STUDIO_UX_2026_10_24.md). Ceny sprzedaży nadal są przeliczane na serwerze, koszty ukryte.


### Panna Court v6 — 2026-10-28

Replaced `p1` with the approved CAD construction: 16 single inner sheets, external supports, no ground and planar perforation mapping. Optional Studio surface is unchanged. Added downloadable GLB, DEFAULT/HOVER/detail images, a rendered catalog thumbnail, reproducible conversion and geometry validation. Passed: TypeScript, Studio suite, build, mobile/desktop checks (375/390/430/1440), material switches, JSON roundtrip, camera and Radar navigation. Standalone WebGL check: 142 meshes, no browser/GL errors. WordPress integration edits are scoped to Panna Court on home page 3462; release workflow and checks are recorded in `deployment/PANNA_COURT_V6_STATUS.md`.

Panna Court geometry is fetched separately from `/arenas/p1.json` to keep application bundles below the hosting asset-size limit. Base construction stays ground-free; the selected Studio surface is added separately.


### Panna Play O1 detail revision 2 — 2026-10-28

Replaced the previous O1 construction with the approved existing-model detail revision. The Studio loads the exact GLB separately (SHA-256 `280d6ae80365ac4909326aea1df4990c820adbf004b601ef16bee34b62b68b30`): 58 construction objects, 12 single inner sheets, 288,522 triangles, no ground. The adapter preserves every triangle, separates artwork sides and normalizes the curved panel UVs. Existing independent surface, project colours, patterns, Panna Court, Workshop and Radar are preserved. Added five product images and the updated O1 catalog thumbnail. Asset sizes remain below the hosting file limit.

Passed TypeScript, Studio suite, exact GLB/adapter checks, build and mobile suite at 375/390/430/1440 widths, including colour/branding, camera, JSON roundtrip and Radar navigation. Thumbnail scripts resolve the existing Wrangler esbuild dependency so clean pnpm installs can build without an undeclared root package. WordPress changes are scoped to Panna Play on page 3462 and are applied only after this Site release is published; see deployment/wordpress-o1-v2-pending.json.
## 2026-10-28 — Makeover: laboratorium perspektywy na zdjęciu

Wydanie następne: modele 3D są ładowane z `/arenas/` dopiero po wyborze konstrukcji (W-1 jako GLB), aby usunąć przekroczenie limitu 25 MiB dla pojedynczego pliku aplikacji.

Dodano niezależną podstronę `/makeover-perspective-lab` i link w nawigacji aktualnego Studio. Zdjęcie pozostaje w przeglądarce; użytkownik zaznacza cztery narożniki, wybiera model W-1, Panna Circle lub P-1, a osobny renderer WebGL nakłada oryginalną siatkę na zdjęcie. Eksport PNG jest warunkowany podstawową kontrolą matematyczną i jakościową. Rozmiar podstawy jest liczony z oryginalnego bounding box modelu, **nie** z wymiarów katalogowych. To wizualizacja koncepcyjna, bez przesłonięć, cieni, korekty dystorsji i certyfikacji wymiarów. Dotychczasowe Studio, projekty, API i cennik pozostawiono bez zmian. Kontrole: TypeScript i build PASS, jednostkowy test kamery PASS, kontrola siatek PASS. Test Playwright wymaga środowiska z Chromium; obecny instalator Chromium zwraca błędny ZIP. Nie deklarować pełnego testu E2E bez potwierdzenia przeglądarkowego.




### Shared product presentation v3 — 2026-10-28

Panna Play and Panna Court now have matching orthographic cameras and the same three-light/shadow rig. Added four 1920×1080 overview renders (DEFAULT/HOVER per model). The source CAD, GLB and model geometry are unchanged. Native compositor processing preserves opaque product pixels and fades only the shadow tail around the product silhouette; all image-edge alpha values are zero. The manifest records source hashes, camera rotations and image QA. Reproduction uses scripts/render-product-presentation-v3.py followed by scripts/refine-product-shadows-v3.py.

WordPress rollout targets only the two product hero media blocks: responsive 16:9 width, larger desktop image column, updated overview/gallery URLs and matching colour-hover behaviour. Staged browser checks passed at 390/744/1440 px; the 744 px hero uses a 704×396 px image area, with no horizontal overflow. TypeScript, Studio, build and the existing mobile/desktop suite passed. Publish assets before the bounded WordPress edits and purge cache after them.

Hosting integration check: the concurrent Makeover lab loads its existing Circle/P1 JSON meshes on selection, preserving their bytes and dimensions while keeping the JavaScript asset below the 25 MiB hosting limit. No model geometry or photo-upload handling changed.

Post-merge verification: existing Makeover browser smoke passed in Chromium at 390/1440 px, including model loading and enabled PNG export. The route remains DRAFT; broader Safari/visual acceptance stays on the owner backlog. Largest deployed asset is below 25 MiB.


### Fixed-camera colour preview v4 — 2026-10-28

Homepage preview for Panna Play and Panna Court offers four small accessible colour swatches: native gray, red, Miami blue and Earth green. Both perforated sheet and painted frame use the selected material colour; original geometry, perforation, hardware, cameras and shadow rig are preserved. Hero interaction no longer swaps camera on pointer hover. Gallery alternate views remain available independently. Assets: public/product-presentation/v4; bounded WordPress insertion: deployment/hero-colours-v4.js.


### Construction card detail v5 — 2026-10-28

The steel-construction category card uses a close-up from outside the existing Panna Court v6 corner assembly. Four native material renders show gray/red/blue/green without changing camera, geometry or perforation. Compact accessible radio swatches replace alternate whole-court views in this card only; hero and product galleries retain their existing behaviour. Assets live in public/product-presentation/v5; bounded WordPress insertion is deployment/construction-detail-v5.js.
### GAMEFIELDS CREW — 2026-10-28

Global fixed four-guide selector is added to the shared layout, covering Studio, Radar and Makeover. Guide choice is stored only in browser localStorage; no project JSON, pricing, renderer or API schema is altered. The Studio emits an in-browser context event with sport, dimensions, surface, pattern and view so each guide can give distinct, qualified contextual tips. Initial guide replies are curated rules rather than a live AI conversation. Character heads currently use illustrative placeholders pending production 3D avatar sprites.

### CREW AI profiles and conversation gateway — 2026-10-28

Four bounded expert instructions live in `lib/crew-experts.ts`. `/api/crew` supports a read-only availability check and a POST gateway to OpenAI Responses API; it validates the guide and conversation size, limits output, disables response storage, passes bounded Studio context and returns a clear disabled state while `OPENAI_API_KEY` is unset. The guide UI displays a real conversation form only if the backend is configured. Never put the API key in browser code. Configure production `OPENAI_API_KEY` as a secret and optionally `OPENAI_CREW_MODEL` before enabling live traffic, with billing and rate limits considered.

### CREW knowledge scope — 2026-10-28

Expertise is limited to street soccer / street football (synonyms, one format family) and panna football (distinct 1v1 format). The curated source registry `lib/crew-knowledge.ts` now contains Gamefields model facts with provenance and dates. Basketball 3x3 is explicitly excluded from CREW's specialist sports narratives. Prompts have individual voice/method instructions. Automated web ingestion is **not** enabled: future updates must validate authoritative sources before promotion to approved facts.

### CREW verified knowledge registry — 2026-10-28

The new D1 migration `0012_crew_knowledge.sql` adds immutable fact versions, append-only publish/withdraw/restore events, and ingest run logs. `/api/crew/knowledge` lists active facts and provides administrator-token-protected candidate publication, history and rollback. Candidates require two approved independent source hosts, matching quoted evidence fetched from those sources and a separate AI semantic-support decision. `/api/crew/refresh` is a token-protected bounded research pass (up to three candidates), which can later be invoked by a linked cloud schedule. The conversational API reads active facts with graceful fallback. This is designed to fail closed: without `CREW_KNOWLEDGE_ADMIN_TOKEN` and `OPENAI_API_KEY`, ingestion and administration are disabled. Cloud scheduling must not be activated until writer access, schema migration, cost limits and a full readback test are confirmed. Never put secrets in client code or task descriptions.



### Perforated steel macro v6 — 2026-10-29

Steel-construction category media now shows only an edge-to-edge macro of powder-coated perforated sheet: no posts, frames, court or background scene. Actual open RV5–8 geometry (5 mm holes / 8 mm staggered pitch), transparent holes, a fixed camera and four existing paint colours. Sample thickness is a 1.5 mm visualisation assumption; original product models remain unchanged. Colour controls and hero behaviour are preserved. Asset evidence: public/product-presentation/v6/manifest.json; widget: deployment/perforation-macro-v6.js.


### Perforation-pattern preview v7 — 2026-10-29

Prepared a category-card preview with six independent perforation choices (round, square, hexagon, wave, leaf and elongated oval), replacing this card's colour-only controls. Fixed native Blender camera, transparent holes and real open geometry; generic original sample patterns inspired by the interaction described on MEVACO Individual Design, without copying branded ornaments or images. Hero and product geometries remain unchanged. Standalone review: /product-presentation/v7/preview.html. Homepage insertion is prepared in deployment/perforation-patterns-v7-pending.json; WordPress publication awaits available API quota or an explicitly requested banked reset.


### Product-only 3D preview v13 — 2026-10-29

Added /product-viewer for the existing six homepage constructions. It loads the approved O1 GLB or existing arena meshes on demand, omits floor/slab geometry, retains the selected coating and provides orbit, zoom and reset without Studio editing controls or project persistence. O1/P1 reuse the current PBR renderer with WebGL1 recovery; failed loads can be retried. Closing the WordPress modal destroys the iframe and its renderer.

The bounded homepage handoff opens this viewer first and offers a separate Personalizuj w Studio CTA. That explicit CTA carries an allowlisted arena/coat into Studio; saved Workshop imports are not recoloured. It uses the direct Studio origin because the existing WordPress Studio gateway does not forward coat; gateway source is unchanged. Original CAD/GLB geometry and other product experiences remain unchanged. Unit and browser evidence lives in tests/construction-preview*. Publish the viewer before applying deployment/product-viewer-modal-v13-pending.json to page 3462.


### Goal-panel carousel and live preview colours v14 — 2026-10-29

The product viewer adds four coating choices below the main 3D scene. Coating updates repaint the same renderer without refetching geometry or resetting orbit/zoom. A companion modal carousel provides six complete native goal-end assemblies viewed orthographically from outside, in all four coatings (24 transparent PNGs in public/product-goals/v14). Selecting a panel opens its isolated assembly in the main viewer; Całe boisko restores the complete construction. Source meshes are selected as whole objects and original CAD/GLB data remain unchanged.

An origin/source/arena/view/nonce-checked message updates the Studio CTA and carousel thumbnails to the current viewer colour. Late messages from an earlier frame are ignored. Thumbnails are reproduced by scripts/build-goal-panel-thumbnails.mjs after building the viewer. WordPress handoff: deployment/goal-carousel-modal-v14-pending.json, applied only after the viewer and PNG assets are deployed. Existing Studio quote/recovery changes are retained.

Product preview v15: three isolated native construction elements (side panel, goal panel, goal), each with independent live coating controls; full court selection remains independent.

V16: independent element swatches update matching parts on the complete court without remounting the renderer or resetting camera. Parent bridge verifies origin, frame, arena and session nonce.


### Panna Cage 90 — CAD r2, 2026-10-30

Rebuilt Cage 90 from source-derived FreeCAD BRep templates, then exported a detailed Blender master and a separate web LOD from the same CAD. Studio and the existing product-only viewer now load the binary GLB with editable frame/panel/goal groups, PBR lighting and contact shadows. The original independent 20 cm surface is preserved exactly. Updated neutral/colour/goal renders and carousel metadata refer to this revision.

Validation: finite GLB/JSON attributes, valid indices, 346,762 construction triangles, 6 m internal diameter, 0.9 m height and 6.72251 m total goal extent. Wire mesh is real geometry, not a perforated-sheet substitution. Visual assumptions and source hashes are in models/panna-cage-90-v2/cad-validation.json. CAD/STEP/Blender and generators are retained with the source. Shared modular-family components and Cage 180 await their own CAD revision.


### Panna Cage 180 — CAD r2, 2026-10-30

Source-defined two-level assembly now shares the Cage 90 CAD r2 templates: twelve standard modules, two lower goal modules and two vertically paired entry modules. Dedicated detailed Blender master uses linked mesh instances; binary GLB retains smooth normals and editable frame/panel/goal groups. Existing Studio and product viewer use the same revision with PBR lighting and contact shadow; independent 20 cm slab remains unchanged. CAD assumptions and source hashes are retained with the model. Shared F05 modular-family migration remains separate.


## 2026-11-02 - Nawierzchnie Pro

Integracja z `DamianRyh/gamefields-os`, gałąź `studio-skin-2026-11`, pakiet `integrations/studio/surface-pro-2026-11/`. Baza pobrana z bieżącego repozytorium Sites: linia v154 -> v155 ze skórką. Dodano 16 rodzin (192 kompozycje), 12 palet i 16 Signature Pro przed 12 dotychczasowymi presetami: razem 41 rodzin, 492 wzory i 31 palet. Stare 25 rodzin i ich 300 renderów porównano z bazą v154: wynik identyczny. Zregenerowano SVG, WebP i katalog ofert oraz bundle miniatur warsztatu. Schemat projektu, modele, stawki i migracje pozostają bez zmian. Profil wykonania Pro korzysta z dotychczasowego fallbacku geometry; opcjonalnego profilu cenowego nie dodawano.

Skórka `studio-skin-2026-11.css` i Inter są identyczne z pakietem GitHub i mają jeden import jako ostatni CSS. Rejestr publikacji: `DEPLOYMENT.md`.

Limit paczki Sites: pierwsza próba zapisu została odrzucona przed utworzeniem wersji (limit 256 MiB po rozpakowaniu). Nowe podglądy Pro WebP są generowane jako karty 384 x 216 px (jakość 0,60); pełne 1672 x 941 zachowano lokalnie w outputs/surface-pro-qa/high-resolution. Wektory SVG pozostają pełne. Dodatkowo bezstratnie zoptymalizowano kodowanie 3 istniejących PNG scenerii, oszczędzając 695520 bajtów; sprawdzono identyczność rozmiaru, trybu i każdego piksela oraz zachowano oryginalne chunki metadanych PNG. Żadne zdjęcie, wzór ani model nie zostały usunięte. Raport: outputs/surface-pro-qa/lossless-compression.json.


## 2026-11-02 — Studio: następne kroki 2026-11

Wdrożono punkty 1–6 z `integrations/studio/next-2026-11/CODEX.md` (blob b69992b3358a6231cd8f5d6a60a39ac8de59e314) na źródłach Sites v157: link do pełnej wersji projektu z kolorami i opcjonalnym patternSeed (starsze JSON-y zachowują zgodność, brak pola oznacza 0), cztery kroki z postępem, różnice cen z dotychczasowego API wyceny, potwierdzany reset z kopią szkicu i Cofnij, miniatury IntersectionObserver i link do planera. Każdy punkt ma osobny commit; późniejsze poprawki QA są dodatkowymi commitami.

CSS kart biblioteki pochodzi z aktualnej gałęzi GitHub `studio-skin-2026-11`, blob 1bfdff93912b617a913434f3aaf20cbb4d7449f4. Nie zmieniono rate card, migracji, modeli ani istniejących wzorów. Biblioteka nadal zawiera 492 wzory, w tym niezmienione 300 dawnych. Szczegóły kontroli, pomiarów i publikacji: DEPLOYMENT.md.


## 2026-11-04 — Konwersja i przekazywanie projektu

Na bieżących źródłach Sites v158 dodano pobieranie koncepcyjnego widoku z góry w PNG i przycisk „Wyślij projekt do wyceny”. WordPress: naprawiono sygnał gotowości odbiorcy w samodzielnym Studio oraz dodano formularz nad osadzonym edytorem, z weryfikacją origin/source i dokładnym ACK. Wspólny CF7 3758 ma kroki potrzeba → miejsce (opcjonalne zdjęcie do 5 MB) → kontakt; jedynym wymaganym polem jest e-mail. Formularz dostępny także na /kontakt/. Przekazywane są dodatkowe parametry kolorów i seed.

Homepage otrzymał trzy obejrzane autentyczne zdjęcia z istniejących mediów, drugi CTA do opisania miejsca i poprawiony opis orientacyjnego budżetu. Stara prezentacja sklepu nie pokazuje czterech ręcznie wpisanych cen, obietnicy 48h ani niedokończonego linku; zachowano produkty i stawki. Referencje marek i ceny właściwych produktów WooCommerce nie zostały zweryfikowane i wymagają potwierdzenia właściciela. Link Radaru zmieniono dopiero po jego wyraźnej akceptacji. Usunięto automatyczne wczytywanie niewidocznej piłki po 6 s (pozostaje observer i scroll).

Testy aktualnego WordPress przy 390 i 1440 px: PASS, bez wysyłania kolejnych wiadomości. Potwierdzono pełne parametry modelu/base/seed/estimate, formularz, walidację e-maila, wybór syntetycznego zdjęcia, trzy fotografie, powrót do edytora i brak przepełnienia. PNG pobrany i obejrzany. Jeden test mailowy, wyraźnie zaakceptowany przez użytkownika, zakończył się komunikatem WordPress „wysłane”; odbioru w skrzynce nie sprawdzono niezależnie. Zewnętrzny PageSpeed przekroczył limit 55 s — brak wiarygodnego wyniku punktowego.

Źródła integracji: integrations/wordpress/conversion-2026-11. Backupy, zrzuty i logi: /Users/mac/Documents/Gamefields/outputs/conversion-2026-11-04. Końcowe kontrole i publikacja: DEPLOYMENT.md. Nie zmieniono migracji, modeli, stawek ani 492 wzorów.

### Wycena indywidualna
Studio pokazuje kontakt do wyceny zamiast kwot i różnic cenowych. Podsumowanie i pakiet do zapytania przekazują konfigurację bez automatycznej kalkulacji; obowiązujące stawki i mechanizm obliczeń pozostają bez zmian.
