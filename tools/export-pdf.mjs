#!/usr/bin/env node
/**
 * Export the whole page to one PDF, for review away from a browser.
 *
 *   node tools/export-pdf.mjs [--width 1440] [--height 1120] [--out exports/…]
 *
 * A screenshot only ever holds one viewport, which is no use for judging a page
 * that is five screens tall. This renders the real thing at a real desktop
 * width and paginates it so nothing is cut mid-section:
 *
 *   page 1     the overview before the cut — Station whole
 *   page 2     the overview after it — six modules on the grid
 *   pages 3+   one reading chapter each
 *
 * Page one is a clone of the scene forced back to data-state="intact". The
 * clone is inserted after the scripts have already bound to the original, so
 * it is inert scenery and its duplicate ids never matter.
 *
 * Screen media, not print: there is no print stylesheet and inventing one for a
 * review artefact would mean reviewing something the site never renders.
 *
 * No new dependencies and no server — the page is opened over file:// and every
 * asset path in it is relative. Chromium comes from the Playwright install in
 * the Station checkout, the same arrangement tools/derive-media.mjs uses.
 */

import { mkdir } from 'node:fs/promises'
import { writeFileSync, statSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..')
const STATION = process.env.STATION_CHECKOUT || 'C:/Users/T470/Documents/station'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}

const WIDTH = Number(flag('width', 1440))
/* tall enough that the longest chapter fits on one page — the tool checks this
   after layout and says so if a section has outgrown it */
const HEIGHT = Number(flag('height', 1000))
const OUT = resolve(ROOT, flag('out', join('exports', 'station-website.pdf')))

const pw = await import(pathToFileURL(join(STATION, 'node_modules', '@playwright', 'test', 'index.mjs')).href)
const browser = await pw.chromium.launch()
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2
})

const url = pathToFileURL(join(ROOT, 'index.html')).href + '?state=released&motion=off'
await page.goto(url, { waitUntil: 'load' })
await page.emulateMedia({ media: 'screen' })

/* Every chapter still is lazy, which is correct for the site and wrong for a
   render of the whole page: below the fold means never fetched. */
await page.evaluate(async () => {
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.loading = 'eager'
    img.fetchPriority = 'high'
  })
  await Promise.all([...document.images].map(img =>
    img.complete ? img.decode().catch(() => {}) : new Promise(done => {
      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', done, { once: true })
    })))
  await document.fonts.ready
})

/* page one: the same scene, before anyone pressed anything */
await page.evaluate(() => {
  const scene = document.getElementById('stage')
  const before = scene.cloneNode(true)
  before.removeAttribute('id')
  before.dataset.state = 'intact'
  before.dataset.exportPage = 'before'
  /* the control is live on the original and scenery on the clone */
  before.querySelectorAll('button').forEach(b => { b.disabled = true })
  scene.parentNode.insertBefore(before, scene)
})

await page.addStyleTag({ content: `
  /* one section per page, and never a section split across two */
  .stage { break-after: page; break-inside: avoid; }
  .chapters { padding-block: 0; }
  .chapter { break-before: page; break-inside: avoid; padding-block: 40px; }
  .chapter + .chapter::before { display: none; }
  /* a fixed overlay repeats on every page in a paginated render */
  body::after { display: none; }
  /* the scene sizes itself to the viewport; in pagination that is the page */
  .stage { min-height: ${HEIGHT - 2}px; }
` })

const report = await page.evaluate(() => ({
  doc: Math.round(document.documentElement.scrollHeight),
  sections: [...document.querySelectorAll('.stage, .chapter')].map(el => ({
    name: el.dataset.exportPage === 'before' ? 'overview · before the cut'
      : el.classList.contains('stage') ? 'overview · after the cut'
      : (el.querySelector('.chapter__n')?.textContent.trim() + ' ' +
         el.querySelector('.chapter__title')?.textContent.trim()),
    height: Math.round(el.getBoundingClientRect().height)
  }))
}))

await mkdir(dirname(OUT), { recursive: true })
await page.pdf({
  path: OUT,
  width: `${WIDTH}px`,
  height: `${HEIGHT}px`,
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: `
    <div style="width:100%;padding:0 28px;font-family:monospace;font-size:8px;
                letter-spacing:.18em;text-transform:uppercase;color:#7d746b;
                display:flex;justify-content:space-between;opacity:.55">
      <span>Station — website layout review · ${WIDTH}px wide</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`
})

await browser.close()

console.log(`\n${WIDTH} x ${HEIGHT} per page\n`)
for (const s of report.sections) {
  const over = s.height > HEIGHT ? `  <-- taller than the page by ${s.height - HEIGHT}px` : ''
  console.log(`  ${String(s.height).padStart(5)}px  ${s.name}${over}`)
}
console.log(`\npdf -> ${OUT}  (${Math.round(statSync(OUT).size / 1024)} KB)`)
