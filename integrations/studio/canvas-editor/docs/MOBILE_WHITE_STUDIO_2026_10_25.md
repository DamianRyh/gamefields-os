# Białe Studio i ograniczona wysokość — 25.10.2026

## Zmiana

Tło modelu 3D oraz budowania modułowego jest czysto białe. Usunięto z aktywnego Studio gradient, zdjęcie placu i dekoracyjną płaszczyznę. Modele, materiały, grafiki i zasoby scenerii poza Studio pozostają.

Mobilne Studio zajmuje jeden dostępny ekran. Wysokość pochodzi z innerHeight / visualViewport i jest ograniczona wysokością dostępnego ekranu, także w osadzeniu. Nagłówek ma wysokość wynikającą z treści zamiast nakładających się stałych wartości. Główna siatka ma podgląd, trzy narzędzia i przewijany panel. Model pozostaje na miejscu podczas dotykowego przewijania ustawień. Krótki widok poziomy ma model obok panelu, zamiast zamieniać się w długą stronę.

Usunięto ResizeObserver wysyłający rodzicowi scrollHeight jako gf-height. Studio nie prosi już o powiększanie iframe do wysokości zawartości. Wysokość dostępna nie zależy od rozmiaru przewijanego panelu; słuchamy zmian viewportu, nie rozmiaru treści. Zmiany nie dotykają Project, zapisu, modeli, stawek ani SQL.

## Diagnoza i granice

Kod zawierał kilka nakładających się reguł 100dvh, osobny tryb dokumentu dla wysokości poniżej600px i kolejne nadpisania siatki. Zastąpiono je końcowym, jednoznacznym stylem Studio mobile, ładowanym po poprzednich arkuszach. To usuwa też stały122px nagłówek, który po otrzymaniu ceny rozjeżdżał treść.

Pierwszy odczyt publicznego WordPress /konfigurator-boisk/ przy390×844 zwrócił iframe844px, Studio844px i dokument rodzica932px; nie odtworzył zgłoszonego wielokrotnego wzrostu w tym jednym przebiegu Chromium. Nie przypisujemy temu odczytowi dowodu przyczyny problemu na konkretnym telefonie. Naprawa ogranicza samą aplikację, usuwa historyczne tryby rozciągania i sprawdza stabilność po interakcjach. Dostępny silnik testowy to Chromium149 z emulacją mobile/touch; nie deklarujemy testu fizycznego iPhone/Safari.

## Walidacja

Test tests/studio-mobile-layout.mjs sprawdza320×568,375×812,390×844,430×932 i844×390: wysokość dokumentu i Studio nie przekracza viewportu, białe tło sceny i modułów, rozdzielenie modelu/panelu, prawdziwy emulowany gest dotykowy w panelu, nieruchomy podgląd i scrollY=0, obrót modelu klawiaturą oraz przełączenie pion/poziom/pion. Mobilne Cofnij i Ponów pozostają dostępne. Modele wykorzystują istniejące oryginalne części, bez zmiany skali.

Dalsze bramki: tsc, test:studio, build, test:mobile (materiały, plan/3D, JSON i Radar) oraz dotychczasowe testy budowania modułowego. Dowody w tools/mobile-white-studio-2026-10-25/. Bez wysyłania formularzy lub wiadomości.
