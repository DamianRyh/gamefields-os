# P2 — Studio, 29 października 2026

## Zakres

Pięć priorytetowych sportów: Teqball, Street Football, Panna, koszykówka 3×3 i pełna koszykówka. Teqball ma osobną nawierzchnię 16 × 12 m i poglądowy stół; koszykówka odpowiednio jeden/dwa kosze. Wymiary, oznaczenia, wyposażenie, kalkulacja i specyfikacja korzystają z tej samej konfiguracji. Zachowano pozostałe nawierzchnie, 300 wzorów, 19 palet, 12 kierunków Signature i istniejące konstrukcje.

Pliki projektu zawierają bibliotekę lokalnych wariantów, udostępnianie zapisanej wersji, przeglądanie Warsztatu i wejście do istniejącego katalogu. Udostępnianie zapisuje kopię w D1 za zgodą użytkownika: domyślnie bez prywatnej nazwy, napisów i logo. Link ma 30 dni ważności, osobny klucz odczytu w fragmencie URL i klucz wycofania zachowany w przeglądarce autora. Serwer przechowuje hashe kluczy. Wycofanie usuwa konfigurację; wygasłe rekordy są usuwane przy odczycie danego linku lub tworzeniu nowych. Odbiorca może otworzyć własną kopię; podgląd nie zapisuje szkicu. Rewizja źródła chroni przed cichym pokazaniem innej geometrii. Brak kont i panelu odzyskiwania klucza po utracie pamięci urządzenia.

Warsztat pobiera po 12 projektów, wyszukuje nazwy i otwiera niezależne kopie. Miniatury są statyczne; listy nie tworzą scen WebGL. Kod udostępniania i Warsztatu jest ładowany dopiero po wyborze zakładki. Katalog korzysta z istniejącego modułu, a przejście do niego zachowuje aktualny szkic.

Finalizacja to zatwierdzone przez właściciela **zapytanie z projektem i kalkulacją**. Formularz WordPress otrzymuje konfigurację i aktualny stan wyceny. Potwierdzenie transportu oznacza dołączenie danych do formularza, a nie wysyłkę wiadomości lub zamówienie. Można pobrać osobny pakiet zapytania z SHA-256 konfiguracji. Obrazy logo przesyła się osobno; pełny projekt JSON zachowuje grafiki. Poradniki są dostępne przy sporcie i w podsumowaniu.

## Zachowanie równoległych zmian

Scalono źródła od v144 przez `73beea8` (niezależne części konstrukcji) do `e57c66a` (synchronizacja kolorów, zwalnianie podglądów po zamknięciu). Zachowano pływający panel, dolne karuzele, optymalizowane modele karuzel, zbliżenia paneli O1 i osobny `goalPanelColor`. Ten kolor przechodzi również przez Warsztat i udostępnianie. Nie przywrócono poprzedniego podziału ekranu.

Naprawiono różnicę serwer/klient przy tworzeniu portalu palety. Na telefonie stała paleta zasłaniała zakładki; teraz otwiera się przyciskiem i zamyka po wyborze, Escape lub kliknięciu poza nią. Komputer zachowuje stałą paletę. Mobilne karty sportów są mniejsze i mieszczą nazwy bez wychodzenia poza panel.

## Dane i migracja

`0013_studio_shared_projects.sql` dodaje tylko dwie tabele i ich indeksy: udostępnione projekty oraz krótkotrwałe liczniki CREW. Historyczne migracje pozostają niezmienione. Schema i wygenerowany snapshot P2 są wydzielone w `db/`; snapshot opisuje wyłącznie nowe tabele i nie zastępuje historycznego modelu danych. Nie wolno generować z niego usuwania dawnych tabel. Limity zapisu są atomowe: 5 linków/10 minut oraz 12 pytań CREW/minutę. Pytania i odpowiedzi CREW nie są zapisywane w D1.

## Weryfikacja i granice

TypeScript, test:studio i build; testy pięciu sportów, rewizji/wyposażenia, walidacji prywatności i kluczy; lokalny Worker sprawdza API udostępniania, wycofanie, limity i odpowiedzi CREW z atrapą OpenAI. Testy przeglądarkowe obejmują pięć sportów 375/1440, JSON, widoczne piksele GPU, bibliotekę, udostępnianie, własną kopię, wycofanie, paginację/wyszukiwanie, pakiet zapytania oraz formularz na aktualnym kodzie WordPress. Formularz testowano w lokalnej kopii strony; nie wysłano zapytania handlowego.

**Blokada zewnętrzna:** test produkcyjny `/api/crew` zwrócił GET enabled=true, POST 502/AUTH — OpenAI odrzuca aktualny sekret serwera. Kod ma ograniczenie czasu, ochronę źródła/rozmiaru/liczby pytań i czytelny błąd, ale rozmowa na żywo wymaga aktywnego klucza OpenAI w ustawieniach Sites. Nie deklarujemy działającego produkcyjnego AI.

Brak zatwierdzonych cen wyposażenia pozostaje oznaczony „Do ustalenia”; nie zmieniono marży ani stawek. Stół/kosze są poglądowymi modelami, nie dokumentacją produkcyjną ani modelem konkretnego producenta. Specyfikacja cyfrowa nie potwierdza BOM, kotwienia, certyfikacji i wykonania. Katalog WordPress jest zewnętrznym źródłem; jego awaria ma stan błędu i ponowienie. Zapisy lokalne nie są synchronizacją konta. Zdjęcie/świat 3D pozostają istniejącymi laboratoriami poza zakresem P2.

Odbiór końcowy: `tsc --noEmit`, `test:studio`, build, `p2-api`, `quote-api`, `p2-browser`, `p2-inquiry-browser`, `wp-inquiry-bridge`, `primary-sports-browser`, `goal-panel-focus`, `test-construction-parts` oraz `test-construction-sync` — PASS. Regresję materiałów/JSON/kamer/Radaru wykonano dla 375/390/430 i oddzielnie 1440 px (mobilne otwieranie palety vs stała paleta desktopowa). Dawny test karuzeli v14 ma nieaktualne założenie sześciu kart po zmianie na trzy niezależne części v15/v16; aktualny przepływ pokrywają dwa testy konstrukcji wymienione powyżej. Dowody lokalne w `outputs/primary-sports`, `outputs/mobile`, `outputs/p2` i `outputs/product-viewer`. Publikację potwierdza osobny receipt Sites w `outputs/`.
