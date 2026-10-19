# Katalog Panna i zapytania produktowe

Pełne bloki HTML istniejących stron WordPressa. Źródłem parametrów i cen są karty zastane 18.10.2026, a nie nowy cennik. Mapowanie identyfikatorów, nazw i adresów znajduje się w `products.json`.

- Katalog: strona `3465`, `/boiska-street-football/`. Filtry kształtu działają jako przyciski z `aria-pressed`, wynik jest ogłaszany przez `role=status`. Bez JavaScript wszystkie karty i tabela nadal są dostępne.
- Siedem kart: strony `3473`, `3475`–`3480`. Przyciski prowadzą do `/?gf_product=<slug>#kontakt`. Zachowano istniejące fotografie, parametry, ceny i treść.
- Strona główna `3462` rozpoznaje wyłącznie siedem dozwolonych identyfikatorów. Nazwa modelu trafia do istniejącego `project-details` w Contact Form 7. Dowolny tekst z URL nie jest wyświetlany ani wstawiany jako HTML. Nie ma nowych pól z danymi osobowymi, cookies ani localStorage.
- Wybór kierunku designu zachowuje nazwę modelu i wiadomość. Kolejny kierunek zastępuje poprzedni. Nowy pełny projekt ze Studio może zastąpić wcześniejszy opis, zgodnie z dotychczasową obsługą `gf-inquiry`.
- Link „Jak działamy” wskazuje istniejące `/#jak-pracujemy`; ogólne CTA prowadzą do kontaktu. Karty produktu wskazują kontakt z modelem zamiast nieistniejącego `/#builder`.

Tabela porównawcza ma nagłówki i podpis oraz własny przewijany obszar z dostępem z klawiatury. Nie udaje konfiguratora technicznego konstrukcji Panna. Brakujące średnice i wymiary pozostają oznaczone „do potwierdzenia”. Nie zmieniano cen; zakres podatku, transportu i montażu wymaga potwierdzenia przed odrębną publikacją cennika.

## Odbiór

```sh
node tests/wordpress-products.mjs
node tests/wordpress-homepage.mjs
```

Test produktów sprawdza siedem kart i modele w formularzu, cztery filtry, siedem wierszy tabeli, zmianę kierunków bez utraty modelu/wiadomości, odrzucenie nieznanego identyfikatora i układ 1440/768/390 px. Blokuje zapis i wysyłkę formularzy; osadzone Studio jest pomijane w tym teście i sprawdzane osobno. Dostarczenie poczty pozostaje poza zakresem testu.

Opcjonalnie `GF_RENDER_BRIDGE_URL` wskazuje lokalny transport HTTPS z weryfikacją TLS. `GF_PRODUCT_STAGE` wskazuje prywatny JSON mapowania szkiców `{id,draft,path,url}`. Sesji i kopii prywatnych nie wolno umieszczać w repozytorium.

## Wdrożenie i cofnięcie

Kopie dziewięciu stron przed zmianą i szkice odbiorowe znajdują się prywatnie poza repozytorium w `/workspace/gamefields-backups/wordpress-products-20261018`. To kopia treści objętej zmianą, nie całej bazy/hostingu. Wdrożenie aktualizuje tylko `content` po porównaniu aktualnej treści z kopią. Nie zmienia szablonów, slugów, SEO, wtyczek lub konfiguracji mailowej.

Przy cofnięciu przywrócić poprzednie `content.raw` dziewięciu stron z kopii lub wersji WordPressa, bez nadpisywania innych ustawień. Przed przywróceniem sprawdzić, czy od publikacji nie było cudzych zmian. Szkice odbiorowe przenieść do kosza po zakończeniu odbioru. Sumy opublikowanych źródeł są w `deployment.json`.

Odbiór szkiców i publicznych stron zakończony sukcesem. Dodatkowa regresja strony głównej także zaliczona na 1440/768/390 px; nawigację sprawdzono również przy 912/1024 px. Zrzuty są lokalnie w `outputs/www-wordpress/`. Kontrola porównuje wszystkie dziewięć treści WordPressa z plikami w repozytorium. Szkice `3885`–`3893` po odbiorze przeniesiono do kosza.

## Wspólna warstwa wizualna

Nowsza iteracja stosuje identyfikację strony głównej, pełne obrazy konstrukcji z opisem alternatywnym, ścieżkę nawigacji na karcie i wspólną stopkę. Źródło: `gamefields-product-design.css`; po jego zmianie uruchomić `node scripts/sync-wordpress-product-design.mjs`. Opcja `--check` kontroluje zgodność osadzonych stylów i jest w CI. Test produktów obejmuje teraz również szerokość 1024 px, semantyczne obrazy oraz nawigację powrotną.

Szczegóły, ograniczenia materiałów i procedura odbioru: `docs/WWW-VISUAL-REFINEMENT.md`. Aktualny stan publikacji i szkiców wskazuje `deployment.json`.
