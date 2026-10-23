# Powtarzane pomiary renderera — 23.10.2026

Etap pomiarowy porównuje opublikowane wersje Studio 85 i 87. Wersja85 ma już cache PNG i Image; wersja87 dodatkowo wspólne końcowe rysowanie paneli oraz pomijanie resetów już białych tekstur. Wynik dotyczy łącznego wpływu tych dwóch późniejszych zmian, nie rozdziela ich udziałów. Kod produkcyjny pozostaje w wersji87.

## Protokół

Kolejność czterech pełnych serii: A1=85, B1=87, B2=87, A2=85. Wszystkie uruchamiane sekwencyjnie, bez równoległych buildów i innych testów przeglądarkowych. Każda seria: osiem modeli ×375/1440px ×pięć powtórzeń ×sześć operacji =480próbek w96komórkach. Trzy kamery dla pierwszego powtórzenia dają48hashy końcowego obrazu poza pomiarem czasu.

Operacje: start w nowym kontekście, druga nawigacja w tym samym kontekście, kolor paneli, tekst paneli, import projektu z500ścieżkami SVG i ponowne rysowanie tej złożonej sceny. W1 jest historycznym szkicem, a nie nową pozycją oferty. Pomiar dotyczy domyślnej grafiki po obu stronach paneli; jednostronne przypadki mają osobne wcześniejsze testy zgodności i liczników.

Punkt końcowy to zgłoszenie końcowego draw aktualnej generacji po jej zadaniach. Nie jest to czas prezentacji GPU, FPS ani pomiar sieci produkcyjnej. Odczyty pikseli wykonuje się po zakończeniu mierzonej operacji. Stabilizacja układu po otwarciu narzędzi i przed kontrolą obrazu jest poza czasem operacji. Nowy kontekst nie gwarantuje zimnego cache systemu, procesu przeglądarki lub GPU.

## Pochodzenie

Archiwa obu wersji są zachowane z ich publikacji. Każde84pliki JavaScript porównano z wcześniejszymi raportami opublikowanych pakietów. Receipt zapisuje dokładny commit źródłowy, natywny hash zawartości archiwum oraz osobny SHA lokalnego pliku skompresowanego. Te dwa hashe opisują różne reprezentacje i nie są zamienne.

Metadane geometrii obu źródeł są identyczne: SHA256 `5077ed1f7ae642fc6f9a01d117d89836e2463f2bb81d5e1149b305cbfc0518d6`. Harness weryfikuje wspólne pliki źródłowe i zapisuje hashe faktycznie uruchomionych pakietów. Nie przypisuje aktualnego pliku renderer.ts do wcześniejszej wersji aplikacji.

## Interpretacja

Każdą z96komórek analizujemy oddzielnie. Surowe próbki, minimum, mediana i maksimum pozostają dostępne. Zakres median między dwoma seriami tej samej wersji pokazuje obserwowany rozrzut; nie jest przedziałem ufności. Kolejność ABBA ogranicza prostą interpretację dryfu jako efektu wersji, ale nie zastępuje losowania, kontrolowanego laboratorium ani testów na fizycznych urządzeniach.

Nie wyznaczamy p95, istotności statystycznej lub SLA z pięciu próbek na serię. Nie sumujemy czasów różnych operacji i rozmiarów w jeden wynik. Podajemy także wzrosty i wolne próbki. Wyniki historycznych wersji81/82 nie są bezpośrednią bazą dla tego zmienionego protokołu stabilizacji.

Nie oznaczamy całego zakresu wydajności jako ukończonego na podstawie tego lokalnego pomiaru.

## Odtworzenie

Pełny wynik: [RESULTS.md](RESULTS.md), [96komórek CSV](results/cells.csv), [ścisła analiza JSON](results/analysis.json). Cztery serie zakończone:1920próbek,48identycznych zestawów obrazów. Obserwowane mediany87:35komórek niżej,4wyżej,57nakładających się zakresów. Street Field1440tekst wymaga profilowania. Pierwszy eksperyment przerwano na timeout; [zachowany raport](attempt-1/README.md) pozostaje otwartym sygnałem stabilności. Szczegóły i ograniczenia w wyniku.

Wymagane Node, zależności istniejącego Studio (`playwright`, `wrangler` z Miniflare), zainstalowany Chromium oraz zachowane archiwa obu publikacji. Sam checkout źródeł nie zastępuje pakietów. Rozpakuj każde archiwum tak, by `builds/v85/dist` i `builds/v87/dist` zawierały `client` i `server`; porównaj ich hashe z `receipts.json`. Nie pobieramy zależności ani nie budujemy w czasie pomiarów.

W katalogu tego narzędzia, bez innych testów i buildów, uruchom kolejno (każde polecenie musi zakończyć się sukcesem):

```sh
node analyze.test.mjs
VERSION=85 RUN_LABEL=A85-1 DIST_ROOT="$PWD/builds/v85/dist" node harness.mjs
VERSION=87 RUN_LABEL=B87-1 DIST_ROOT="$PWD/builds/v87/dist" node harness.mjs
VERSION=87 RUN_LABEL=B87-2 DIST_ROOT="$PWD/builds/v87/dist" node harness.mjs
VERSION=85 RUN_LABEL=A85-2 DIST_ROOT="$PWD/builds/v85/dist" node harness.mjs
node analyze.mjs receipts.json results/A85-1.json results/B87-1.json results/B87-2.json results/A85-2.json results/analysis.json
```

`STUDIO_SOURCE_ROOT` domyślnie wskazuje `../../integrations/studio/canvas-editor`; można podać inny checkout z identycznymi źródłami geometrii. `RECEIPT_FILE`, `OUTPUT` i `PLAYWRIGHT_EXECUTABLE_PATH` mogą wskazać lokalne ścieżki. Nie ustawiaj filtrów `BENCH_MODELS`, `BENCH_WIDTHS` lub `BENCH_REPEATS` dla pełnego raportu. Analyzer odrzuci częściową serię, błędy, zmieniony harness/runtime/źródła/pakiety, niezgodne podsumowania lub obrazy. Nie odrzuca wolniejszych wyników. Zachowane raporty zawierają hashe RGBA; PNG są lokalnymi plikami kontrolnymi, nie częścią publicznego repozytorium. Archiwa buildów nie są dołączone do narzędzia.
