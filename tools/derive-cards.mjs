#!/usr/bin/env node
/**
 * Cut the hero cards out of the Station capture set.
 *
 *   node tools/derive-cards.mjs
 *
 * The hero deals Station's contents across the table. A card is ONE thing —
 * one instrument, one grid, one display, one control group — cut out of a real
 * capture on that panel's own boundary. It is never "Station with a different
 * tab open", and it is never an arbitrary strip of a screenshot.
 *
 * Every rectangle below was measured, not guessed. The chassis is pixel
 * identical in all captures, so its own bands are the same everywhere:
 *
 *   y   24- 153  transport row
 *   y  162- 290  readout
 *   y  342- 437  project / bank row
 *   y  504- 638  the seven view tabs
 *   y  642+      the mode area — everything a card is cut from
 *
 * Panel boundaries inside the mode area were found by scanning for the flat
 * rows that separate one panel from the next, so a cut never runs through a
 * control. Re-measure with the same method if the captures are ever replaced.
 *
 * Source captures stay untouched — ASSET_PLAN.md, "do not optimize source
 * assets destructively". Output is WebP only, for the reason documented in
 * tools/derive-media.mjs. No new dependencies: the resampler is Chromium's own
 * canvas, reached through the Playwright install in the Station checkout.
 */

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..')
const STATION = process.env.STATION_CHECKOUT || 'C:/Users/T470/Documents/station'
const SRC = join(ROOT, 'assets', 'station', 'current')
const OUT = join(ROOT, 'media', 'station', 'cards')

const WEBP_QUALITY = 0.84

/* the app's content width inside the 1353px capture */
const X = 6
const W = 1341

/* `render` is the canonical width the card lands at in the 1328-unit hero
   canvas; the file is derived at twice that, so a 2x display gets real pixels
   and nothing is upscaled. */
const CARDS = [
  { to: 'laser-waveform',   from: 'laser/laser-sliced.png',      y: [693, 1154], render: 544,
    role: 'The break, cut into eight slices. The waveform display with its gold markers.' },
  { to: 'laser-cut',        from: 'laser/laser-sliced.png',      y: [1245, 1526], render: 432,
    role: 'The cut control: slice count, SET, and the audition transport under it.' },
  { to: 'laser-slices',     from: 'laser/laser-sliced.png',      y: [1665, 2342], render: 320,
    role: 'The live slice map: eight slices sitting on eight pads, named and ready.' },
  { to: 'laser-source',     from: 'laser/laser-overview.png',    y: [693, 1250], render: 320,
    role: 'Where a break comes in: choose a WAV, or start from one of four samples.' },

  { to: 'pads-grid',        from: 'pads/pads-active.png',        y: [660, 1967], render: 320,
    role: 'The sixteen-pad performance grid, eight of them loaded.' },

  { to: 'synth-picker',     from: 'synth/synth-picker.png',      y: [660, 2141], render: 208,
    role: 'The instrument menu: four synthesizers, each with its own character.' },
  { to: 'synth-zola-x',     from: 'synth/zola-x-idle.png',       y: [660, 2258], render: 320,
    role: 'ZOLA-X, the wavetable polysynth. The whole instrument, table to scale.' },
  { to: 'synth-bassic',     from: 'synth/bassic-idle.png',       y: [660, 2324], render: 208,
    role: 'BASSIC: two oscillators, sub, filter. Monophonic bass and leads.' },
  { to: 'synth-monogorg',   from: 'synth/monogorg-idle.png',     y: [660, 2303], render: 208,
    role: 'MONOGORG: drive, contour and glide. Dark mono bass for sampled beats.' },
  { to: 'synth-drum',       from: 'synth/drum-synth-kick.png',   y: [660, 1904], render: 208,
    role: 'The drum synth: eight shaping faders per voice, kick and snare.' },

  { to: 'seq-matrix',       from: 'seq-song/seq.png',            y: [693, 2132], render: 208,
    role: 'The step matrix: eight pads against sixteen steps, velocity per step.' },
  { to: 'song-arrangement', from: 'seq-song/song.png',           y: [693, 1733], render: 320,
    role: 'The arrangement: six lanes of patterns laid out across the bars.' },

  { to: 'mix-channels',     from: 'mix/mix-active.png',          y: [693, 1775], render: 320,
    role: 'The mixer: eight channel strips with live meters, solo and mute.' },
  { to: 'mix-bus',          from: 'mix/mix-active-02.png',       y: [1900, 2075], render: 320,
    role: 'Bus and FX routing, and the master.' }
]

const sha256 = buf => createHash('sha256').update(buf).digest('hex')
const kb = n => `${Math.round(n / 1024)} KB`

const pw = await import(pathToFileURL(join(STATION, 'node_modules', '@playwright', 'test', 'index.mjs')).href)
const browser = await pw.chromium.launch()
const page = await browser.newPage()
await page.goto('about:blank')
await mkdir(OUT, { recursive: true })

const manifest = {
  generatedFrom: 'assets/station/current',
  sourceSetId: JSON.parse(readFileSync(join(SRC, 'MANIFEST.json'), 'utf8')).setId,
  contentBox: { x: X, width: W },
  webpQuality: WEBP_QUALITY,
  tool: 'tools/derive-cards.mjs',
  note: 'One card is one thing, cut on a real panel boundary in the source capture.',
  files: []
}

let total = 0
for (const card of CARDS) {
  const srcPath = join(SRC, card.from)
  if (!existsSync(srcPath)) throw new Error(`missing source: ${card.from}`)
  const srcBuf = readFileSync(srcPath)
  const width = Math.min(W, Math.round(card.render * 2))

  const encoded = await page.evaluate(async ({ b64, rect, width, quality }) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + b64
    await img.decode()
    const [sx, sy, sw, sh] = rect
    const height = Math.round(sh * (width / sw))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height)
    return {
      width, height,
      sourceWidth: img.naturalWidth, sourceHeight: img.naturalHeight,
      webp: canvas.toDataURL('image/webp', quality).split(',')[1]
    }
  }, {
    b64: srcBuf.toString('base64'),
    rect: [X, card.y[0], W, card.y[1] - card.y[0] + 1],
    width,
    quality: WEBP_QUALITY
  })

  const buf = Buffer.from(encoded.webp, 'base64')
  writeFileSync(join(OUT, `${card.to}.webp`), buf)
  total += buf.length

  manifest.files.push({
    card: card.to,
    source: card.from,
    sourceSha256: sha256(srcBuf),
    sourceRect: { x: X, y: card.y[0], width: W, height: card.y[1] - card.y[0] + 1 },
    outputPx: { width: encoded.width, height: encoded.height },
    aspect: +(encoded.width / encoded.height).toFixed(4),
    renderWidth: card.render,
    role: card.role,
    outputs: [{ file: `${card.to}.webp`, bytes: buf.length, sha256: sha256(buf) }]
  })

  console.log(`${card.to.padEnd(18)} ${String(encoded.width).padStart(4)}x${String(encoded.height).padStart(4)}  aspect ${(encoded.width / encoded.height).toFixed(2).padStart(5)}  ${kb(buf.length).padStart(6)}   <- ${card.from} y ${card.y[0]}..${card.y[1]}`)
}

writeFileSync(join(OUT, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + String.fromCharCode(10))
console.log(`\n${CARDS.length} cards, ${kb(total)} total -> media/station/cards/`)
await browser.close()
