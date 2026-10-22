# Grafiki w Studio — profil statycznego SVG, 22.10.2026

Wspólna walidacja `lib/graphic-source-policy.ts` działa przed dodaniem pliku oraz w `projectSchema` dla `objects[].src`. Ten sam schemat obsługuje import, odczyt szkicu, nazwane warianty, szablony, kalkulację i eksport specyfikacji. Odrzucenie następuje przed zmianą projektu. Nie wykonujemy cichej sanitizacji i nie zmieniamy bajtów zaakceptowanych grafik.

## Obsługiwany profil

- Dotychczasowe PNG pozostają zgodne. Ta zmiana nie dekoduje PNG ani nie sprawdza jego sygnatury; faktyczna renderowalność zależy od dekodera obrazów przeglądarki. Nowe pliki upload mają dotychczasowy limit2MB, źródła projektu dotychczasowy limit3M znaków. Panele nadal przyjmują wyłącznie raster i konwertują go do PNG w istniejącym torze.
- SVG: kanoniczne base64, poprawne UTF-8, do2000000 zdekodowanych bajtów, do10000 tokenów i głębokość64. Dozwolone statyczne ścieżki/figury, grupy, tekst, gradienty, klipy i maski; lokalne odwołania #id oraz ograniczony zbiór stylów prezentacyjnych. Standardowy eksport powinien zawierać przestrzeń nazw SVG.
- Odrzucamy DTD i deklaracje encji, dodatkowe instrukcje przetwarzania, skrypty, zdarzenia, foreignObject, osadzane dokumenty/obrazy, animację, style zewnętrzne, odwołania zewnętrzne/relatywne, CSS z ucieczkami i at-rules. `use` nie jest obsługiwane, aby nie otwierać rekurencyjnego rozwijania symboli.
- Filtry, arkusze style, CDATA, prefiksowane elementy, metadane edytorów i inne elementy spoza profilu także są odrzucane. Taki plik można przygotować jako prostsze statyczne SVG lub PNG. Nie jest to uniwersalny parser/sanitizer SVG ani gwarancja stałego kosztu renderowania: duże ścieżki, współrzędne i lokalne wzory/maski nadal mogą być kosztowne. Limitów wymiarów rastra/path-cost w tym etapie nie deklarujemy.

## Zachowanie danych i komunikaty

Upload podaje nazwę odrzuconego pliku; poprawne pliki w tej samej paczce są dodawane niezależnie. Import z niedozwoloną grafiką daje komunikat bez zmiany konfiguracji. Stary szkic/rekord wariantów niezgodny z profilem pozostaje zapisany jako oryginał; istniejące odzyskiwanie wstrzymuje nadpisanie i pozwala pobrać dane. Nie migrujemy automatycznie źródeł grafik. Bezpieczne stare JSON i nazwy własne zachowują zgodność.

Obecny renderer używa image/href i dekodowania obrazów, a nie wstawiania SVG jako HTML. Nie deklarujemy wykazanego wcześniejszego XSS ani pełnego audytu bezpieczeństwa. To konserwatywne ograniczenie źródeł przechowywanych i eksportowanych.

## Dowody

PASS: policy fixtures (skrypty, zdarzenia, DTD/encje, zewnętrzne URL, CSS escapes, animacja, XML/base64/UTF8, limity), graphic-boundaries (schema/import/szkic/wariant/spec, pełne SVG i ochrona surowego szkicu). TypeScript/build/test:studio PASS. Pełne test:mobile PASS (96aren,48Street,16materiałów,375/390/430/1440,JSON,Radar). Surface PASS w7viewportach, w tym bezpieczny SVG, JSON i3kamery.

Ręcznie na zbudowanym lokalnym Workerze: mieszana paczka dodała1 poprawne SVG, odrzuciła1 aktywne; eksport potwierdził brak odrzuconego obiektu i zgodność bajtów poprawnego SVG. Import projektu z aktywną grafiką pozostawił wcześniejszy projekt dokładnie bez zmian; poprawny import potwierdzono nową nazwą. Na375px dokument ma375px, informacja tekst14px. Nie zmieniano danych produkcyjnych testowymi grafikami; nie wysyłano formularzy.

Prace prowadził agent wdrażający oraz eksperci przeglądu SVG, mapowania OS i kolejności wdrożeń. Niezależny przegląd nie znalazł blokującego obejścia profilu; ograniczenia zasobów i kompatybilności są jawne powyżej.
