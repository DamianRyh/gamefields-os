# Współdzielenie wczytanego obrazu paneli — 23.10.2026

Jedna aktualizacja podglądu tworzy własny `createDecodedImage()`. Panele z dokładnie tym samym źródłem PNG otrzymują tę samą Promise i ten sam HTMLImageElement. Wcześniejszy cache receptury PNG pozostaje osobny: ogranicza kodowanie rastra, a nowy cache ogranicza powtarzane wczytywanie tego rastra do Image.

Nie zamieniamy źródła uploadu na ImageBitmap ani canvas. Zachowane są ustawienia kolorów, przezroczystości i odwrócenia Y, osobne tekstury GPU oraz wywołania texImage2D i draw dla każdego panelu. Podłoże i materiały pozostają na dotychczasowej ścieżce. Cache nie jest globalny i nie przechodzi do następnej generacji. Odrzucona Promise jest usuwana, aby można było ponowić próbę.

Renderer nadal odpowiada za zadania przypisane do konkretnego mesha, oczekiwanie przez drugiego konsumenta oraz odrzucanie wyniku starego klucza lub zniszczonego renderera. Wspólny Image nie oznacza współdzielonego właściciela tekstury WebGL. Zakończenie generacji jest publikowane dopiero po jej zadaniach; anulowana generacja nie ogłasza gotowości.

## Zakres pomiaru

Liczba ustawień źródła i zdarzeń load HTMLImageElement jest obserwowalną liczbą wczytań, nie bezpośrednim licznikiem wewnętrznych dekodowań CPU przeglądarki. Przeglądarka może stosować własny cache. Nie wyciągamy z tej zmiany wniosku o FPS, czasie prezentacji GPU ani uniwersalnym przyspieszeniu. Liczba uploadów oraz pełnych rysowań pozostaje oddzielnym zadaniem.

Porównanie używa zbudowanej wersji84 i kandydata na tym samym hoście, z izolowanymi kontekstami. Hashe paczek identyfikują faktycznie uruchomiony kod; hashe edytowanych plików źródłowych nie są przypisywane wcześniejszemu buildowi. Odczyt pikseli służy zgodności obrazu poza pomiarem pracy.

## Testy domenowe

`tests/decoded-image.mjs` sprawdza tę samą Promise dla identycznego źródła, rozróżnienie źródeł, ponowne użycie po load, izolację generacji oraz błąd i retry. `tests/renderer-texture-jobs.mjs` sprawdza dwa meshe, jedno wczytanie i nadal dwa uploady/draw, domyślną ścieżkę bez dekodera oraz zabezpieczenia stale/dead. Oba testy uruchamiane są sekwencyjnie, ponieważ zastępują globalny Image.

Następne prace: osobny profil kosztów upload/draw i pomiar rozrzutu powtarzanych serii. Zmiana nie dotyczy geometrii modeli, danych wykonawczych, cennika lub technicznego BOM.


## Wyniki porównania

PASS48/48: Circle Cage1/2 ×375/1440px ×both/inner/outer ×tekst/kolor/logo/usunięcie. Wszystkie końcowe hashe RGBA, bufory geometrii/UV, winding, kolory i eksport design są identyczne. Przy grafice liczba panelowych Image load wynosi8→1 i16→1; uploady pozostają8/16. Dla Circle2 oba boki:665 drawArrays,19 clear; jednostronnie969 drawArrays,19 clear i32 wszystkie uploady, identycznie przed i po. Liczniki obejmują wywołania ResizeObserver w scenariuszu; nie są miarą pracy GPU. Usunięcie grafiki zachowuje te same liczniki i obraz.

[Porównanie48przypadków](decoded-panel-images-2026-10-23/comparison.json), [wersja84](decoded-panel-images-2026-10-23/baseline.json), [kandydat](decoded-panel-images-2026-10-23/candidate.json). Surowe raporty skopiowane bajt w bajt; SHA zapisane w comparison.json. Pole builtBundles identyfikuje uruchomione paczki. W bazie poprawiono wyłącznie etykietę width, pierwotnie nadpisaną szerokością canvas:375/1440 jest viewport, pixelWidth/pixelHeight opisują canvas. Nie zmieniano pikseli, liczników ani kodu aplikacji.

Niezależny przegląd kodu nie wykazał nowego błędu poprawności. Brak pomiaru wewnętrznego dekodera, natywnego GPU i fizycznych urządzeń. Nie przypisujemy tych wyników do48obrazów historycznej macierzy ośmiu modeli; nowy test dotyczy dwóch Circle Cage i opisanych48stanów.


Bramki wydania23.10: TypeScript/build/test:studio/quote-engine/construction-pricing PASS;48/48stanów Circle Cage identycznych pikselowo z wersją84, bufory/kolory/design i upload/draw zgodne; pełne test:mobile96aren/48Street/16materiałów/JSON/Radar PASS; Surface7rozmiarów PASS; niezależny oracle stron paneli58przypadków PASS. Surowe raporty i SHA w decoded-panel-images-2026-10-23.
