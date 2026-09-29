# Gamefields Studio v0.1

Polski prototyp konfiguratora boisk i Gamefields OS. React 19 + Vinext, gotowy do publikacji przez Sites.

## Funkcje
- Landing, konfiguracja typu projektu, sportu i wymiarów.
- Interaktywny rzut SVG: nawierzchnia, kolory, linie, wyposażenie, grafiki.
- Dynamiczne podsumowanie i demonstracyjne zapytanie o wycenę.
- Dashboard OS, lista i karta projektu.
- Eksport/import JSON. Dane formularza zapytania zawarte w pobranym pliku.

## Granice v0.1
Brak bazy danych, rzeczywistej wysyłki formularza, silnika cenowego i kont użytkowników. Projekty są utrzymywane w pamięci bieżącej sesji. Plik JSON zachowuje konfigurację. Widok perspektywiczny jest transformacją rzutu 2D. Geometria ma charakter poglądowy.

## Rozwój
Uruchom zgodnie ze skryptami package.json. `pnpm dev`, `pnpm build`. Kontrola typów: `pnpm exec tsc --noEmit`.

## GitHub

Kod: https://github.com/DamianRyh/gamefields-os

Opublikowany prototyp: https://gamefields-studio.ryhfs90.chatgpt.site

Synchronizacja z GitHub nie włącza automatycznej publikacji. Wdrożenie strony jest obsługiwane przez Sites.
