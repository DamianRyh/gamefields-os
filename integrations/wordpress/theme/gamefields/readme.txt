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
