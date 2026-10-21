# Gamefields Studio — Sprint0: audyt, benchmark i kierunek produktu

> Aktualizacja 21.10.2026: poniżej zachowano historyczny audyt/propozycję Sprintu0. Aktualny stan realizacji i późniejsze decyzje właściciela (włączony cennik, potwierdzanie zapytania, wspólna geometria) opisuje [REALIZACJA_ZMIANY.md](REALIZACJA_ZMIANY.md). Dawne zalecenie pricing OFF i prostokątnej powierzchni Octagonu nie opisuje bieżącego Studio.

Checkpoint 21.10.2026. Wykonano etap badawczy0–2 nowego briefu; redesign i kolejne silniki wymagają osobnych sprintów z testami. Rozwijamy istniejące Studio i katalog, zachowując projekty użytkowników.

## Stan odniesienia

- Aktywne Studio: wersja71, źródło `142391e275bb481b50279949a0ea26599ed251d0`, Site `appgprj_6abbd0ba26f0819197701343bf156f1b`.
- Zweryfikowany GitHub main przed dokumentacją: `9912030d410aafdf15a868ceb9071924f5c00f43`. Oddzielny brudny lokalny root nie jest źródłem do publikacji Studio.
- Bez nowego wdrożenia produkcyjnego. Audyt kodu, cztery testy domenowe PASS, mapa26funkcji i publiczne ścieżki dziewięciu platform.
- Zachowane300wzorów,19palet,12kierunków Signature, stabilne identyfikatory produktów, modele Blender i dotychczasowy JSON. Nie zmieniano migracji ani danych.

## Najważniejsze decyzje

1. Produkt i duży podgląd są centrum; cztery obecne narzędzia organizują dwanaście obszarów briefu. Bez nowej równoległej aplikacji.
2. Najpierw spójność komunikatów i zachowanie projektu. Biblioteka mówi o cenie, ale Studio nie wykonuje requestu wyceny — poprawić komunikat, nie włączać niepotwierdzonych stawek.
3. Pole gry, gabaryt konstrukcji, obszar nawierzchni i miejsce montażu wymagają osobnych danych. Sztywne źródłowe komponenty łączą się w jednej zgodnej rodzinie.
4. Wygląd, geometria, BOM i oferta wynikają z jednego projektu, ale mają oddzielne zasady walidacji. Koncepcja klienta nie jest zatwierdzonym projektem wykonawczym.
5. Zapis w przeglądarce i JSON pozostają dostępne; porównanie wariantów i udostępnianie nie mogą ich zastąpić.

## Materiały

- [Audyt kodu i testy](CODE_AUDIT.md), [mapa funkcjonalności CSV](FEATURE_MAP.csv).
- [Rzeczywiste interakcje, zdrowie ścieżek i ograniczenia](BENCHMARK_LIVE.md).
- [Karty USM/Pickawood/Cubit](BENCHMARK_USM_PICKAWOOD_CUBIT.md).
- [Karty IKEA/Nike/Roomle/Threekit/Reform](BENCHMARK_IKEA_NIKE_ROOMLE_THREEKIT_REFORM.md).
- [Architektura docelowa](PRODUCT_ARCHITECTURE.md), [backlog sprintów](BACKLOG.csv), [ryzyka i bramki](RISKS.md).

Tylko, USM, Pickawood, Cubit i IKEA: wykonano ograniczone interakcje edytora. Roomle: otwarto zestawienie części. Reform: przejście1/4→2/4. Nike: Customize nieaktywny; Threekit: formularz demo. Mobile390px sprawdzono dla Studio, Tylko, USM, Pickawood, Cubit i wejścia Nike; pozostałe wymagają dalszej walidacji. Nie jest to pełny audyt WCAG ani fizycznych urządzeń.

## Następny checkpoint — Sprint1

Zakres: prawdziwe komunikaty o cenie i zapisie, spójne nazwy/stany interfejsu, dopracowanie hierarchii i nawigacji w istniejących narzędziach. Bez nowego silnika wyceny, kont ani migracji projektu. Akceptacja: starsze JSON i szkic zachowują ustawienia,300/19/12 bez regresji, nawigacja klawiaturą i mobile bez utraty czynności, testy TypeScript/studio/build/mobile oraz zrzuty przed/po. Oddzielny raport release z SHA i możliwością powrotu do poprzedniej wersji.
