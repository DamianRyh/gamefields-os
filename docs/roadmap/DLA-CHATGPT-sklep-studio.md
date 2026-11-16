# Dla ChatGPT: sklep = produkty i ceny ze Studia (motyw 1.0.29), 16.11.2026

## Co się zmienia

- **Sklep** pokazuje tylko produkty ze Studia, w cenach ze Studia (netto, pod spodem brutto):
  - 8 modeli boisk: od Panna Octa Cage 90 do Street Arena 15;
  - 8 nawierzchni za m²: płyta betonowa, malowanie, EPDM, płytki, trawa, akryl, płyty gumowe, maty gumowe.
- Przycisk w sklepie: „Zaprojektuj w Studio” lub „Wybierz w Studio”. Na karcie produktu jest dodatkowo „Zapytaj o wycenę”.
- **Stare produkty** (Perfo-Circle, Net-Rect, Solid-Circle, Plexi, nawierzchnie asfaltowa/brukowa/piaszczysta/recyklingowa itd.):
  - są **ukryte**, nie usunięte;
  - ich adresy przekierowują (301) do nowego odpowiednika albo do sklepu;
  - poprzednia widoczność zapisuje się w polu `_gft_prev_visibility` (do ewentualnego cofnięcia).
- **Plakat** znika z listy sklepu, ale kreator plakatu na stronie głównej działa jak dotąd.
- Ceny pochodzą z pliku `data/studio-shop.json`, generowanego z tych samych cenników co Studio i strona główna.

Motyw 1.0.29 zawiera też zmiany 1.0.28 (polecenie 13, część A: „Ceny” w menu i ceny na kafelkach).
Jeśli polecenie 13 nie jest jeszcze wykonane, zamiast jego części A wykonaj część A poniżej, a potem część B polecenia 13.

## A. Pliki motywu (zrób kopię każdego pliku przed zmianą)

Podmień lub dodaj w `wp-content/themes/gamefields/` (pliki tekstowe, pobierz z linków):

| Plik w motywie | Nowy? | SHA-256 |
|---|---|---|
| [`functions.php`](https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/theme/gamefields/functions.php) | zmiana | `c1ea4ca2b832c1c9…` |
| [`style.css`](https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/theme/gamefields/style.css) | zmiana | `ad05a6249c38e13a…` |
| [`inc/shop.php`](https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/theme/gamefields/inc/shop.php) | zmiana | `81e1d1750318864b…` |
| [`inc/studio-shop.php`](https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/theme/gamefields/inc/studio-shop.php) | **nowy** | `ea851c3338484321…` |
| [`data/studio-shop.json`](https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/theme/gamefields/data/studio-shop.json) | **nowy** | `5ec548843b711ad7…` |
| [`assets/css/gft.css`](https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/theme/gamefields/assets/css/gft.css) | zmiana | `2cca4f921893b5ec…` |
| [`assets/js/home/gf-home.js`](https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/theme/gamefields/assets/js/home/gf-home.js) | zmiana | `af60a6a8ef86bf66…` |

Sprawdź, że w pobranym `gf-home.js` nie ma `&&`. Pełne sumy: `sha256sum` każdego pliku musi zaczynać się od podanych 16 znaków.

## B. Synchronizacja sklepu

1. Wejdź do panelu WordPressa jako administrator (dowolna strona wp-admin). Synchronizacja uruchomi się sama, raz.
   U góry pojawi się komunikat: „Sklep = Studio (wersja …): utworzone 16, zaktualizowane 0, ukryte stare 16”.
2. Jeśli komunikat podaje błędy (SKU), przekaż je właścicielowi.
3. Sprawdź w Produktach:
   - 16 nowych produktów (SKU GF-CT-001…008 i GF-NW-001…008), typ „Zewnętrzny/afiliacyjny”, wszystkie ze zdjęciem;
   - stare produkty mają widoczność „Ukryty”.
4. Wyczyść cache LiteSpeed.

## C. Kontrola na stronie

- /shop/:
  - 16 produktów;
  - najpierw boiska od najtańszego, potem nawierzchnie;
  - ceny „od … zł netto” i pod spodem brutto;
  - przycisk prowadzi do Studia.
- Karta produktu, np. /product/panna-play/: przyciski „Zaprojektuj w Studio” i „Zapytaj o wycenę”.
- Stary adres, np. /product/boisko-panna-perfo-circle/, przekierowuje do /shop/.
- /product/nawierzchnia-betonowa/ przekierowuje do /product/plyta-betonowa/.
- Kreator plakatu na stronie głównej nadal dodaje plakat (albo otwiera zapytanie, jeśli płatności są wyłączone).
- Pokaż właścicielowi podgląd /shop/ na komputerze i telefonie.

## Cofnięcie

- Przywróć kopie plików motywu.
- Nowe produkty przenieś do szkiców.
- Starym produktom przywróć widoczność z pola `_gft_prev_visibility`.
