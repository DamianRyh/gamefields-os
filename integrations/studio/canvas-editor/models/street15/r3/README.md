# Street Arena 15 · GF-CT-004 · R3

Obie bramki mają obłą ramę, pochylone podpory i trójwymiarową siatkę ze sznurka z widocznymi wiązaniami. Otwór zachowuje rozstaw osi słupków 2 m, wysokość osi poprzeczki 1,10 m i nominalną głębokość 0,80 m. W Studio kolor bramki zmienia stal, a sznurek ma własne neutralne matowe wykończenie. Bandy i nawierzchnia są identyczne z R2.

Wygeneruj model z głównego katalogu projektu:
```sh
blender --background --factory-startup --python-exit-code 1 --python models/street15/r3/build.py -- models/street15/r2/street15-r2.blend public/arenas/street15-r2.json
python3 models/street15/r3/verify.py public/arenas/street15-r2.json
```

Przeznaczenie: wizualizacja. Mocowania i sznurki modelują wygląd bramki na potrzeby Studio.
