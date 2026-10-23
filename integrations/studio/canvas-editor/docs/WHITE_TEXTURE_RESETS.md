# Pomijanie zbędnych resetów tekstury — 23.10.2026

Każdy element renderera przechowuje osobny stan `whiteTexture`. Konstruktor ustawia go po utworzeniu białej tekstury 1×1. Udany upload obrazu oznacza, że tekstura wymaga czyszczenia. `clearTexture()` zawsze najpierw zeruje klucz zadania; biały upload pomija wyłącznie wtedy, gdy flaga już potwierdza białą teksturę. Po udanym białym uploadzie ponownie ustawia flagę.

Pusty klucz nie jest dowodem pustej tekstury. Błąd dekodowania może wyzerować klucz, pozostawiając poprzednią grafikę w GPU. Osobna flaga zachowuje wymagane czyszczenie w tym przypadku. Błąd samego białego uploadu nie oznacza sukcesu i umożliwia ponowienie. Stara lub zniszczona praca nie zmienia flagi.

Nie współdzielimy właściciela tekstury GPU i nie zmieniamy parametrów kolorów, shaderów, geometrii, cache PNG/Image, rysowania ani sygnatury metod. Pominięty jest jedynie ponowny upload tych samych czterech białych bajtów do już pustej tekstury. To liczba zgłoszeń aplikacji, nie pomiar czasu GPU, FPS lub zajętej pamięci.

## Oczekiwana granica

Usunięcie grafiki nadal wymaga jednego białego uploadu dla każdego faktycznie zadrukowanego panelu. Czyszczenie paneli już pustych lub kolejna edycja koloru po usunięciu grafiki nie wymaga kolejnego resetu. Jednostronne widoki mają podzbiory niezadrukowane; ich ponowne resetowanie było zbędne. Inicjalizacja tekstur przy tworzeniu renderera nadal pozostaje wymagana.

## Testy

Testy zadań renderera obejmują ponowne czyszczenie, grafikę→błąd z pustym kluczem→wymagane czyszczenie, anulowanie oczekującej pracy mimo pominiętego uploadu, clear/retry, stare i zniszczone zadania oraz wyjątek białego uploadu. Porównanie przeglądarkowe z wersją86 obejmuje oba Circle Cage,375/1440,both/inner/outer,tekst/kolor/logo/usunięcie i kolejną edycję koloru pustych paneli. Weryfikuje piksele, bufory, kolory, eksport, Image load, PNG uploady i rysowania; osobno liczy białe uploady1×1.

Wyniki porównania, bramki publikacji i surowe raporty zapisujemy po ich zakończeniu. Dalszy zakres to porównywalne serie czasów i rozrzutu; nie oznaczamy całej wydajności renderera jako ukończonej.


## Wyniki porównania

PASS60/60: identyczne końcowe RGBA, bufory geometrii/normalnych/UV, kolory i eksport design. Image load, uploady PNG i liczba rysowań zachowane. W44stanach mniej białych uploadów; pozostałe16 bez zmiany. Circle2 jednostronnie tekst/kolor/logo: wszystkie uploady32→16, czyli16PNG oraz0zbędnych białych zamiast16. Usunięcie grafiki nadal wykonuje16wymaganych resetów; kolejna zmiana koloru pustych paneli daje0 zamiast16/32. Circle1 analogicznie8paneli.

[Porównanie](white-texture-resets-2026-10-23/comparison.json), [baza86](white-texture-resets-2026-10-23/baseline.json), [kandydat](white-texture-resets-2026-10-23/candidate.json), [błędy/retry/stara praca](white-texture-resets-2026-10-23/failure-browser.json). Surowe raporty skopiowane bajt w bajt i SHA zapisane w comparison. Hashe bazy porównano z opublikowaną paczką86.

Początkowa asercja liczników przechwyciła dodatkową klatkę ResizeObserver tylko w jednej serii. Ujednolicono odczyt po dwóch klatkach i ponowiono obie pełne serie; bazę uruchomiono z zachowanego archiwum86, bez przebudowy lub podmiany kodu aplikacji. Nie osłabiono asercji zgodności obrazu ani liczników. Pierwszy równoległy przebieg testu mobilnego zatrzymał się na kliknięciu kamery; pełną regresję ponawiamy sekwencyjnie.


Bramki publikacji 23.10: TypeScript, build, test:studio, quote-engine i construction-pricing PASS. Ponowione sekwencyjnie test:mobile (96 scen aren,48 Street,16 materiałów, JSON i Radar), Surface w7rozmiarach oraz58przypadków stron paneli PASS. Porównanie60stanów i2scenariusze błędów/retry/starej pracy PASS. Audyt8rewizji Studio i25komponentów OS odtworzony dwukrotnie z identycznym SHA.
