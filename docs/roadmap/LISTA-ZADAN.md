# Lista zadań gamefields.eu

Bieżąca lista. Zasada: najpierw repozytorium (PR, testy), potem strona (wdrożenie, kontrola na żywo).
Polecenia do wdrożenia na stronie czekają w kolejce: `docs/roadmap/POLECENIA-DLA-CHATGPT.md`.
Statusy: ✅ zrobione · 🔄 w toku · ⏳ czeka na wdrożenie na stronie · ❓ czeka na decyzję właściciela · ⬜ do zrobienia

Ostatnia aktualizacja: 13.11.2026

## Teraz

| # | Zadanie | Repozytorium | Strona | Status |
| --- | --- | --- | --- | --- |
| 1 | Przejrzystość cenowa w Studio: cena samej konstrukcji (bez podłoża), karta konstrukcji PDF z modelem 3D, ceny zgodne ze stroną | ✅ PR #80, #86, #88 | ✅ Studio, sprawdzone 13.11: ceny 8 modeli = strona, Panna Play 40 000 zł netto w przycisku, podsumowaniu i karcie | ✅ |
| 10 | Studio: nawierzchnia betonowa bez wykończenia jako osobna cena obok konstrukcji (cennik 13.11, 283 zł/m²), domyślnie wliczona, do odznaczenia | ✅ PR #90, `lib/concrete-base.ts`, `offer/concrete-base.json` | Studio w Sites (polecenie 7) | ⏳ |
| 11 | Studio: malowanie nawierzchni, 4 warianty (78 / 100 / 150 / 183 zł/m²), wariant dobrany do projektu | ✅ PR #91, `lib/surface-finish.ts`, `offer/surface-finish.json` | Studio w Sites (polecenie 7 obejmuje oba) | ⏳ |
| 12 | Studio: nawierzchnia PU/EPDM, 3 warianty (250 / 317 / 400 zł/m²) | ✅ PR #92, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ⏳ ceny orientacyjne, do potwierdzenia ofertami wykonawców przed publikacją na stronie |
| 13 | Studio: płytki sportowe, 3 warianty (275 / 325 / 400 zł/m²); liczba płytek tylko wewnętrznie | ✅ PR #93, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ⏳ |
| 14 | Studio: sztuczna trawa, 3 warianty (167 / 225 / 292 zł/m²) | ✅ PR #94, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ⏳ |
| 14a | Studio: nawierzchnia akrylowa Hard Court jako osobny materiał, 3 warianty (200 / 267 / 342 zł/m²) | ✅ PR #95, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ⏳ |
| 14b | Studio: płyty gumowe SBR / EPDM jako osobny materiał, 3 warianty (342 / 400 / 492 zł/m²) | ✅ PR #96, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ⏳ |
| 14c | Studio: maty / role gumowe jako osobny materiał, 3 warianty (242 / 317 / 425 zł/m²) | ✅ PR #97, `offer/surface-finish.json` | Studio w Sites (polecenie 7) | ⏳ |
| 14d | Studio: jeden metraż wykończeń (konstrukcja +10%), nowe nazwy materiałów, poprawki czytelności (etap 1) | ✅ PR (ten) | Studio w Sites (polecenie 7) | ⏳ |
| 14e | Studio etap 2–3: lista materiałów, ceny na kartach modeli, porównanie wykończeń, zdjęcia makro | ⬜ | | ⬜ |
| 15 | Linie sportowe na EPDM (osobna pozycja) | ⬜ | | ❓ czekam na cenę |
| 16 | Strona: ceny nawierzchni (beton, malowanie, EPDM, płytki, trawa) obok cen konstrukcji | ⬜ `offer/concrete-base.json`, `offer/surface-finish.json` | sekcja „Ile kosztuje arena?” | ⬜ |
| 2 | Ceny konstrukcji „od” na stronie głównej i w FAQ (tabela właściciela 13.11) | ✅ PR #84, `offer/price-from.json` | ✅ strona główna, sprawdzone 13.11 | ✅ |
| 3 | Polityka prywatności: przycisk zgody i pierwszy akapit | kolejka, polecenie 1 | strona 4087 | ✅ sprawdzone 13.11 |
| 4 | Strony autentyczności: Damian Gawrych, Jak powstaje arena, Koncepcje, Sztuka z gry | ✅ PR #79 | ✅ wszystkie 4 strony, sprawdzone 13.11 | ✅ |
| 5 | Zdjęcia na O nas, Eventy, Szkoły, Realizacje, link „Kim jestem” na stronie głównej | ✅ PR #79 | ✅ sprawdzone 13.11 | ✅ |
| 6 | Dofinansowanie boisk (programy 2027, pomoc we wniosku) i Realizacje dla miast | ✅ PR #81 | ✅ obie strony i linki, sprawdzone 13.11 | ✅ |
| 7 | Liczby do case studies: frekwencja, trwałość, koszty utrzymania, zdjęcia „przed” | `integrations/wordpress/pages/samorzady-2026-11/ANKIETA-CASE-STUDY.md` | po odpowiedziach zamawiających | ❓ wysłać ankietę |
| 9 | Obrazy przed/po (Pole Mokotowskie) ładowane z jsDelivr: przenieść do mediów WordPress, żeby strona nie zależała od zewnętrznego CDN | strona główna, `/koncepcje/` | media WP | ⬜ |
| 8 | Aktualizacja terminów naborów po ogłoszeniu regulaminów MSiT 2027 | `samorzady-2026-11/build.py` | strona dofinansowania | ⬜ od 4.01.2027 |

