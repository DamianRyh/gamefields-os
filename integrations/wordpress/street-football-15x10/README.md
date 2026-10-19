# Publikacja produktu w WordPress

Docelowy produkt: `https://www.gamefields.eu/street-football-15x10/`.
Katalog: istniejąca strona 3465, `/boiska-street-football/`.
OS: istniejąca strona 3964, `/os/`.

Po udanym wdrożeniu GitHub Pages:

1. Utwórz stronę o tytule „Street Football 15 × 10 — Gamefields”, slug `street-football-15x10`, treść `product.html`.
2. W katalogu wstaw `catalog-card.html` tuż po pierwszym `<div class='grid'>`. Zachowaj istniejące karty. Uaktualnij etykietę liczby modeli i dodaj wiersz w tabeli porównania.
3. W OS dodaj przycisk `data-os="street15"` i wpis `street15:[base+'?view=street-football-15x10','Street Football 15 × 10 — kolory paneli']` do istniejącego słownika modułów.
4. Dodaj `"street-football-15x10":"Street Football 15 × 10"` do istniejącego słownika nazw produktów formularza na stronie głównej 3462.

Istniejące duże treści zmieniaj wyłącznie celowanymi operacjami `content/edit` z match-once; kopie/revizje WordPress pozostają mechanizmem cofnięcia. Nie zmieniaj motywu, danych klientów ani pozostałych produktów.

Stan: źródła i testy przygotowane; dedykowany manifest nowego produktu nie zmienia metadanych pozostałych modeli; właściciel zatwierdził publiczną dystrybucję modelu i kodu w DamianRyh/gamefields-os oraz wdrożenie produktu na gamefields.eu. Wdrożenie WordPress następuje po potwierdzeniu dostępności modelu na GitHub Pages.
