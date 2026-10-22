# Odzyskiwanie i warianty — 22.10.2026

W istniejącym panelu „Pliki projektu” dodano odzyskiwanie szkicu i bibliotekę maksymalnie sześciu nazwanych wariantów. Dwa wybrane warianty można zestawić w planach 2D i tabeli parametrów bez zmiany aktywnego projektu. Przywrócenie zachowuje kolory, wymiary, identyfikatory i komplet obiektów oraz podlega Cofnij. Kalkulacja jest odświeżana po przywróceniu; porównanie nie prezentuje zapamiętanych cen jako aktualnych.

## Kontrakt danych

- Dotychczasowy klucz localStorage `gamefields-studio-draft-v1` nadal zawiera bezpośredni Project JSON. Import/eksport i aliasy dawnych nazw pozostają zgodne; nazwy własne zachowane. Adapter dodatkowo odrzuca powtórzone identyfikatory obiektów.
- IndexedDB `gamefields-studio-library`, magazyn `records`: `previous-draft`, `unreadable-draft`, `named-variants-v1`, `last-deleted-variant-v1`. Kopie zachowują źródła grafik. Biblioteka ma wersjonowaną otoczkę schemaVersion 1; starszy Project nie wymaga nowych pól.
- Poprzedni poprawny szkic jest zabezpieczany przed pierwszym zastąpieniem w sesji, a nie przed każdym naciśnięciem klawisza. Import, szablon i przywrócenie wariantu zabezpieczają aktywny projekt przed zmianą.
- Nieczytelny szkic wstrzymuje automatyczny zapis. Można pobrać surowe dane, odzyskać poprzednią kopię lub jawnie kontynuować. Błąd kopii/quota nie pozwala nadpisać szkicu. Archiwum nieczytelnych danych i cofnięcie usunięcia przechowują tylko ostatni taki rekord.
- Współbieżne zapisy biblioteki używają transakcji IndexedDB. Szkic używa Web Locks, jeżeli przeglądarka je obsługuje, oraz sprawdzenia oczekiwanych danych. Bez Web Locks i przy starych kartach aplikacji brak gwarancji pełnej atomowości między kartami.
- Wariant przypina sourceRevision modelu. Niezgodna lub brakująca bieżąca rewizja blokuje przywrócenie; eksport JSON pozostaje dostępny. Nie następuje cicha migracja do innej geometrii.

Dane są lokalne dla przeglądarki, profilu i kontekstu strony. Osadzenie WordPress może mieć odrębny magazyn wskutek partycjonowania. Nie jest to synchronizacja konta ani kopia w chmurze. Czyszczenie danych, tryb prywatny i ograniczenia pamięci mogą usunąć zapis; pobrany JSON stanowi niezależną kopię.

## Weryfikacja

PASS: TypeScript, build, test:studio, quote-engine, construction-pricing oraz pełna regresja mobilna 375/390/430/1440 (96 scen O1/P1, 48 Street, 16 materiałów, JSON i Radar). Nowe testy project-vault i draft-write obejmują stare projekty, kopie, błędy quota, uszkodzony JSON, konflikt zapisu, limity i rewizje.

Ręcznie na lokalnym zbudowanym Workerze: pobranie uszkodzonych bajtów bez zmian, odzyskanie poprzedniej kopii, zapis A/B z różnymi obiektami, porównanie, eksport, przywrócenie i dokładna zgodność po Cofnij; odświeżenie biblioteki i cofnięcie usunięcia po ponownym wczytaniu. Produkcyjnych danych nie zapełniano wariantami QA. Brak testu na fizycznym urządzeniu i czytniku ekranu.
