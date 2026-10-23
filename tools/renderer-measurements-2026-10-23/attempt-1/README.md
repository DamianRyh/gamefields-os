# Przerwany eksperyment — zachowany wynik

Pierwszy start protokołu ABBA zakończył się po pełnej A85-1 (480 próbek) i częściowej B87-1. W drugiej serii O1,375px,powtórzenie2 nie zgłosiło gotowości po drugiej nawigacji w ciągu45s. Raport B87-1 ma status failed; brak trzeciej i czwartej serii. Cały eksperyment jest wyłączony z kompletnego porównania, a nie wybrana wolna próbka. Raporty zachowano bez zmian.

Nie ustalono przyczyny. Ten stan wystąpił przed edycją paneli, przy pustym tekście/logo O1. Nie dowodzi regresji optymalizacji paneli. Osobny diagnostyczny przebieg O1×375px×10powtórzeń przeszedł wszystkie60operacji; nie jest pełnym porównaniem ani dowodem braku błędu. Nie podnoszono timeoutu, nie dodano automatycznych ponowień i nie zmieniono aplikacji.

Do nowego harnessu dodano wyłącznie diagnostykę w catch (atrybuty sceny/alerty/tekst); ten plik jest dokładną kopią harnessu użytego w przerwanym eksperymencie. Nowe cztery serie muszą wszystkie używać identycznego nowego hasha. Zachowujemy przerwanie jako otwarty sygnał stabilności. Nie łączymy starych i nowych próbek. PNG pozostają lokalne, a w JSON zachowane są hashe obrazu.
