# Station — aktualne materiały wizualne (asset collection)

> **ZESTAW `2026-08-21-0c64ac8`** — zebrany 2026-08-21, Station `main` @ `0c64ac8`, working tree czysty.
> Twarde dane o tym zestawie (hashe, wymiary, warunki kadrowania) siedzą w [`MANIFEST.json`](MANIFEST.json).
> Zasady wersjonowania, komenda do przestrzelenia zestawu od nowa i archiwum poprzednich zestawów: [`../README.md`](../README.md).
> **Kolejne zestawy będą miały te same nazwy plików** — rozróżnia je wyłącznie `setId` w manifeście i nazwa folderu w `../archive/`.

Nic w Station nie było zmieniane — to wyłącznie zrzuty aktualnego, niezmodyfikowanego interfejsu. Zestaw powstał w całości z jednego przebiegu `tools/capture-station.mjs`, więc wszystkie kadry pokazują ten sam stan projektu.

## Warunki zrzutów

- **Viewport: 451 × 900 px, deviceScaleFactor 3** → wszystkie pliki pełnokadrowe mają 1353 × 2700 px (wycinki z `details/` odpowiednio mniej).
- Dlaczego nie 1440 × 900: Station jest instrumentem mobile-first z chassis o twardo ograniczonej szerokości (`--station-app-width: 447px`, `global-scale.css`). Przy 1440 px aplikacja to wąska kolumna pośrodku ekranu, a ~69% kadru to puste tło. 451 px to dokładnie chassis + jego 2 px marginesu, więc kadr jest wypełniony interfejsem w 100%, a 3× DPI daje materiał z zapasem na duże ujęcia na stronie.
- Jeden viewport i jedna skala UI dla **wszystkich** plików — nic nie było skalowane po fakcie.
- Bez DevTools, bez paneli Claude, bez popupów systemowych, bez kursora w kadrze (mysz odsuwana przed każdym zrzutem), bez przypadkowego hoveru i bez ringu focusu (aktywny element blurowany przed zrzutem).
- Ukryty jest wyłącznie dev-only launcher „TYPE" (Typography Lab, `.type-lab`, renderowany tylko w `import.meta.env.DEV`) — nie jest częścią produktu.
- Materiał muzyczny: wbudowany break `aalonbutler-gettinsoul.wav` pocięty w LASER na 8 slice'ów (pady 01–08), własny 16-krokowy pattern, trzy banki, sześć linii w SONG, ZOLA-X na banku 02.

---

## OVERVIEW

| Plik | Opis |
|---|---|
| `overview/station-overview-01.png` | Pełne Station w widoku LASER w momencie cięcia: waveform ze złotymi znacznikami wiązki, suwak CUT = 8, pod spodem zapełniona LIVE SLICE MAP. Najbardziej rozpoznawalny kadr całego produktu. |
| `overview/station-overview-02.png` | Pełne Station w widoku PADS z 16-padowym bankiem, pady 01–08 załadowane slice'ami. Spokojniejszy, „katalogowy" portret urządzenia. |

## LASER

| Plik | Opis |
|---|---|
| `laser/laser-overview.png` | Stan wejściowy LASER: CHOOSE WAV FILE, cztery wbudowane sample, pusta mapa padów. |
| `laser/laser-loaded.png` | Wgrany break — sam waveform, bez cięć, przed jakąkolwiek operacją. |
| `laser/laser-preview-cut.png` | **Najmocniejszy kadr LASER.** Podgląd cięcia na żywo: złote wiązki lasera w miejscach transientów, głowica na suwaku CUT, przyciski CANCEL / SET. |
| `laser/laser-sliced.png` | Cięcie zatwierdzone: waveform z numerowanymi slice'ami i uchwytami znaczników, pady 01–08 na READY. Stan „po" do pary z `laser-loaded`. |
| `laser/laser-playing.png` | To samo, ale z odtwarzaniem źródła — cyjanowa linia playheada przesuwa się po waveformie. Jedyny wiarygodnie uchwycony playhead w całym zestawie. |

## PADS

| Plik | Opis |
|---|---|
| `pads/pads-idle.png` | Bank padów w spoczynku: 01–08 z nazwą sampla i statusem READY, 09–16 EMPTY. |
| `pads/pads-active.png` | Trzy pady (02, 05, 08) wciśnięte jednocześnie — pełna, ciepła poświata reakcji padu na dotyk. |

## SYNTH

| Plik | Opis |
|---|---|
| `synth/zola-x-idle.png` | **ZOLA-X, kadr główny.** Duży ekran wavetable (stos krzywych OSC 1 / BLOOM), zakładki OSC / FILTER / ENV / MOD, TABLE, UNISON, POSITION, LEVEL, OSC MIX. |
| `synth/zola-x-active.png` | ZOLA-X w trakcie grania: wavetable przechodzi w żywy, rozedrgany odczyt, przycisk audition podświetlony. |
| `synth/synth-picker.png` | Ekran wyboru instrumentu (BASSIC / MONOGORG / ZOLA-X / DRUM SYNTH) z autorskimi glifami. Kontekst, że ZOLA-X to jeden z czterech instrumentów. |

## SEQ / SONG

