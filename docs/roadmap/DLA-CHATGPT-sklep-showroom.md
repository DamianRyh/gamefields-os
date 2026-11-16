# Sklep jako showroom (motyw 1.0.30), 16.11.2026

Wdrożenie robi **właściciel**: wgrywa ZIP motywu w WordPressie. ChatGPT nie ma uprawnień do plików motywu.

## Właściciel

1. Wygląd → Motywy → Dodaj nowy motyw → Wyślij motyw na serwer → `gamefields-1.0.30.zip` → Zainstaluj → **Zastąp bieżący motyw przesłanym**.
2. Wejdź na dowolną stronę wp-admin. Dane sklepu mają nową wersję, więc synchronizacja zaktualizuje 16 produktów.
   Komunikat: „utworzone 0, zaktualizowane 16, ukryte stare 0”.

ZIP buduje się z `integrations/wordpress/theme/gamefields` (folder `gamefields/` w archiwum).

## ChatGPT (polecenie 15)

1. Wyczyść cache LiteSpeed.
2. Sprawdź /shop/ na komputerze i telefonie:
   - nagłówek „Boiska i nawierzchnie. Ceny ze Studia.”;
   - scena z boiskiem na kolorze, a pod nią 8 kafelków modeli. Kliknięcie zmienia boisko na scenie;
   - Play, Court, Ring i Octa obracają się w 3D (przeciąganie);
   - nawierzchnie z teksturami, ceną za m² i ceną „dla [boisko]”. Przyciski „Policz dla” zmieniają ceny;
   - „Jak zamówić” w trzech krokach;
   - strona nie przewija się w bok.
3. Kategorie (np. /product-category/…) i wyszukiwanie mają zostać zwykłą listą produktów.
4. Pokaż właścicielowi zrzuty.
