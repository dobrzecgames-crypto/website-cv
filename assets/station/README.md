# Station — materiały wizualne

Zrzuty ekranu Station dla website-CV. Pliki w kolejnych zestawach nazywają się **tak samo** (żeby strona mogła wskazywać stabilne ścieżki), więc o tym, **który zestaw jest który**, decyduje wyłącznie `MANIFEST.json` i nazwa folderu w `archive/`.

```
assets/station/
  current/            <- zawsze najnowszy zestaw; to na to wskazuje strona
    MANIFEST.json     <- czym JEST ten zestaw (id, data, commit Station, sha256 każdego pliku)
    ASSET_INDEX.md    <- opis dla człowieka + typy na HERO i poszczególne rozdziały
    overview/ laser/ pads/ synth/ seq-song/ mix/ details/
  archive/            <- poprzednie zestawy, jeden folder na zestaw, nazwany jego setId
```

## Skąd wiadomo, który zestaw to który

`current/MANIFEST.json` zawiera:

| pole | znaczenie |
|---|---|
| `setId` | identyfikator zestawu, `RRRR-MM-DD-<commit Station>`, np. `2026-08-21-0c64ac8` |
| `capturedAt` | dokładny moment zbierania (ISO) |
| `source.commit` / `source.workingTreeDirty` | z jakiego stanu Station zrzuty powstały; `true` w `workingTreeDirty` znaczy, że były niezacommitowane zmiany i zestaw **nie** jest odtwarzalny |
| `capture.viewportCssPx` / `deviceScaleFactor` / `outputPx` | warunki kadrowania, identyczne dla całego zestawu |
| `files[]` | każdy plik z opisem, rozmiarem, wymiarami i `sha256` |

Dzięki `sha256` da się w każdej chwili sprawdzić, czy plik leżący na stronie pochodzi z tego zestawu, czy z jakiegoś starszego.

## Nowy zestaw zrzutów

```bash
node C:/Users/T470/Documents/WEBSITE-CV/tools/capture-station.mjs
```

Tyle. Skrypt sam:

1. startuje Vite z checkoutu Station, jeśli dev server nie działa (i gasi go po sobie),
2. przechodzi całą ścieżkę produktu — LASER → cięcie → PADS → SEQ → MIX → ZOLA-X → SONG → OVERVIEW, a na końcu otwiera pozostałe instrumenty SYNTH,
3. zrzuca wszystko do `assets/station/.staging/`,
4. dopiero po **udanym** przejściu przenosi poprzedni `current/` do `archive/<jego setId>/` i wstawia nowy zestaw na jego miejsce.

Przerwany albo wywalony przebieg kasuje staging i **nie rusza** `current/`. Nie ma stanu pośredniego, w którym połowa zestawu jest nowa, a połowa stara.

Opcje: `--base-url <url>` (użyj już działającego serwera), `--station <ścieżka>` (inny checkout Station), `--manifest-only` (nic nie zrzucaj, tylko przelicz hashe i odśwież manifest), `--synth-supplement` (bez archiwizowania obecnego zestawu dopisz brakujące panele BASSIC, MONOGORG i DRUM SYNTH; skrypt odmawia pracy, jeśli commit lub stan working tree nie zgadza się z `current/`).

**Po każdym nowym zestawie odśwież `ASSET_INDEX.md`** — `MANIFEST.json` generuje się sam, ale narracyjny opis i typy na HERO są pisane ręcznie.

## Wymagania

Playwright bierze się z `node_modules` checkoutu Station (`C:\Users\T470\Documents\station`) — ten projekt nie ma własnych zależności. Do renderowania skrypt używa dołączonego Chromium, a jeśli tej binarki nie ma, lokalnego Google Chrome lub Microsoft Edge. Station musi być zainstalowany. Skrypt **niczego nie zapisuje w repo Station**; startuje tylko dev server i czyta commit przez `git`.

## Warunki kadrowania — dlaczego nie 1440×900

Chassis Station jest twardo ograniczone do 447 px (`--station-app-width` w `src/global-scale.css`), więc przy desktopowym viewporcie aplikacja to wąska kolumna, a większość kadru to puste tło. Cały zestaw idzie w **451 × 900 px przy DPR 3** (pliki 1353 × 2700) — 451 px to chassis plus 2 px paddingu shella, czyli kadr wypełniony w całości. Jedna skala dla wszystkich plików, bez skalowania po fakcie. Jeśli kiedyś zmienimy viewport, zmieńmy go w skrypcie i przestrzelmy cały zestaw naraz — nie mieszajmy skal w jednym `current/`.

Zrzuty nie zawierają DevTools, paneli Claude, popupów systemowych ani kursora; przed każdym statycznym kadrem skrypt blurruje aktywny element i odsuwa mysz, żeby nie łapać ringu focusu ani hoveru. Ukrywany jest wyłącznie dev-only launcher „TYPE" (Typography Lab, renderowany tylko w buildach DEV).

## Znane ograniczenie

**Playhead sekwencera nie da się sfotografować.** Station zaznacza grającą kolumnę tylko wtedy, gdy zegar audio mieści się w oknie ostatnio zaplanowanego kroku (`playingStep` w `src/App.tsx`), a scheduler planuje z wyprzedzeniem — klasa `.pattern-step-playing` istnieje w DOM przez ułamek każdego kroku. Odpytywanie co 5 ms przez 25 s i strzał w momencie jej pojawienia się dało plik bajt w bajt identyczny z kadrem bez playheada. `seq-song/seq-active.png` pokazuje więc pattern z uruchomionym transportem, ale bez znacznika kolumny.

Ruch czasu w zestawie reprezentują `laser/laser-playing.png` i `details/waveform-playhead.png` — tam playhead liczony jest z zegara wizualnego w każdej klatce i renderuje się niezawodnie.
