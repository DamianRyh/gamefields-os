# Wewnętrzny koszt i publiczna cena sprzedaży — 24.10.2026

Decyzja właściciela przeklasyfikowuje wcześniejsze kwoty jako koszty produkcji. Tabele przeniesiono z pricing/ do biblioteki wewnętrznej; nie są plikami publicznymi ani zasobami klienta. Stare rewizje i wcześniej pobrane kopie mogą zachowywać uprzednio opublikowane dane; usunięcie z nowej wersji nie cofa publikacji.

API czyta INTERNAL_COST_CARD i SALES_MARGIN wyłącznie na serwerze. Stary QUOTE_RATE_CARD nie jest używany. Buduje nową kartę sprzedaży z jawnie dozwolonych pól: bez kopii kosztowych opisów, wersji, dodatkowych metadanych i marży. Cena jednostkowa sprzedaży = koszt jednostkowy/(1−marża), zaokrąglenie do grosza; potem ilość i suma. Nie jest to narzut. Marża nie jest wysyłana klientowi. Nie ma nowego publicznego endpointu kosztowego.

Klient, porównanie wariantów i zapytanie otrzymują wyłącznie wynik sprzedażowy. Badane scenariusze z fikcyjnymi kosztami potwierdzają brak kosztowych metadanych. Brak/nieprawidłowa marża przy istniejącym koszcie daje kontrolowany błąd503; brak kosztu daje unpriced. Nie ma fallbacku na koszt. Podatek nie jest domyślany, nieznane pozycje zachowują partial.

Publiczne testy korzystają wyłącznie ze sztucznych stawek. Kwoty produkcyjne i kosztowe pliki wyłączono z nowego źródła. Nie zmieniono modeli, Project, IndexedDB ani SQL. Dane techniczne/BOM i kotwienie nadal mają wcześniejsze ograniczenia. Fizyczna poprawność kosztów jest deklaracją właściciela, nie wynikiem audytu produkcji.
