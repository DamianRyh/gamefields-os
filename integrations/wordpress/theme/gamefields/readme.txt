=== Gamefields ===
Lekki motyw Gamefields zastępujący Savoy.

- Nagłówek i stopka jak na stronie głównej (strona główna ma własne).
- Podstrony zbudowane jako własny HTML (gfsilo, gfbrand, gfguide, gfseo, gfsub, gfcommercial, gfcatalog, gfp, gfp2)
  dostają wygląd strony głównej przez assets/css/gft-standard.css; ich własne paski nawigacji są ukryte.
- Szablon „Pełna szerokość” ma tę samą nazwę pliku co w Savoy (templates/page-full.php), więc strony go zachowują.
- Dodatkowy CSS zapisany przy Savoy jest dalej drukowany (od sekcji City: City, baner cookies, poprawki nagłówków),
  dopóki nowy motyw nie ma własnego.
- WooCommerce: domyślne szablony, styl Gamefields, „Cena na zapytanie” i „Zapytaj o wycenę” dla produktów bez ceny.
- Menu jest wbudowane w motyw (gft_nav_items w functions.php), tak samo jak na stronie głównej.
- Sklep = Studio (1.0.29, inc/studio-shop.php): produkty i ceny z data/studio-shop.json (generator: integrations/wordpress/offer/build_studio_shop.py). Synchronizacja przy wejściu administratora do wp-admin, raz na wersję danych; stare produkty tylko ukryte (_gft_prev_visibility) i przekierowane 301.
- Sklep jako showroom (1.0.30, templates/shop-studio.php): strona /shop/ pokazuje 8 boisk na scenie (3D dla Play, Court, Ring, Octa; rendery na kolorach marki dla pozostałych), nawierzchnie z kalkulatorem ceny dla wybranego boiska i „Jak zamówić”. Kategorie, wyszukiwanie i sortowanie zostają listą WooCommerce.
- 1.0.31: zakładka „Wiedza o produkcie” na kartach produktów ze Studia (parametry, co zawiera cena, ceny nawierzchni dla modelu, gwarancja, poradniki); opinie i komentarze przy produktach wyłączone; nowe tekstury betonu i malowania (zdjęcie CC0 z Poly Haven).
- 1.0.32: plakaty bez tekstu — w kreatorze tylko układ „Pełny spad”, bez zakładek Tekst i Układ oraz bez wyboru papieru; stare linki z napisem otwierają się jako czysty pełny spad.
