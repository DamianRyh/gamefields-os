# Gamefields Studio v1.0

Polski edytor koncepcji boisk oparty na React 19 i Vinext.

## Funkcje
- Wymiary, nawierzchnie, kolory i oznakowanie sportowe.\n- Pattern Engine: 25 rodzin × 12 kompozycji = 300 bazowych wzorów nawierzchni.\n- 18 gotowych palet kolorystycznych, filtrowanie, wyszukiwarka, losowanie kierunku i wariantów podobnych.\n- Parametryczne SVG: wariant, paleta, intensywność, skala i obrót wzoru bez zapisywania setek bitmap.
- Import logo PNG/SVG, tekst, biblioteka sponsorów i wyposażenia.
- Przesuwanie, obrót, skalowanie, przezroczystość i grafiki na bandach.
- Cofnij/ponów, warianty A/B/C, scena dzienna, nocna i eventowa.
- Budżet demonstracyjny, eksport i walidowany import JSON.
- Gamefields OS: lista projektów bieżącej sesji.

## Ograniczenia
Projekty działają w pamięci sesji: pobierz JSON przed zamknięciem strony. Brak kont, bazy danych i automatycznej wysyłki zapytań. Budżet wykorzystuje demonstracyjne stawki, nie jest ofertą ani kalkulacją wykonawczą. Widok 3D jest perspektywą SVG; edycja przeciąganiem działa w planie 2D. Geometria linii jest poglądowa. Import obsługuje format edytora v0.5 i zachowuje zgodność z projektami v0.3 dzięki opcjonalnym polom Pattern Engine; stare pliki v0.1 wymagają migracji.

## Uruchomienie
`pnpm dev`, `pnpm build`, `pnpm exec tsc --noEmit`.

Kod: https://github.com/DamianRyh/gamefields-os
Studio: https://gamefields-studio.ryhfs90.chatgpt.site
Integracja WordPress: https://www.gamefields.eu/konfigurator-boisk/

Sites publikuje aplikację niezależnie od GitHub. WordPress osadza tę samą aplikację; aktualizacje Studio są widoczne również w osadzeniu. Eksport/import JSON pozwala przenosić projekty między kartami. Nie ma automatycznej synchronizacji danych użytkownika.

## Gotowe projekty — WordPress
Zarządzanie: Wpisy, kategoria `gamefields-wzory` (ID 629). Dodaj nazwę, zajawkę, opcjonalny obrazek wyróżniający i blok Plik z eksportem „Wzór do WordPress” (.txt, zawartość JSON). Katalog czyta wyłącznie opublikowane wpisy z tej kategorii. Wycofanie: status Szkic; media pozostają publiczne jak zwykłe pliki WordPress.

Aplikacja udostępnia katalog `/api/templates` oraz odczyt pojedynczego projektu `?id=<post_id>`. Pliki tylko z HTTPS www.gamefields.eu/wp-content/uploads/, bez przekierowań, limit 12 MB, walidacja schematu. Brak publicznych operacji zapisu. Katalog jest stronicowany; otwarcie tworzy kopię z nowym identyfikatorem. Link do katalogu: `?view=templates`.

Instrukcja w WordPressie: szkic wpisu 3649.


## Pattern Engine v0.5
Biblioteka jest generowana z danych w `lib/pattern-library.ts`. Każda rodzina ma 12 kompozycji i może być łączona z dowolną paletą, sportem oraz wymiarem boiska. Warstwa artworku jest niezależna od linii sportowych i wyposażenia. Kod wzoru ma format `GF-<RODZINA>-<WARIANT>`.

Kategorie: Organic, Geometric, Street, Premium, Brand i Play. Poziom wykonawczy 1–4 jest wyliczany dla wzoru i może być później podpięty do kalkulatora robocizny, liczby kolorów oraz zużycia materiałów.


## Pattern Engine v1.0
Biblioteka obejmuje 25 rodzin projektowych × 12 kompozycji = 300 bazowych wzorów. Każda kompozycja ma własny układ, a nie tylko przesunięcie lub obrót jednego motywu.

Dopracowane rodziny:
- Organic Flow, Soft Blobs, Geometric, Bauhaus, Color Block
- Waves, Contour, Court Camo, Street Grid, Pixel, Diagonal, Radial
- Sunset Bands, Neon Court, Mono Layers, Raw Concrete
- Street Art, Typography, Local ID, Nature, Playground
- Architectural, Brand Activation, Ribbons, Terrazzo

Warstwa wzoru jest parametryczna i niezależna od linii sportowych, wyposażenia oraz brandingu. Wzory można łączyć z 18 paletami, skalować, obracać i regulować ich intensywność.
