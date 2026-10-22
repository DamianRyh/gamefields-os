# Powtarzalny pomiar renderera — 22.10.2026

## Kontrakt

Lokalny zbudowany Worker, Chromium headless/SwiftShader, DPR1, wysokość1000px. Osiem modeli, szerokości375/1440, pięć powtórzeń i sześć operacji dają480 próbek. W1 odtwarza jawny historyczny szkic na /; pozostałe używają publicznych parametrów arena. Nie traktować ścieżek wejścia jako identycznych.

Punkt końcowy to finalne wywołanie draw aktualnej generacji po oczekiwaniu na jej tekstury. Nie mierzy prezentacji GPU, FPS, sieci produkcyjnej ani telefonu. Nowy kontekst ma pusty cache przeglądarki; cache systemu i lokalnego serwera pozostają rozgrzane. Druga nawigacja zachowuje kontekst; liczniki Resource Timing opisują zasoby, nie gwarantują pełnego trafienia cache.

Operacje: startup-fresh-context, startup-same-context-navigation, panel-colour, panel-text, complex-project-import, complex-scene-cached-redraw. Złożony SVG zawiera500 statycznych ścieżek. Import obejmuje walidację JSON, kopię recovery i renderowanie; kolejne rysowanie korzysta z przygotowanej tekstury. Nie nazywać tego testem maksymalnej dopuszczalnej złożoności SVG.

Surowy raport zapisuje próbki, medianę/maksimum, runtime, źródła geometrii i SHA256 wejść kodu. Przy pięciu próbkach nie raportujemy p95. Nie pomijać wolnych wyników. Testy pikseli, błędów WebGL i przepełnienia strony wykonuje się poza pomiarem. BENCH_MODELS/BENCH_WIDTHS/BENCH_REPEATS służą smoke; status passed ograniczonego przebiegu nie oznacza pełnej macierzy.

## Poprawka synchronizacji

Poprzednie pomijanie wywołania przy tym samym kluczu tekstury mogło ominąć trwające dekodowanie. Renderer współdzieli teraz Promise dekodowania/uploadu, a generowanie grafiki panelu jest leniwe i deduplikowane. Aktualna generacja oczekuje własnej pracy; anulowana nie publikuje zakończenia. Nie wymagamy globalnego pending=0, bo nieistotne superseded jobs mogą jeszcze trwać.

Test renderer-texture-jobs sprawdza współbieżne wywołania, deduplikację producenta, zastąpienie klucza, błąd/retry, clear/reload oraz dispose. Niezależny ekspert ponownie przejrzał poprawkę i metodę. Nie deklarujemy zmierzonego przyspieszenia względem v80: stara wersja nie ma równoważnego punktu pomiarowego.

## Uruchomienie

Po build: node tests/renderer-baseline.mjs. Uruchamiać sekwencyjnie, bez innych testów przeglądarkowych/buildów. Wyniki: outputs/renderer-baseline/results.json. Końcowe źródło wydania i receipt publikacji podaje raport wdrożenia w gamefields-os.

## Wyniki pełnej serii

PASS:480próbek,96komórek,0błędów. Przebieg22.10.2026 07:28:20–07:34:02 UTC. AppleM1/macOS Darwin23.4.0, Node24.19.0, Chromium149.0.7827.55, SwiftShader. To pierwsza baza mierzonego kandydata, nie porównanie przed/po.

| Operacja | Zakres median16komórek [ms] | Największa próbka [ms] |
|---|---:|---:|
| startup-fresh-context | 303.7–818.8 | 4225.4 |
| startup-same-context-navigation | 320.3–924.4 | 1035.5 |
| panel-colour | 3.2–51.0 | 106.9 |
| panel-text | 187.1–2208.6 | 2218.8 |
| complex-project-import | 37.6–78.7 | 110.1 |
| complex-scene-cached-redraw | 197.0–2027.0 | 2269.3 |

Najwolniejsze mediany tekstu paneli (2208,6ms) i zmiany koloru ze złożoną sceną (2027,0ms) wystąpiły w Circle Cage2/1440. Następnie profilować generowanie, dekodowanie, upload i draw grafik paneli, z zachowaniem zgodności obrazu; sam pomiar nie rozdziela ich kosztów; nie wnioskować z tego o wydajności fizycznego GPU. Pierwszy start zawiera pojedynczy wynik4225,4ms; zachowano go w surowych danych, nie ukryto w średniej. Druga nawigacja nie zawsze była szybsza.

Surowe wyniki i dokładne hashe wejść: [renderer-baseline-2026-10-22.json](renderer-baseline-2026-10-22.json). Metryki dotyczą kodu aplikacji o hashach w codeInputs; późniejszy commit publikacji obejmuje także dokumentację i testy. Nie przypisywać pomiaru do niezmienionej wersji80.

## Zasady porównań i budżetu

Każdą komórkę porównywać osobno: mediana bazowa/kandydata, różnica ms i procentowa oraz maksimum obu serii. Zmieniony sprzęt, runtime, fixture, DPR lub cache oznacza nową bazę. Nie sumować różnych operacji ani obu szerokości w jeden wynik.

Wzrost jest sygnałem do ponowienia obu serii naprzemiennie na tym samym hoście i zebrania przyczyny. Pojedynczy max nie wyznacza SLA. Liczbowy budżet produktu pozostaje PENDING do oceny naturalnego rozrzutu między seriami i rzeczywistych urządzeń/celów produktu. S2-04 ma ukończony zakres scenariusza i pierwszej bazy; cały zakres budżetu/porównania optymalizacji pozostaje PARTIAL. Nie deklarujemy wyników przed/po ani uniwersalnego FPS.

## Bramki wydania

PASS: TypeScript --noEmit, build, test:studio (w tym renderer-texture-jobs), quote-engine, construction-pricing, pełne test:mobile (96aren/48Street/16materiałów/JSON/Radar,375/390/430/1440), Surface7viewport. Niezależna kontrola480próbek/96komórek/hashów/median/maksimów PASS. Kod aplikacji po pomiarze niezmieniony; aktualizowano dokumentację. Wersja i commit publikacji w raporcie wdrożenia repozytorium gamefields-os.
