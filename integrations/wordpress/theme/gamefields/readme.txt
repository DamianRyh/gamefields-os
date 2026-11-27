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
- 1.0.33: zestawy na stronie głównej pokazują widok ze Studio 3D (konstrukcja z nawierzchnią Masters II na podłodze, assets/js/home/kits/), link otwiera ten sam wzór, paletę i kolory w Studiu, cena konstrukcji przy zestawie.
- 1.0.35: zawiera zmiany plakatów zrobione na serwerze w 1.0.34 (bez nieprzezroczystego koła na środku w Duperré Fade i Op Rings, etykieta „podgląd poglądowy”, jednakowy rozmiar podglądu dla formatów) oraz zestawy ze Studio 3D z 1.0.33.
- 1.0.36: jeden nagłówek na wszystkich stronach, także na stronie głównej (stary nagłówek bloku strony głównej #gfs-nav jest ukryty). Przy „Studio 3D” fioletowy „Wyślij zdjęcie placu” (/#zdjecie), na telefonie „Wyślij zdjęcie”. Napisy nie łamią się: opis znika poniżej 1360 px, przycisk skraca się poniżej 1180 px i znika poniżej 1100 px, menu mobilne od 900 px. Na stronie głównej menu podświetla bieżącą sekcję. Stopka: „Boiska panna i street football” prowadzi do /boiska-street-football/.
- 1.0.37: „Udostępnij” w banerze strony głównej: grafika Stories/Post (Clean, Street) albo film 6 s z modelu 3D banera w wybranych kolorach; te same szablony co Studio (assets/js/home/gf-share-core.js, generowany z integrations/studio/canvas-editor/lib/share-media przez scripts/build-share-core.mjs), okno w assets/js/home/gf-share.js ładowane dopiero po kliknięciu. Link /?boisko=&panele=&rama= otwiera baner z tym modelem i kolorami. Zdarzenia window „gf-share” (source: home).
