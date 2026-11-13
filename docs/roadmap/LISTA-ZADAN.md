# Lista zadań gamefields.eu

Bieżąca lista. Zasada: najpierw repozytorium (PR, testy), potem strona (wdrożenie, kontrola na żywo).
Polecenia do wdrożenia na stronie czekają w kolejce: `docs/roadmap/POLECENIA-DLA-CHATGPT.md`.
Statusy: ✅ zrobione · 🔄 w toku · ⏳ czeka na wdrożenie na stronie · ❓ czeka na decyzję właściciela · ⬜ do zrobienia

Ostatnia aktualizacja: 13.11.2026

## Teraz

| # | Zadanie | Repozytorium | Strona | Status |
| --- | --- | --- | --- | --- |
| 1 | Przejrzystość cenowa: widełki w Studio, karta projektu PDF, ceny „od–do” 8 modeli | ✅ PR #80, `docs/roadmap/CENY-PRZEJRZYSTOSC-2026-11.md` | Studio w Sites (polecenie 4, najpierw ceny konstrukcji w karcie stawek) | ⏳ |
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

- ⬜ /play zwraca 404 (bramka PLAY niezainstalowana).
- ⬜ Studio: moduł koszulek (ukryty na start).
- ⬜ Poradniki SEO (budżet obywatelski: szkic gotowy).
