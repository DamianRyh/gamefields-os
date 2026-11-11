# P1 - fundament Studio, 29.10.2026

## Zakres i punkt odniesienia

Aktywny projekt Sites: `appgprj_6abbd0ba26f0819197701343bf156f1b`.
Adres: https://gamefields-studio.ryhfs90.chatgpt.site/ .
Stan wyjściowy: produkcja v127 według get_site; źródło otwarte przez oficjalny helper, commit `daf2fdcda72526a9d57ac2e8bf8c0cb74e69d5ef`. W trakcie prac zapisano v128 z tym samym commitem `daf2fdcda72526a9d57ac2e8bf8c0cb74e69d5ef` (list_site_versions); zachowano tę równoległą zmianę. Sam numer wersji nie dowodzi zgodności całego lokalnego drzewa z produkcją. Nie używamy starej kopii published-studio.

P1 obejmuje aktualny audyt fundamentów, odporność podglądu 3D, wspólny Project, lokalny zapis/odzyskiwanie i poprawne przedstawienie orientacyjnej kalkulacji. Pełny checkout, konto/synchronizacja między urządzeniami i rozszerzanie dyscyplin należą do P2.

## Rzeczywisty stan

| Obszar | Ustalenie i dowód | Ograniczenie |
| --- | --- | --- |
| 3D | Produkcyjny Panna Play widoczny; kod obsługuje modele, obrót, grafikę, PBR i standardowy fallback. | Nie utożsamiamy podglądu z dokumentacją konstrukcyjną. |
| Spójny projekt | Edytor, eksport, warianty i kalkulacja korzystają z Project oraz walidacji schematu. Testy domenowe PASS. | Ilości z modelu nie zatwierdzają fundamentów/stref bezpieczeństwa. |
| Zapis | Szkic w localStorage, kopia odzyskiwania i do sześciu nazwanych wariantów w IndexedDB; import/eksport JSON. | To zapis w danej przeglądarce, bez synchronizacji konta. |
| Ochrona danych | Testy: quota, uszkodzony szkic, konflikt kart, anulowany zapis, rewizje modelu PASS. | Czyszczenie danych przeglądarki wymaga uprzednio pobranej kopii JSON. |
| Wycena | Produkcja pokazuje orientacyjną cenę i składniki; API ukrywa dane kosztowe, brakujące stawki pozostawia nieznane. | Nie zatwierdzano nowych stawek ani podatku; transport/montaż i finalna oferta wymagają potwierdzenia lokalizacji. |
| Biblioteka | Test:studio potwierdza 300 wzorów, 19 palet, 12 Signature i zachowane profile/zasoby. | Pełna zgodność sportowa i eksport wykonawczy pozostają osobnymi odbiorami. |

## Zmiany P1

1. Kalkulacja ma limit 15 sekund obejmujący pobranie i odczyt odpowiedzi. Brak odpowiedzi uruchamia istniejący komunikat błędu i ponowienie; porzucona odpowiedź nie przywraca starej ceny.
2. Walidacja całej odpowiedzi kalkulacji obejmuje kwoty, pozycje, założenia, walutę i status. Częściowa wycena z zadeklarowaną pełną ceną jest odrzucana zamiast prezentowana klientowi.
3. Uruchamianie leniwego renderera PBR ma limit 15 sekund i przechodzi do istniejącego standardowego renderera. Spóźniony moduł nie podmienia odzyskanego podglądu. Widoczne ładowanie obejmuje także start renderera.
4. Link wybierający samą nawierzchnię rozpoczyna jawnie wybrany projekt, bez odtwarzania niezwiązanego szkicu. Dotychczasowy zapis podlega istniejącej ochronie/kopii przed zastąpieniem.
5. Test renderera korzysta z aktualnych przewodników w nagłówku zamiast wycofanego przycisku pomocy.

## Kontrola odbioru

- `pnpm exec tsc --noEmit` - PASS.
- `pnpm test:studio` - PASS.
- `pnpm build` - PASS; istnieją ostrzeżenia rozmiaru chunków i zasobów mapy.
- `node tests/quote-request.mjs` - PASS: format/zakres, HTTP, timeout pobierania i odczytu, anulowanie, późna odpowiedź i retry.
- `node tests/project-vault.mjs`, `node tests/draft-write.mjs` - PASS.
- `node tests/quote-engine.mjs`, `node tests/construction-pricing.mjs`, `node tests/sales-rate-card.mjs`, `node tests/palette-pricing.mjs` - PASS; sztuczne stawki testowe nie są ofertą.
- `node tests/quote-api.mjs` - PASS: zbudowany Worker, brak wycieku kosztów i marży, błędna konfiguracja zamyka wycenę, no-store.
- `node tests/p1-acceptance-browser.mjs` - PASS: 390/1440 px, utrata kontekstu/retry i niezmienny JSON; uszkodzona odpowiedź i 15-sekundowy timeout kalkulacji z ponowieniem; link nawierzchni; zachowany uszkodzony szkic. Osobno: zatrzymany chunk PBR, standardowy fallback i ignorowana spóźniona inicjalizacja.
- `node tests/studio-realism.mjs` - PASS: O1/P1 x 390/1440, cztery materiały, kolory, tekst, wykończenia, obrót, brak błędów GPU, bez ciągłej pętli idle; dodatkowo WebGL1 fallback.
- `pnpm test:mobile` - PASS: 375/390/430/1440, 8 widoków O1/P1 i 4 niezależne nawierzchnie Street Football, 16 zmian materiału, widoczny WebGL, kolory w JSON, import/eksport, Radar filtr/szczegóły/powrót, brak overflow/błędów runtime.
- Dowody obrazowe: `outputs/p1-2026-10-29/`, `outputs/studio-realism/`, `outputs/mobile/` (lokalne, poza publicznym repo).
- Publikacja: przygotowany odbiór techniczny; wynik wdrożenia zapisujemy w lokalnym potwierdzeniu wydania po odpowiedzi Sites.

## Dalsze granice

Fizyczny iPhone/Safari, wszystkie kombinacje urządzeń i zatwierdzenie jakości wizualnej względem wzorca pozostają otwarte. Nie obiecujemy pełnej ceny, gdy brak którejkolwiek pozycji. Nie zmieniono stawek komercyjnych, źródłowej geometrii, dawnych migracji ani zakresu danych klienta. P1 nie oznacza zakończenia całej ścieżki sprzedaży.
