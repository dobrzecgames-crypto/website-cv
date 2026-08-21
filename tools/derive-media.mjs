#!/usr/bin/env node
/**
 * Derive production media from the Station capture set.
 *
 *   node tools/derive-media.mjs
 *
 * Reads the curated source captures in assets/station/current/ and writes
 * display-sized WebP into media/station/final/.
 *
 * WebP only, deliberately. Re-encoding the downscale to PNG through canvas comes
 * back RGBA and unoptimised — larger than the source it was meant to replace — so
 * a generated PNG would be a fallback that costs more than having none. The
 * documented fallback is the source capture itself, referenced from the CSS and
 * fetched only by a browser with no WebP support.
 *
 * Source assets stay untouched and full-resolution — ASSET_PLAN.md: "Do not
 * optimize source assets destructively before the final compositions are known."
 * TECHNICAL_PRINCIPLES.md §6: "avoid giant source PNGs in production delivery."
 *
 * Folder note: TECHNICAL_PRINCIPLES.md §13 asks for `public/media/station/final/`.
 * There is no bundler yet, so the folder sits at `media/station/final/` and is
 * served from the repository root. Moving it under `public/` when a bundler is
 * chosen keeps the public URL `/media/station/final/...` exactly as it is now.
 *
 * No new dependencies: the resampler is Chromium's own canvas, reached through
 * the Playwright install that already lives in the Station checkout — the same
 * arrangement tools/capture-station.mjs uses. Nothing is written into Station.
 */

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join, resolve, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..')
const STATION = process.env.STATION_CHECKOUT || 'C:/Users/T470/Documents/station'
const SRC = join(ROOT, 'assets', 'station', 'current')
const OUT = join(ROOT, 'media', 'station', 'final')

/* Target width: the instrument renders at most ~331 CSS px wide on desktop and
   ~310 on phones, so 1000 px covers a 3x display with room to spare while
   dropping roughly half the source pixels. */
const WIDTH = 1000
const WEBP_QUALITY = 0.86

const JOBS = [
  { from: 'laser/laser-loaded.png',            to: 'station-laser-loaded', role: 'HERO, before the cut: break loaded, no slices, pads empty.' },
  { from: 'overview/station-overview-01.png',  to: 'station-laser-cut',    role: 'HERO, after the cut: gold slice markers, CUT 8, pads 01-08 ready.' }
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
  targetWidth: WIDTH,
  webpQuality: WEBP_QUALITY,
  tool: 'tools/derive-media.mjs',
  files: []
}

for (const job of JOBS) {
  const srcPath = join(SRC, job.from)
  if (!existsSync(srcPath)) throw new Error(`missing source: ${job.from}`)
  const srcBuf = readFileSync(srcPath)

  const encoded = await page.evaluate(async ({ b64, width, quality }) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + b64
    await img.decode()
    const height = Math.round(img.naturalHeight * (width / img.naturalWidth))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)
    return {
      width, height,
      sourceWidth: img.naturalWidth, sourceHeight: img.naturalHeight,
      webp: canvas.toDataURL('image/webp', quality).split(',')[1]
    }
  }, { b64: srcBuf.toString('base64'), width: WIDTH, quality: WEBP_QUALITY })

  const buf = Buffer.from(encoded.webp, 'base64')
  writeFileSync(join(OUT, `${job.to}.webp`), buf)
  const out = [{ file: `${job.to}.webp`, bytes: buf.length, sha256: sha256(buf) }]

  manifest.files.push({
    source: job.from,
    sourceBytes: srcBuf.length,
    sourceSha256: sha256(srcBuf),
    sourcePx: { width: encoded.sourceWidth, height: encoded.sourceHeight },
    outputPx: { width: encoded.width, height: encoded.height },
    role: job.role,
    cssFallback: `assets/station/current/${job.from}`,
    outputs: out
  })

  const saved = 1 - out[0].bytes / srcBuf.length
  console.log(`${job.from}\n  -> ${job.to}.webp  ${kb(out[0].bytes)}  (${(saved * 100).toFixed(0)}% smaller than source ${kb(srcBuf.length)})`)
}

writeFileSync(join(OUT, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`\nmanifest -> media/station/final/MANIFEST.json  (source set ${manifest.sourceSetId})`)
await browser.close()
