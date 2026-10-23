# Studio 89 — dowody wdrożenia

Źródło Sites: `b4da8bcdd172c8bfb4ea01d8f7c4433e78c54a42`. Wersja 89, środowisko 4, publikacja zakończona sukcesem 2026-10-23. Archiwum lokalne SHA256 `3f9d5f98c6f9d5a603091121c7bb2c93fc2e4cc9dee4d0d777424d706590dd7a`; normalizowany hash archiwum Sites `8223cbeeac4d5741336e8c8d3d9444fa6c151f941f9868464aef4609e94d2d70`. To różne reprezentacje archiwum; wszystkie 84 pakiety badanego builda odpowiadają archiwum lokalnemu.

Profil V2 obejmuje pięć kolejnych instrumentowanych prób na wersję, Street Field 1440 px: tekst 491,8 → 410,6 ms, cached redraw 327,2 → 329,4 ms. Nie jest to ABBA, pomiar GPU, FPS ani dowód uniwersalnego przyspieszenia. Uniform/attribute lookups 1374/405 → 0/0; pozostałe liczniki bez zmian, trzy widoki identyczne RGBA. Surowe próby, minimum i maksimum: `baseline88-v2.json`, `candidate-final-v2.json`, `comparison-final-v2.json`. Harness wymaga lokalnych ścieżek/buildów opisanych w jego zmiennych; nie publikuje tych buildów.

Produkcyjny stateless POST `/api/quote` przeszedł pełne porównanie z lokalnym silnikiem i kartą roboczą: HTTP 200, 24 574,80 PLN netto dla zapisanej konfiguracji, `workingAssumptions=true`, `priceGross=null`, `vatRate=null`. Nie wysłano formularza ani wiadomości i nie zapisano projektu w bazie. Skrypt po instalacji zależności integracji uruchamia się w Node obsługującym TypeScript; sam test powtarza pojedyncze obliczenie.

Dane techniczne połączeń, kotew i fundamentów oraz zatwierdzone stawki nadal wymagają danych właściciela i konstruktora. Szczegółowy wewnętrzny arkusz rozbieżności nie jest częścią publikacji.
