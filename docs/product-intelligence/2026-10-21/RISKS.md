# Ryzyka i bramki decyzji

> Aktualizacja 21.10.2026: poniżej zachowano historyczny audyt/propozycję Sprintu0. Aktualny stan realizacji i późniejsze decyzje właściciela (włączony cennik, potwierdzanie zapytania, wspólna geometria) opisuje [REALIZACJA_ZMIANY.md](REALIZACJA_ZMIANY.md). Dawne zalecenie pricing OFF i prostokątnej powierzchni Octagonu nie opisuje bieżącego Studio.

| Priorytet | Ryzyko / dowód | Działanie i warunek zamknięcia |
|---|---|---|
| P0 | Biblioteka zapowiada przeliczanie ceny, request wyłączony | Sprint1: uczciwa informacja o indywidualnej wycenie; bez aktywacji starego kalkulatora. |
| P0 | Różne checkouty, brudny root | Każdy release z autorytatywnego źródła Sites i zweryfikowanego main; lease SHA; bez resetu cudzych zmian. |
| P1 | Generyczna scena foto15×10 nie jest parametryczna | Oddzielne możliwości renderera; zakaz obietnicy dokładnego podglądu dowolnych wymiarów. Test zakresów i ostrzeżeń. |
| P1 | Bounding box octagonu nie jest ilością nawierzchni | Zachować etykietę; obliczyć polygon/obrys na zweryfikowanej geometrii przed wyceną materiału. |
| P1 | Studio import dopuszcza swobodne wyposażenie | Rozszerzać istniejącą walidację; współdzielone kody komponentów i rodzina; żadnego swobodnego skalowania konstrukcji. |
| P1 | Lokalne dane przeglądarki bez historii chmurowej | Eksport JSON, bezpieczny import i recovery; żadnego claimu o koncie/chmurze. Test starszych projektów i błędu quota. |
| P1 | Zapytanie skraca dane i usuwa grafikę | Jawna specyfikacja payloadu i test długiego projektu bez wysyłania kolejnego emaila. Wcześniejszy test CF7 potwierdza przyjęcie, nie odbiór skrzynki. |
| P1 | SVG i upload nie mają pełnego audytu bezpieczeństwa | Osobny test sanitacji/rasteryzacji, limity, CSP, origin/source przy komunikacji hosta. |
| P1 | Stare stawki/VAT niepotwierdzone | Wersjonowany cennik, waluta, podstawa podatku, zakres/wyłączenia; brak danych = nieznana cena, nigdy0. |
| P1 | Brak pełnej bazy faktów do polityki prywatności | Potwierdzić operatora/adres, hosting, retencję, transfery; nie traktować szkicu jako zakończonego audytu prawnego. |
| P2 | Koszt 3D/mobile i LCP | Nowy baseline po aktualnym release; budżety ustalać pomiarem, bez przypisywania starego Lighthouse do v71. |
| P2 | Benchmark publiczny ograniczony kontami/demo | Nike/Threekit oznaczone blokadą; dokumentacja odróżniona od testów. Brak udawanej oceny pełnego flow. |

Sprint0 nie zmienił kodu aplikacji, schematu, modeli, danych klientów ani wdrożenia. Zrzuty konkurencji pozostają lokalnym materiałem badawczym; publiczny raport zawiera odsyłacze i parafrazy obserwacji.
