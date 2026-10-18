# Odbiór publicznego Studio — 18.10.2026

Zakres: obecny publiczny konfigurator oraz karty produktów. Odczyt i interakcje w Chromium, przez transport HTTPS z weryfikacją TLS. Bez wysyłania formularzy. To odbiór ograniczonego przepływu, nie potwierdzenie całej aplikacji ani zgodności z WCAG.

| Krok | Stan | Dowód i wniosek |
| --- | --- | --- |
| 1. Wejście `/konfigurator-boisk/` | Działa po załadowaniu | Widoczny edytor osadzony w iframe. Początkowe „Wczytywanie szkicu” znika. Nie należy diagnozować awarii na podstawie samego SSR. |
| 2. Parametry w adresie | Działa dla sprawdzonego zestawu | `pattern=geometric&variant=5&palette=tokyo` przechodzi do iframe; po uruchomieniu pokazuje Geometric/Tokyo zamiast początkowego Organic Flow/Court Culture. |
| 3. Podsumowanie | Działa w sprawdzonym przypadku | Modal zawiera 15 × 10 m, 150 m², Geometric wariant 5, Tokyo i 2 elementy. Pokazuje „Wycenę indywidualną”, nie wyliczoną cenę. Formularza nie wysłano. |
| 4. Zgodność z `main` | Niepotwierdzona; widoczna różnica | Publiczny edytor ma fioletowy interfejs Court Culture i podsumowanie w modalu; kod `main` ma wdrożony w PR #43 przepływ czterech etapów. Publiczny HTML nie zawiera identyfikatora commita pozwalającego ustalić źródło. |
| 5. Backend i brama domeny | Wymaga osobnego wdrożenia | Upstream `/api/play/health` zwraca 404 przy prawidłowym User-Agent. Domyślny techniczny User-Agent może dostawać 403 Cloudflare; nie oznacza to niedostępności całego UI. |

Aktualnie sprawdzone adresy: `https://www.gamefields.eu/konfigurator-boisk/` i `https://gamefields-studio.ryhfs90.chatgpt.site/`. Odczyt root aplikacji: HTTP 200, tytuł Gamefields, assety `_next/static/chunks/*`. Bez dostępu do panelu publikacji hosta nie można potwierdzić lub zmienić powiązania repozytorium z wersją produkcyjną.

## Zrzuty z bieżącego odbioru

Lokalnie w `outputs/www-wordpress/`, poza Git: `studio-iframe.png` (osadzony edytor Organic Flow), `studio-direct-1440.png` (Geometric/Tokyo), `studio-summary-1440.png` (podsumowanie). Zrzuty otwarto i sprawdzono. Pierwszy pełny zrzut wrappera miał puste pole iframe mimo działającego DOM; zastąpiono go bezpośrednim zrzutem elementu iframe, na którym edytor jest widoczny.

## Dalsze działania poza dostępnymi narzędziami

1. W panelu publikacji `gamefields-studio.ryhfs90.chatgpt.site` ustalić projekt i źródłowy commit. Potrzebne uprawnienie do publikacji aplikacji; sesja WordPressa go nie zapewnia. Ustawić powtarzalny deploy z `main` i identyfikator wersji widoczny technicznie w buildzie.
2. Przed przełączeniem bramy przygotować backup bazy aplikacji, ustalić stan migracji i binding D1 oraz konfigurację cennika. Nie uruchamiać migracji „w ciemno”. Dopiero zdrowy upstream pozwala instalować przygotowaną bramę `/studio` i `/play`.
3. Przeprowadzić kontrolowaną próbę dostarczenia zapytania do skrzynki po uzgodnieniu odbiorcy. Dotychczasowe testy sprawdzają formularz bez wysyłki i nie dowodzą dostarczenia poczty.
4. Właściciel oferty powinien potwierdzić brakujące wymiary i zakres istniejących cen Panna (podatki, transport, montaż, nawierzchnia). Nie uzupełniano tych danych domysłami.

Nie zmieniono hosta aplikacji, konfiguracji cache, wtyczek ani bazy D1 podczas tego etapu.

## Wdrożony przepływ produktowy

1. **Katalog — wdrożony.** Siedem modeli zachowanych; cztery filtry kształtu i porównanie danych z kart.
2. **Karta produktu — wdrożona ścieżka kontaktu.** Model przechodzi do formularza zamiast ginąć przy nieaktualnej kotwicy. Poprawiono mobilne nagłówki obu wariantów szablonu treści.
3. **Zapytanie — sprawdzone bez wysyłki.** Model, kierunek i wiadomość są zachowane razem; nowy projekt ze Studio czyści wcześniejsze oznaczenie. Nieznany identyfikator produktu jest ignorowany.

Źródła i procedura cofnięcia znajdują się w `integrations/wordpress/products/`. Odbiór przeglądarkowy obejmuje 1440/768/390 px, dodatkowo sprawdzono szerokości 912/1024 px nawigacji strony głównej. Nie stwierdzono poziomego przepełnienia strony. Zrzuty odbiorowe lokalnie: `catalog-*.png`, `product-comparison-*.png`, `product-*.png`, `product-inquiry-*.png` w `outputs/www-wordpress/`.
