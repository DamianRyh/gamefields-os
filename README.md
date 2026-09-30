# Gamefields Studio v0.4

Polski edytor koncepcji boisk oparty na React 19 i Vinext.

## Funkcje
- Wymiary, nawierzchnie, kolory i oznakowanie sportowe.
- Import logo PNG/SVG, tekst, biblioteka sponsorów i wyposażenia.
- Przesuwanie, obrót, skalowanie, przezroczystość i grafiki na bandach.
- Cofnij/ponów, warianty A/B/C, scena dzienna, nocna i eventowa.
- Budżet demonstracyjny, eksport i walidowany import JSON.
- Gamefields OS: lista projektów bieżącej sesji.

## Ograniczenia
Projekty działają w pamięci sesji: pobierz JSON przed zamknięciem strony. Brak kont, bazy danych i automatycznej wysyłki zapytań. Budżet wykorzystuje demonstracyjne stawki, nie jest ofertą ani kalkulacją wykonawczą. Widok 3D jest perspektywą SVG; edycja przeciąganiem działa w planie 2D. Geometria linii jest poglądowa. Import obsługuje format edytora v0.3; stare pliki v0.1 wymagają migracji.

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