| Plik | Opis |
|---|---|
| `seq-song/seq.png` | Matryca sekwencera, pattern 8 padów × kroki 01–08, transport zatrzymany. |
| `seq-song/seq-active.png` | Ten sam pattern z uruchomionym transportem (PLAY wygaszony, STOP aktywny). |
| `seq-song/song.png` | **Najlepszy kadr struktury utworu.** Sześć linii aranżacji (1A, 1B, 1C, 1D, 2A, 3A) z klipami w różnych kolorach banków — widać hierarchię bank → sekcja → slot. |
| `seq-song/song-active.png` | Aranżacja w trybie SONG podczas odtwarzania. |

## MIX

| Plik | Opis |
|---|---|
| `mix/mix.png` | Osiem kanałów, faderów ustawionych na różnych poziomach, M/S na kanał, sekcja BUS & FX (G1 / MASTER). |
| `mix/mix-active.png` | **Najlepszy kadr MIX.** Te same kanały podczas odtwarzania — mierniki dBFS pokazują różne, żywe poziomy na wszystkich ośmiu torach. |
| `mix/mix-active-02.png` | Alternatywna klatka mierników z innego momentu pętli (przydatne, gdy potrzebne dwie różne klatki do animacji). |

## DETAILS (wycinki pod animacje i przejścia)

| Plik | Opis |
|---|---|
| `details/waveform-laser.png` | Czysty waveform bez cięć — klatka startowa przejścia „przed cięciem". |
| `details/slice-markers.png` | Ten sam waveform ze złotymi wiązkami lasera — klatka docelowa przejścia. Para z powyższym to gotowa animacja cięcia. |
| `details/waveform-playhead.png` | Waveform z gotowymi slice'ami i cyjanową linią playheada w ruchu. |
| `details/pads-grid.png` | Sama siatka 16 padów w spoczynku. |
| `details/pads-grid-active.png` | Ta sama siatka z trzema padami wciśniętymi — para do animacji uderzenia. |
| `details/seq-grid.png` | Sama matryca sekwencera z patternem, bez chromu aplikacji. |
| `details/song-arrangement.png` | Sama siatka aranżacji z sześcioma liniami klipów. |
| `details/wavetable-zola-x.png` | Sam ekran wavetable ZOLA-X w stanie spoczynku. |
| `details/wavetable-zola-x-active.png` | Ten sam ekran podczas grania — para do animacji „ożywienia" syntezatora. |
| `details/mix-faders.png` | Sam bank ośmiu kanałów z faderami, mierniki wygaszone. |
| `details/mix-meters.png` | Ten sam bank z mierikami w ruchu — para do animacji poziomów. |

---

## Najlepsi kandydaci na role w narracji

| Rola | Plik |
|---|---|
| **HERO** | `overview/station-overview-01.png` |
| **LASER transition** | `details/waveform-laser.png` → `details/slice-markers.png` (klatka „przed" → „po"), a jako pełny kadr `laser/laser-preview-cut.png` |
| **PADS** | `pads/pads-active.png`, wycinek `details/pads-grid-active.png` |
| **SYNTH** | `synth/zola-x-idle.png`, wycinek `details/wavetable-zola-x.png` |
| **SEQ / SONG** | `seq-song/song.png` (hierarchia) + `seq-song/seq.png` (rytm) |
| **MIX** | `mix/mix-active.png`, wycinek `details/mix-meters.png` |

## 5–8 assetów, od których warto zacząć budowę website-CV

1. `overview/station-overview-01.png` — HERO, jeden kadr, który tłumaczy cały produkt.
2. `laser/laser-preview-cut.png` — sygnaturowy moment LASER, otwiera rozdział o cięciu.
3. `details/waveform-laser.png` + `details/slice-markers.png` — gotowa para klatek na przejście „sampel → slice'y".
4. `pads/pads-active.png` — dowód, że to instrument dotykowy, nie panel administracyjny.
5. `synth/zola-x-idle.png` — ekran wavetable, najbardziej „drogi" wizualnie element całego Station.
6. `seq-song/song.png` — struktura utworu, jedyny kadr pokazujący skalę projektu.
7. `mix/mix-active.png` — żywe mierniki, domknięcie łańcucha LASER → PADS → SYNTH → SEQ/SONG → MIX.
8. `overview/station-overview-02.png` — zapasowy, spokojniejszy portret urządzenia pod sekcje z dużą ilością tekstu.

## Czego nie udało się sensownie zrobić

- **`details/seq-playhead.png` i widoczny playhead w `seq-song/seq-active.png`.** Station zaznacza grającą kolumnę sekwencera (`.pattern-step-playing`) tylko wtedy, gdy zegar audio mieści się w oknie ostatnio zaplanowanego kroku — przy schedulerze z wyprzedzeniem to ułamek każdego kroku. Zrzuty łapane w pętli (ok. 25 s prób na kadr) wyszły bajt w bajt identyczne z kadrem bez playheada, więc plik `seq-playhead.png` został usunięty zamiast dostarczać mylącą nazwę. Ruch czasu w tym zestawie reprezentują `laser/laser-playing.png` i `details/waveform-playhead.png`, gdzie playhead jest liczony w sposób ciągły i renderuje się niezawodnie.
- **`overview/station-overview-03.png`** (trzeci overview z grającym sekwencerem) usunięty z tego samego powodu — bez playheada był duplikatem `seq-song/seq-active.png`.
