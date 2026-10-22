# Grafiki paneli — profilowanie i optymalizacja

## Zakres

Pierwsza iteracja po Studio81: współdzielenie rastera PNG między panelami o identycznej recepturze w ramach jednej generacji aktualizacji. Nie zmienia źródeł modeli, cennika, projektu JSON, kierunku mapowania grafiki ani własności tekstur GPU. Osobne tekstury GPU i ich upload pozostają.

Circle Cage2 zawiera35meshes/16paneli; wszystkie16receptur wynikają w2048×768. Cache kluczowany jest wersją algorytmu, dokładnym zaokrąglonym/clampowanym width,768,panelColor,text,src. Pola finish/frameColor/goalColor/side nie wpływają na raster; wybór paneli i dotychczasowy klucz Renderer pozostają osobno. Factory tworzona raz na efekt render-generation. Odrzucony Promise jest usuwany do retry; mapa nie żyje jako globalny cache.

## Profilowanie

Oddzielny tests/renderer-panel-profile.mjs obejmuje CircleCage2/1440/3powtórzenia. Instrumentuje toDataURL,fillText,texImage2D,drawArrays i czas do image.onload. Jest przeznaczony do liczby prac i obserwacji submission; wrappery wpływają na czas. Nie mieszać jego czasów z nieinstrumentowanym benchmarkiem. submissionMs to czas synchronicznego wywołania, nie pomiar GPU; asyncTotalMs sumuje nakładające się przedziały, nie czas całej operacji. Reset przed otwarciem Konstrukcji może uwzględniać dodatkowy draw/layout.

W trzech powtórzeniach operacji panel-text kodowania PNG spadły16→1, tekstowe fillText16→1; uploady tekstur nadal16. Nie deklarujemy zmniejszenia pamięci tekstur GPU ani liczby drawcalls. Następne profilowanie powinno objąć pozostałe upload/draw zamiast zakładać pełne usunięcie kosztu.

## Zgodność i bramki

Test panel-artwork-equivalence używa prawdziwych geometrii138paneli/8modeli (W1 zGLB),21szerokości i84 dokładnych porównań RGBA: empty/text/logo/both. Sprawdza współdzielenie dokładnie jednej Promise,16paneli→1PNG, unieważnianie koloru/tekstu/logo, ignorowanie pól niebędących wejściem rastra, izolację generacji i retry błędnego decode oraz pojedynczego błędu encode. Wszystkie PASS. Pierwsza próba harnessu przekazywała całe duże geometrie i wyczerpała heap Node; test ograniczono do potrzebnych {id,group,v}, bez zwiększania limitu pamięci. Nie był to wynik różnicy obrazu.

Wspólny nieinstrumentowany harness renderera mierzy aktualną generację tak samo jak wStudio81. Przed i po:8modeli×2szerokości×5powtórzeń×6operacji=480próbek każdej serii;48hashy końcowego canvas dla trzech kamer poza czasami. Nowe wejścia/metadane harnessu są takie same w parze; wcześniejsza pierwsza baza Studio81 zostaje zachowana historycznie.

## Granice i dalsze prace

Lokalny M1/Chromium/SwiftShader/DPR1, nie telefon, sieć produkcyjna, GPU presentation aniFPS. Jedna para serii opisuje zaobserwowaną zmianę, nie SLA lub gwarancję dla klientów. Każdy wzrost pozostaje jawny w porównaniu; nie usuwać wolnych próbek. Budżet czasowy produktu wymaga rozrzutu porównywalnych serii i uzgodnionych celów urządzeń.

Deterministyczny budżet pracy tej iteracji: co najwyżej jedno kodowanie PNG na unikalną recepturę w generacji (CircleCage2:1 zamiast16). To testowana granica zasobu, nie próg czasu.

Znany wcześniejszy problem: ID paneli CircleCage2 nie mają końcówek inner/outer, więc dotychczasowy filtr stron nie mapuje tych wartości. Zachowano go w tej iteracji; wymaga osobnego kontraktu stron/meshów i testów. Porównanie końcowego obrazu dotyczy domyślnego side=both. Nie przedstawiać cache jako naprawy wyboru stron.

Powiązanie OS–Project, zatwierdzone połączenia i rewizje wykonawcze pozostają osobnym etapem; technicalBill.rows=null i manufacturingReady=false nadal celowe.

## Wynik pary porównawczej

