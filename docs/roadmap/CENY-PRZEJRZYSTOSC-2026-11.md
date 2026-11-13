# Przejrzystość cenowa: ceny modeli, Studio i karta projektu (12.11.2026)

## Stan wyjściowy

- Produkcyjne Studio ma kartę stawek sprzedaży `GF-SALES-2026-10-23-v1` (koszt z ustawień serwera plus marża, oznaczona jako „robocze założenia”) i liczy cenę każdego projektu w `/api/quote`.
- Interfejs tę cenę ukrywał (od wersji v159–v160), pokazywał tylko „Indywidualna wycena”.

## Co zmienia ta gałąź

1. **Studio pokazuje widełki** zamiast „Indywidualna wycena”: w przycisku Podsumowanie (np. „33–41 tys. zł netto”) i w podsumowaniu z rozbiciem na pozycje, zakresem i wyłączeniami.
   - Widełki = cena z karty stawek × 0,95 do × 1,15, zaokrąglone na zewnątrz (do 1000 zł powyżej 20 000 zł). Stałe `RANGE_LOW` i `RANGE_HIGH` w `integrations/studio/canvas-editor/lib/price-range.ts`.
   - Jeśli część pozycji nie ma stawki: tylko „od X”. Bez karty stawek: dalej „Indywidualna wycena”, bez żadnej kwoty.
   - Wyłącznik: `SHOW_PRICE_RANGE=false` w tym samym pliku przywraca poprzedni widok.
2. **Karta projektu (PDF)** w podsumowaniu: jedna strona A4 z widokiem z góry, parametrami, widełkami z pozycjami i kontaktem. Zapis przez okno drukowania („Zapisz jako PDF”), bez nowej biblioteki, działa także w telefonie i w Studio osadzonym na gamefields.eu.
3. **Ceny „od–do” 8 modeli** z produkcyjnej karty stawek: `integrations/wordpress/offer/price-ranges.json`, skrypt `tools/pricing/price_ranges.py`.

## Ceny modeli do akceptacji (netto)

„Od” = najtańsza nawierzchnia bez grafiki. „Do” = najdroższa nawierzchnia z grafiką i liniami. Obie z konstrukcją, montażem, projektem i transportem. Bez przygotowania terenu, podbudowy, fundamentów, przyłączy i formalności.

| Model | Kod | Nawierzchnia | Sama konstrukcja | Cena orientacyjna |
| --- | --- | --- | --- | --- |
| Panna Ring | GF-CT-001 | 19,6 m² | 18 714 zł | **27–38 tys. zł** |
| Panna Play | GF-CT-002 | 27,4 m² | 15 000 zł | **25–39 tys. zł** |
| Panna Court | GF-CT-003 | 39,3 m² | 31 857 zł | **45–63 tys. zł** |
| Panna Cage 90 | GF-CT-005 | 28,3 m² | 20 000 zł | **31–45 tys. zł** |
| Panna Cage 180 | GF-CT-006 | 28,3 m² | 32 429 zł | **44–58 tys. zł** |
| Panna Octa | GF-CT-008 | 29,8 m² | 21 857 zł | **33–48 tys. zł** |
| Panna Grid | GF-CT-007 | 38,7 m² | 23 714 zł | **36–55 tys. zł** |
| Street Arena 15 | GF-CT-004 | 149,2 m² | 37 429 zł | **68–133 tys. zł** |

## Do decyzji właściciela

- [ ] Czy stawki `GF-SALES-2026-10-23-v1` mogą być pokazywane klientom (dziś oznaczone jako robocze)?
- [ ] Widełki: czy −5% / +15% są dobre?
- [ ] Panna Ring wychodzi drożej niż większa Panna Play (konstrukcja 18 714 zł wobec 15 000 zł). Czy to celowe?
- [ ] Gdzie pokazać ceny na stronie: karty modeli w kolekcji („od 25 tys. zł netto”), karty produktów w sklepie, FAQ „Czy cena jest widoczna od razu?”.

## Wdrożenie

1. Studio: nowa wersja w Sites z gałęzi po scaleniu (instrukcja jak dotąd w `integrations/studio/canvas-editor/DEPLOYMENT.md`). Karta stawek i marża zostają w ustawieniach serwera, nic nie trafia do kodu.
2. Strona: po akceptacji tabeli dopiszę „od … zł netto” do kart modeli i odpowiedź w FAQ (osobna zmiana).


## Decyzja właściciela (13.11.2026)

- „Od” na stronie to **cena samej konstrukcji z bramkami** (bez nawierzchni, montażu, transportu i grafiki).
- Panna Ring, Panna Grid, Panna Court: cena konstrukcji z karty stawek Studio, zaokrąglona w dół.
- Dane: `integrations/wordpress/offer/price-from.json`. Sekcja „Ile kosztuje arena?” na stronie głównej i odpowiedź w FAQ są generowane z tego pliku.

| Model | Konstrukcja od (netto) | Brutto | Karta stawek Studio dziś |
| --- | --- | --- | --- |
| Arena mobilna eventowa | 12 000 zł | 14 760 zł | — |
| Panna Octa Cage 90 | 16 000 zł | 19 680 zł | 20 000 zł |
| Panna Play | 18 000 zł | 22 140 zł | 15 000 zł |
| Panna Ring | 18 000 zł | 22 140 zł | 18 714 zł |
| Panna Octa | 22 000 zł | 27 060 zł | 21 857 zł |
| Panna Grid | 23 000 zł | 28 290 zł | 23 714 zł |
| Panna Octa Cage 180 | 26 000 zł | 31 980 zł | 32 429 zł |
| Panna Court | 31 000 zł | 38 130 zł | 31 857 zł |
| Boisko 3 na 3 (Street Arena 15) | 45 000 zł | 55 350 zł | 37 429 zł |

## Do zrobienia przed publikacją Studio

Karta stawek Studio (`INTERNAL_COST_CARD.arenaNet`) daje inne ceny konstrukcji niż tabela właściciela (np. Panna Octa Cage 90: 20 000 zł zamiast 16 000 zł, Boisko 3 na 3: 37 429 zł zamiast 45 000 zł). Przed publikacją Studio z widełkami osoba z dostępem do ustawień serwera Studio ustawia `arenaNet` tak, żeby cena sprzedaży konstrukcji była równa tabeli: koszt = cena z tabeli × (1 − SALES_MARGIN). Bez tego klient zobaczy w Studio inną cenę konstrukcji niż na stronie.
