# Circle Cage — strony grafiki na siatce

## Naprawiony zakres

Circle Cage 1/2 wcześniej nie wyświetlały grafiki po wyborze inner/outer: selektor sprawdzał końcówkę ID, której źródłowe panele nie miały. Dotyczy to grafiki tekstu/logo, nie podstawowego koloru konstrukcji. Naprawa obejmuje wyłącznie dwie rodziny Circle; pozostałe modele i identyfikatory źródeł pozostają niezmienione.

Modele zawierają zamknięte pręty siatki, a nie dwie płaskie blachy drukowe. Kontrakt dotyczy podglądu: kierunku fasety względem istniejącego środka XZ modelu. Nie zatwierdza technologii nadruku ani przemysłowego oznaczenia strony części.

## Kontrakt geometrii

Normalna pochodzi z oryginalnego windingu trójkąta, bo źródła Circle nie zawierają normals. Kosinus między jednostkową normalną a jednostkowym kierunkiem radialnym XZ: poniżej−0,05 inner; powyżej+0,05 outer; pozostałe fasety edge/styczne. Poziome fasety mają iloczyn0. Nie kopiujemy progu |ny|>0,3 z czytnika W1: siatka ma także ukośne powierzchnie prętów. Deadband jest regułą wizualizacji.

| Model | Panele | Inner | Outer | Styczne |
|---|---:|---:|---:|---:|
| Circle Cage 1 | 8 | 13560 | 13568 | 11632 |
| Circle Cage 2 | 16 | 28304 | 28312 | 24456 |

both zwraca identyczną tablicę i oryginalne meshe, bez zmiany kolejności trójkątów. Dla inner/outer każdy panel dostaje dwa runtime wrappery: wybrane fasety z końcówką artwork-inner/outer oraz pozostałe fasety unprinted. Oba zachowują group=panels, oryginalne v/uv/normals i obiekty trójkątów. Wybrane fasety otrzymują grafikę, niewybrane zachowują panelColor — nie frameColor. Żaden trójkąt nie jest zgubiony/zdublowany; UV, wymiary PNG i winding pozostają niezmienione. Pusta geometria podczas fetch nie jest klasyfikowana. Nieprawidłowa geometria zaufanego źródła jest jawnym błędem.

Tryb jednostronny zwiększa liczbę runtime meshes Circle1 z19do27, Circle2 z35do51. Suma trójkątów i rozmiar buforów geometrii są zachowane; większa liczba wywołań draw jest jawnym kosztem. Przy włączonej grafice liczba dużych tekstur pozostaje8/16, dodatkowe niewybrane części mają białą teksturę1×1. Nie deklarujemy optymalizacji czasu ani fizycznej pamięci GPU. both zachowuje oryginalne meshe oraz liczbę tekstur i podział draw. Renderer/shader nie został zmieniony.

Efekt aktualizacji zależy także od meshes; przebudowa po fetch/switch nie polega na zbatchowanej zmianie ready. Modelowe pliki i Project JSON nie są przepisywane, podział jest wyłącznie po stronie podglądu. side zachowuje dotychczasowe wartości both/inner/outer i import/eksport.

## Dowody

Test jednostkowy: box, cylinder, obie strony progu±0,05±1e−6, fasety styczne, nieprawidłowe dane, referencje/winding/rozłączny pełny podział24paneli, both/pozostałe modele identity i niezmienność źródła. PASS, włączony do test:studio.

Browser oracle:58przypadków w375/1440. Dwa modele×trzy strony×trzy kamery, powrót do both, zmiana koloru/usunięcie grafiki, zapis/odtworzenie jednostronnego szkicu oraz Circle1inner→Circle2inner→odświeżenie. Niezależny kod oblicza oczekiwane bufory Float32 z oryginalnych źródeł; porównuje pozycje/normalne/UV/winding, liczbę draw oraz faktyczne flagi tekstury i uniform koloru WebGL. Nie importuje klasyfikatora produkcyjnego. Canvas jest niepusty i bez błędów GL, brak przepełnienia poziomego; powrót do both ma identyczne SHA dla każdej kamery. JSON zachowuje stronę, tekst, logo i kolor.

Harness odtwarzania początkowo odświeżał URL z arena; istniejący kontrakt jawnego wyboru modelu ignoruje szkic przy arena/sport/pattern/view. Test doprecyzowano: oczekuje zapisu i odtwarza szkic przez /, potem sprawdza side eksportu. Nie zmieniono polityki wejść ani hooka odzyskiwania.

Oracle dowodzi zgodności wybranego kontraktu wizualizacji i przypisania grafiki/koloru. Nie stanowi fotoreferencji rzeczywistego nadruku. Zakończono także kontrolę całej macierzy both z wcześniejszym Studio82; wynik podano poniżej, a sourceSHA publikacji w raporcie wdrożenia.

## Kontrola both z wersją82

Pełne480próbek i96komórek bieżącego kandydata,0błędów. Porównanie z zapisanym kandydatem opublikowanego Studio82: **48/48canvasów identycznych** (8modeli×2szerokości×3kamery). Nie używamy różnic czasu tej serii do obietnicy przyspieszenia naprawy stron; jednostronny tryb ma jawnie większą liczbę podzbiorów/draw.

[Browser oracle58przypadków](circle-panel-sides-2026-10-22/browser.json), [bieżąca macierz i hashe](circle-panel-sides-2026-10-22/renderer.json), [porównanie96komórek/48obrazów](circle-panel-sides-2026-10-22/comparison.json). Metoda porównania i ograniczenia lokalnego SwiftShader opisane w RENDERER_BASELINE.md.

## Bramki wydania

PASS: TypeScript --noEmit, build, test:studio (w tym circle-panel-sides), niezależny WebGLoracle58przypadków, pełna macierz480próbek/48identycznychobrazówboth, quote-engine, construction-pricing, pełne test:mobile96aren/48Street/16materiałów/JSON/Radar oraz Surface7rozmiarów. Niezależni eksperci sprawdzili kontrakt, kod, granice i źródłowe hashe. Bez testu fizycznego urządzenia i bez deklaracji technologii nadruku.
