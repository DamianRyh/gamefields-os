# Baner Gamefields · konstrukcje R3

Publiczny WordPress, strona 3462, używa pliku motywu `integrations/wordpress/theme/gamefields/assets/js/home/gf-home.js`. Każda wersja tego skryptu ładuje modele i przezroczyste obrazy zastępcze z katalogu `hero-r3/` obok własnego URL. Dzięki temu wdrożenie może przypiąć skrypt i komplet danych do jednego commita. Starszy, osadzony w HTML skrypt z `studio-2026-11/` jest źródłem historycznym.

## Źródła i zakres

Play i Court korzystają z aktualnych modeli CAD z perforacją oraz elementami montażowymi. Ring pochodzi z W-1, a Octa z modelu R2 po rozdzieleniu konstrukcji i podłoża. Eksporter odrzuca modele, które zawierają obiekty oznaczone jako nawierzchnia. Webowy GLB zachowuje geometrię i normalne części, zmienia materiały prezentacji oraz stosuje kompresję Draco. Zdjęcia zastępcze są przezroczystymi renderami tych samych konstrukcji. W banerze farba paneli, ramy i bramek jest sterowana paletą. Ocynkowane łączniki zachowują własne wykończenie.

`blender --background --factory-startup --python-exit-code 1 --python build.py -- PLAY.glb COURT.glb RING.glb OCTA-R2.glb` odtwarza sceny, GLB i rendery PNG w `assets/`. Konwersję przezroczystych plakatów do WebP 720/1200 px wykonuje `make_posters.py`. `build-receipt.json` wskazuje wejścia, sumy kontrolne i zweryfikowane wymiary.

W WordPressie trzeba ustawić dwa adresy początkowego obrazu Play oraz zmienić adres skryptu motywu na wersjonowany. Przed zapisem należy sprawdzić zawartość wszystkich plików, po zapisie przełączyć cztery modele i zablokować żądania GLB w teście obrazu zastępczego. Ten zakres dotyczy wyłącznie banera.
