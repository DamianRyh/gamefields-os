# Wspólne końcowe rysowanie paneli — 23.10.2026

Panelowe uploady WebGL nie muszą po każdym panelu rysować całego boiska. Opcja `drawAfterUpload:false` wyłącza wyłącznie to pośrednie rysowanie. Domyślne zachowanie Renderer.texture pozostaje włączone; podłoże, materiały, picking i ResizeObserver zachowują swoje ścieżki.

Aktywna generacja zbiera wyniki wszystkich prac paneli przez Promise.allSettled i dopiero potem wykonuje jeden draw. Nie ma globalnego licznika batchowania. Anulowana generacja nie wykonuje końcowego draw ani nie publikuje zakończenia. Przy błędzie pozostałe prace nadal są oczekiwane; błędne tekstury są czyszczone do białego obrazu, po czym jeden draw pokazuje udane panele i bazowy kolor nieudanych. Interfejs zgłasza błąd, a generacja nie otrzymuje znacznika ukończenia. Następna aktualizacja może ponowić próbę.

Resize nadal może rysować częściowo przygotowaną scenę podczas ładowania. Nie jest to atomowa transakcja obrazu. Współbieżny konsument tego samego zadania mesha czeka na pierwszą Promise; politykę rysowania określa pierwsze zadanie. Wszystkie panelowe wywołania tego podglądu używają tej samej polityki. Nie ma zmiany klucza źródła, cache PNG/Image, parametrów uploadu, shaderów ani geometrii.

## Granica pomiaru

Liczniki clear i drawArrays opisują zgłoszenia aplikacji, a nie zakończoną pracę GPU lub FPS. Porównanie pikseli wykonywane jest po zakończeniu generacji, bez dodawania gl.finish do renderera. Nie określamy budżetu SLA na podstawie liczby wywołań. Czas i rozrzut powtarzanych serii na urządzeniach pozostają osobnym zadaniem.

## Testy

Testy zadań Renderer sprawdzają zgodność domyślną, osobne uploady, współdzielony Image, brak pośrednich draw paneli oraz first-job policy. Test helpera sprawdza, że odrzucenie jednego zadania nie kończy oczekiwania przed wolniejszym zadaniem, anulowanie pomija draw, błędy są czyszczone przed jednym draw, a wynik błędu nie jest sukcesem generacji.

Scenariusz przeglądarkowy porównuje zbudowaną wersję85 z kandydatem: Circle Cage1/2,375/1440px,both/inner/outer,tekst/kolor/logo/usunięcie. Zachowuje hashe końcowych pikseli, buforów geometrii/UV, kolory i eksport konfiguracji. Osobno zapisuje Image load, uploady, clear i drawArrays oraz hashe faktycznie uruchomionych paczek. Wyniki i bramki publikacji poniżej uzupełnia raport wydania.


## Wynik porównania z wersją85

PASS48/48: identyczne końcowe RGBA, bufory Float32 geometrii/normalnych/UV, winding, kolory i eksport design. Image load i uploady pozostają identyczne. W36stanach z grafiką liczba drawArrays/clear maleje;12stanów usunięcia grafiki nie zwiększa tej pracy.

| Tekst /1440px | Pełne clear przed→po | drawArrays przed→po | Uploady paneli |
|---|---:|---:|---:|
| Circle1 obie strony |11→3|209→57|8→8|
| Circle1 jedna strona |11→3|297→81|8→8|
| Circle2 obie strony |19→3|665→105|16→16|
| Circle2 jedna strona |19→3|969→153|16→16|

Trzy clear obejmują początkowe rysowanie, końcowe rysowanie i ResizeObserver w tym scenariuszu; nie obiecujemy jednego draw łącznie. Jednostronne podzbiory nadal mają więcej siatek. [Porównanie](panel-upload-batch-2026-10-23/comparison.json), [baza85](panel-upload-batch-2026-10-23/baseline.json), [kandydat](panel-upload-batch-2026-10-23/candidate.json). Pliki skopiowane bajt w bajt, SHA w comparison. Początkowa adaptacja harnessu wymagała poprawienia katalogu wynikowego (ENOENT); aplikacja nie była przyczyną tego błędu.

[Rzeczywiste błędy i wyścigi React/WebGL](panel-upload-batch-2026-10-23/failure-browser.json),375/1440: wymuszony błąd panelowego PNG pokazuje alert, ready=false i request różne od complete; poprawna ponowna edycja kończy render. Obraz wcześniejszej edycji zwolniony dopiero po nowszym renderze nie zmienia jego pikseli lub znacznika generacji. Nie dodawano danych QA do publicznego szkicu użytkownika.

TypeScript, build, test:studio (w tym batch/error/cancel/retry), quote-engine i construction-pricing PASS. Niezależny przegląd kodu nie znalazł nowego błędu. Pełna regresja mobilna, Surface i oracle stron pozostają bramkami publikacji; wynik dopisujemy po ich zakończeniu.


Bramki publikacji23.10: TypeScript/build/test:studio/quote-engine/construction-pricing PASS;48/48zgodnych stanów z wersją85 i mniejsza liczba rysowań w36stanach grafiki; dwa scenariusze rzeczywistych błędów/retry/starego wyniku PASS; pełne test:mobile96aren/48Street/16materiałów/JSON/Radar PASS; Surface7rozmiarów i58przypadków stron paneli PASS.

Dodatkowa asercja porównuje błąd zastąpienia wcześniejszej poprawnej grafiki z pustym panelem. Początkowo punkt odniesienia był odczytywany przed ResizeObserver po otwarciu Konstrukcji na telefonie. Dwie klatki stabilizacji i kontrola wymiarów canvasa potwierdziły identyczność początkowego, błędnego i jawnie pustego obrazu; bez zmiany kodu aplikacji. Rozmiary i trzy SHA zapisane w failure-browser.json.