Przed i po:480próbek/96komórek/0błędów każdej serii. **48/48canvasów trzech kamer ma identyczne SHA256 i wymiary**. Test84RGBA ponowiony z jednąfactory perfixture przez21widths, aby wykrywać kolizję różnych rozmiarów; PASS.

| CircleCage2 | Przed mediana [ms] | Po mediana [ms] | Zmiana |
|---|---:|---:|---:|
| panel-text / 375px | 1071.6 | 911.4 | -14.9% |
| complex-scene-cached-redraw / 375px | 1026.2 | 748.8 | -27.0% |
| panel-text / 1440px | 2017.2 | 1812.4 | -10.2% |
| complex-scene-cached-redraw / 1440px | 1894.0 | 1575.1 | -16.8% |

W całej parze55median zmalało,37wzrosło,4bez zmiany. Wszystkie16median panel-text zmalało; complex-scene-cached-redraw zmalało w15/16komórek. P1/375px w drugim scenariuszu wzrósł533→544,5ms (+2,2%), przy spadku największej próbki870,6→650,4ms. Największy wzrost mediany w całej macierzy to druga nawigacja CircleCage2/1440:791,2→850,8ms (+59,6ms). Nie ukryto tych wyników ani nie przypisano automatycznie do optymalizacji; pojedyncza para i nakładający się rozrzut nie dowodzą regresji/SLA ani przyspieszenia każdego procesu.

### Dowody

- [Powtórzona baza v81](panel-artwork-2026-10-22/v81-repeat.json) — apphashy Renderer i Preview sprawdzone z opublikowanym e1e6666b96e006c72ab4ebc0e0a953d36214fabf.
- [Kandydat](panel-artwork-2026-10-22/v82-candidate.json) — hashe aplikacji i nowego helpera zweryfikowane przed publikacją.
- [Porównanie96komórek i48obrazów](panel-artwork-2026-10-22/comparison.json).
- [Profil przed](panel-artwork-2026-10-22/panel-profile-baseline.json) i [profil po](panel-artwork-2026-10-22/panel-profile-candidate.json) — liczba kodowań/uploadów; nie pomiarGPU. Pole historyczne baseCommit profilera oznacza bazę źródłową wcześniejszego harnessu; dokładny kod aplikacji identyfikują hashe.
- [Test pikseli/cache/retry](panel-artwork-2026-10-22/equivalence.json).

Pliki skopiowano bajt w bajt z outputs; ścieżki wejściowe comparison wskazują oryginalne nazwy uruchomienia, a hashe pozwalają zweryfikować kopie. Kod aplikacji po pomiarze niezmieniony. Wydanie i sourceSHA podaje zewnętrzny raport wdrożenia.

### Wolniejsze maksima zachowane w raporcie

Lepsza mediana nie oznacza szybszej każdej próbki. Poniższe maksima z operacji grafiki wzrosły; nie usuwano ich z porównania.

| Model / widok / operacja | Max przed [ms] | Max po [ms] |
|---|---:|---:|
| p1 / 1440 / complex-scene-cached-redraw | 1522.7 | 1688.9 |
| circle-cage-1 / 1440 / complex-scene-cached-redraw | 725.5 | 747.3 |

Import W1/375 wzrósł w medianie48,8→65,7ms (+16,9ms). Podajemy zarówno różnice ms jak i procentowe, aby nie wyolbrzymiać małych baz. Priorytetem kolejnej iteracji jest kontrolowane profilowanie pozostałych uploadów/draw, a nie deklaracja, że wszystkie operacje przyspieszyły.

## Bramki wydania

PASS: TypeScript --noEmit, build, test:studio,84RGBA/cache/retry, renderer-comparison96komórek/48identycznychcanvasów, quote-engine, construction-pricing, pełne test:mobile96aren/48Street/16materiałów/JSON/Radar w375/390/430/1440 oraz Surface7viewport. Niezależne przeglądy receptury/cache, integracji i wyników PASS. Nie uruchamiano formularzy, zmian SQL ani podmiany geometrii.

## Dalsza aktualizacja stron

Wcześniejszy problem inner/outer CircleCage opisany powyżej naprawiono w następnym etapie jako kontrakt wizualizacji faset. Poprzedni opis granic wersji82 pozostaje historyczny. Szczegóły, dodatkowy koszt jednostronnych wrapperów i dowody: [CIRCLE_PANEL_SIDES](CIRCLE_PANEL_SIDES.md).