## Zrobione

| Zadanie | Gdzie |
| --- | --- |
| Sekcja „Stary beton. Nowe boisko.” na stronie głównej | PR #76, strona ✅ (sprawdzone 11.11) |
| Martwe obrazy nagłówków na 6 podstronach | PR #78, strona ✅ (sprawdzone 11.11) |
| Sekcja „Pomiar odwiedzin” w polityce prywatności | strona ✅ z błędem przycisku (pkt 3) |
| Audyt 50 podstron: linki, H1, opisy, telefon | 11.11, wynik w PR #78 |

## Czeka na właściciela

- ❓ Pytania o fakty do stron autentyczności: `integrations/wordpress/pages/autentycznosc-2026-11/PYTANIA.md` (Jaktorów, technika grafik, Alternative Soccer, akcja charytatywna).
- ❓ Dane firmy do polityki prywatności (nazwa, adres, NIP): `docs/roadmap/prywatnosc-uzupelnienia.md`.
- ❓ Usunięcie niedziałającego hasła WordPress z ustawień sesji (Network secrets).
- ❓ Scalenie otwartych PR: #78 (instrukcje wdrożenia), #77 (zastąpiony przez #78, do zamknięcia), #56 (kontrola tagu Google).

## Później (roadmapa)

- ⬜ Strona: dodać ceny nawierzchni betonowej obok cen konstrukcji (sekcja „Ile kosztuje arena?”). `offer/price-ranges.json` jest nieaktualny (widełki z PR #80).
- ❓ Studio na telefonie: przycisk Podsumowanie nie pokazuje ceny (ukryta w `studio-skin-2026-11.css`, oszczędność miejsca). Cena jest w podsumowaniu. Pokazać ją też w przycisku?
- ❓ Panna Ring nie ma jej w wyborze modelu w Studio (7 modeli), a jest w cenniku strony (40 000 zł). Dodać czy tak ma zostać?
- ❓ Kafelek „Boiska” w Studio pisze „Wycena indywidualna”, choć ceny konstrukcji są już podane: zmienić na „od 27 tys. zł netto”?

- ⬜ /play zwraca 404 (bramka PLAY niezainstalowana).
- ⬜ Studio: moduł koszulek (ukryty na start).
- ⬜ Poradniki SEO (budżet obywatelski: szkic gotowy).
