# archive/

Poprzednie zestawy zrzutów Station, jeden folder na zestaw, nazwany jego `setId`
(np. `2026-08-21-0c64ac8`). Trafiają tu automatycznie — `tools/capture-station.mjs`
przenosi tu zawartość `current/` w momencie, w którym nowy zestaw jest gotowy
i kompletny.

Każdy folder zawiera swój własny `MANIFEST.json`, więc nawet po latach wiadomo,
z jakiego commita Station i przy jakim viewporcie powstał, i czym różni się od
zestawu o tych samych nazwach plików leżącego w `current/`.

Nic tu nie edytujemy ręcznie. Jeśli któryś zestaw ma wrócić na stronę, kopiujemy
z niego pliki świadomie i odnotowujemy to w `current/ASSET_INDEX.md` — folder
`current/` musi zostawać jednym, spójnym zestawem z jednego przebiegu.
