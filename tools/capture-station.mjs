/**
 * Station -> website-CV visual asset capture.
 *
 * Produces one complete, internally consistent set of Station screenshots in
 * assets/station/current/, plus a MANIFEST.json that stamps WHICH set it is:
 * capture timestamp, the Station commit it was shot from, the viewport, and a
 * sha256 for every file. Re-running moves the previous set to
 * assets/station/archive/<its set id>/ first, so two sets sharing the same
 * filenames can never be confused for one another.
 *
 * Usage (from anywhere):
 *   node C:/Users/T470/Documents/WEBSITE-CV/tools/capture-station.mjs
 *
 * Options:
 *   --station <path>   Station checkout (default C:/Users/T470/Documents/station)
 *   --base-url <url>   Running dev server. If it is not reachable this script
 *                      starts Vite itself from the Station checkout and stops
 *                      it again when finished. Default http://localhost:5173
 *   --manifest-only    Do not shoot anything; just re-hash what is already in
 *                      assets/station/current/ and rewrite its MANIFEST.json.
 *   --synth-supplement Capture the missing BASSIC, MONOGORG and DRUM SYNTH
 *                      panels into the current set without replacing or
 *                      archiving its existing screenshots. The source commit
 *                      and viewport must match the current set.
 *
 * Requirements: Playwright + its Chromium come from the Station checkout's
 * node_modules (this project has none of its own), so the Station repo must be
 * installed. Nothing here writes to the Station checkout.
 */

import { createHash } from 'node:crypto'
import { spawn, execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// --- arguments ----------------------------------------------------------

const argv = process.argv.slice(2)
const flag = (name, fallback = null) => {
  const index = argv.indexOf(name)
  return index === -1 ? fallback : argv[index + 1]
}
const has = (name) => argv.includes(name)

const PROJECT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const STATION = resolve(flag('--station', 'C:/Users/T470/Documents/station'))
const BASE = (flag('--base-url', 'http://localhost:5173') ?? '').replace(/\/$/, '') + '/'
const ASSETS = join(PROJECT, 'assets', 'station')
const CURRENT = join(ASSETS, 'current')
const ARCHIVE = join(ASSETS, 'archive')
const SYNTH_SUPPLEMENT = has('--synth-supplement')
// Everything is shot into a staging directory and only swapped in once the run
// has finished. A crashed or half-finished run therefore cannot leave the set
// on disk incomplete, and can never destroy the set that is already there.
const STAGING = join(ASSETS, '.staging')

// The whole set is shot at one viewport and one scale, deliberately. Station's
// chassis is hard-capped at --station-app-width: 447px (global-scale.css), so a
// desktop-sized viewport frames a thin column in a mostly empty page. 451px is
// the chassis plus the shell's own 2px padding: the kerf is filled exactly.
const VIEWPORT = { width: 451, height: 900 }
const SCALE = 3

const SECTIONS = ['overview', 'laser', 'pads', 'synth', 'seq-song', 'mix', 'details']

// --- manifest bookkeeping -----------------------------------------------

/** Every shot records itself here, so MANIFEST.json describes what it holds. */
const shots = []
const record = (rel, description) => shots.push({ file: rel, description })

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')
/** PNG stores width/height as big-endian uint32 at bytes 16..24 of the IHDR. */
const pngSize = (path) => {
  const head = readFileSync(path).subarray(16, 24)
  return { width: head.readUInt32BE(0), height: head.readUInt32BE(4) }
}

const stationCommit = () => {
  try {
    return execFileSync('git', ['-c', `safe.directory=${STATION.replaceAll('\\', '/')}`, '-C', STATION, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}
const stationDirty = () => {
  try {
    return execFileSync('git', ['-c', `safe.directory=${STATION.replaceAll('\\', '/')}`, '-C', STATION, 'status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0
  } catch {
    return null
  }
}

const stamp = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}`
}

const collectFiles = (dir, prefix = '') => {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...collectFiles(join(dir, entry.name), rel))
    else if (entry.name.toLowerCase().endsWith('.png')) out.push(rel)
  }
  return out
}

const writeManifest = async (root, setId, capturedAt, previous = null) => {
  const described = new Map((previous?.files ?? []).map((file) => [file.file, file.description]))
  for (const shot of shots) described.set(shot.file, shot.description)
  const files = collectFiles(root).sort().map((rel) => {
    const absolute = join(root, rel)
    return {
      file: rel,
      description: described.get(rel) ?? null,
      bytes: statSync(absolute).size,
      ...pngSize(absolute),
      sha256: sha256(absolute),
    }
  })
  const manifest = {
    setId,
    capturedAt,
    source: {
      app: 'Station',
      checkout: STATION,
      commit: stationCommit(),
      workingTreeDirty: stationDirty(),
      baseUrl: BASE,
    },
    capture: {
      viewportCssPx: VIEWPORT,
      deviceScaleFactor: SCALE,
      outputPx: { width: VIEWPORT.width * SCALE, height: VIEWPORT.height * SCALE },
      colorScheme: 'dark',
      hidden: ['.type-lab (dev-only Typography Lab launcher, DEV builds only)'],
      cleanup: 'activeElement blurred and pointer parked at 2,2 before every shot',
      tool: 'tools/capture-station.mjs',
      ...(previous?.capture?.supplements ? { supplements: previous.capture.supplements } : {}),
    },
    content: 'Built-in break aalonbutler-gettinsoul.wav sliced into 8 LASER slices on pads 01-08; a 16-step pattern; pattern sections A-D; a three-bank SONG arrangement; instrument captures for BASSIC, MONOGORG, ZOLA-X and DRUM SYNTH KICK/SNARE.',
    fileCount: files.length,
    files,
  }
  await writeFile(join(root, 'MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  return manifest
}

/** Archive whatever set is in current/, then move the finished staging set in. */
const promoteStaging = async () => {
  if (existsSync(CURRENT) && collectFiles(CURRENT).length > 0) {
    const manifestPath = join(CURRENT, 'MANIFEST.json')
    const previousId = existsSync(manifestPath)
      ? JSON.parse(readFileSync(manifestPath, 'utf8')).setId
      : `unversioned-${stamp(new Date(statSync(CURRENT).mtime))}`
    await mkdir(ARCHIVE, { recursive: true })
    const destination = join(ARCHIVE, previousId)
    if (existsSync(destination)) rmSync(destination, { recursive: true, force: true })
    renameSync(CURRENT, destination)
    console.log(`archived previous set -> assets/station/archive/${previousId}`)
  } else if (existsSync(CURRENT)) {
    rmSync(CURRENT, { recursive: true, force: true })
  }
  renameSync(STAGING, CURRENT)
}

// --- manifest-only mode -------------------------------------------------

if (has('--manifest-only')) {
  const existing = existsSync(join(CURRENT, 'MANIFEST.json'))
    ? JSON.parse(readFileSync(join(CURRENT, 'MANIFEST.json'), 'utf8'))
    : {}
  const manifest = await writeManifest(CURRENT, existing.setId ?? `unversioned-${stamp(new Date())}`, existing.capturedAt ?? new Date().toISOString(), existing)
  console.log(`MANIFEST.json rewritten: ${manifest.fileCount} files, set ${manifest.setId}`)
  process.exit(0)
}

// --- staging ------------------------------------------------------------

if (existsSync(STAGING)) rmSync(STAGING, { recursive: true, force: true })
for (const section of SECTIONS) await mkdir(join(STAGING, section), { recursive: true })

// --- dev server ---------------------------------------------------------

const reachable = async (url) => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1500) })
    return response.ok
  } catch {
    return false
  }
}

let vite = null
if (!await reachable(BASE)) {
  const port = new URL(BASE).port || '5173'
  // Called straight, not through pnpm: pnpm's dep-status check aborts without a
  // TTY in this environment (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY).
  const bin = join(STATION, 'node_modules', '.bin', 'vite.CMD')
  if (!existsSync(bin)) throw new Error(`No dev server at ${BASE} and no Vite at ${bin}. Run pnpm install in ${STATION}, or start the server yourself and pass --base-url.`)
  console.log(`starting Vite on port ${port}...`)
  vite = spawn(bin, ['--port', port, '--strictPort'], { cwd: STATION, shell: true, stdio: 'ignore' })
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline && !await reachable(BASE)) await new Promise((r) => setTimeout(r, 500))
  if (!await reachable(BASE)) throw new Error(`Vite did not come up on ${BASE} within 90s.`)
  console.log('Vite is up')
}
const stopVite = () => {
  if (!vite?.pid) return
  // shell:true means the child is cmd.exe wrapping node; kill the tree.
  try { execFileSync('taskkill', ['/PID', String(vite.pid), '/T', '/F'], { stdio: 'ignore' }) } catch { /* already gone */ }
}

// --- browser ------------------------------------------------------------

const playwright = await import(pathToFileURL(join(STATION, 'node_modules', '@playwright', 'test', 'index.mjs')).href)
const bundledBrowser = playwright.chromium.executablePath()
const browserExecutable = [
  bundledBrowser,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((candidate) => existsSync(candidate))
if (!browserExecutable) throw new Error('No Playwright Chromium, Google Chrome or Microsoft Edge executable is available for capture.')
let browser = null
let ctx = null
let page = null
const pageErrors = []

const capturedAt = new Date()
const setId = `${stamp(capturedAt).slice(0, 10)}-${stationCommit()}`

const calm = async () => {
  await page.evaluate(() => { const el = document.activeElement; if (el && el !== document.body) el.blur() })
  await page.mouse.move(2, 2)
}
const shot = async (rel, description, settle = 300) => {
  await calm()
  await page.waitForTimeout(settle)
  await page.screenshot({ path: join(STAGING, rel) })
  record(rel, description)
  console.log('  shot', rel)
}
/** Live states (held pads, running meters) must NOT be blurred/parked first. */
const liveShot = async (rel, description) => {
  await page.screenshot({ path: join(STAGING, rel) })
  record(rel, description)
  console.log('  shot', rel)
}
const crop = async (locator, rel, description, live = false) => {
  if (!live) { await calm(); await page.waitForTimeout(200) }
  await locator.screenshot({ path: join(STAGING, rel) })
  record(rel, description)
  console.log('  crop', rel)
}
const btn = (name) => page.getByRole('button', { name, exact: true })
const nav = async (label) => { await btn(label).click(); await page.waitForTimeout(500) }
const setRange = (locator, value) => locator.evaluate((el, v) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, String(v))
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}, value)

const openPadSynth = async (name) => {
  await page.getByRole('button', { name: new RegExp(`^${name}\\b`) }).first().click()
  await page.waitForTimeout(400)
  const confirm = btn('OPEN ON NEW PATTERN')
  if (await confirm.count() > 0) {
    await confirm.click()
    await page.waitForTimeout(1000)
  }
}

const captureHeldAudition = async (audition, rel, description) => {
  const box = await audition.boundingBox()
  if (!box) throw new Error(`Cannot measure audition control for ${rel}.`)
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(650)
  await liveShot(rel, description)
  await page.mouse.up()
  await page.mouse.move(2, 2)
  await page.waitForTimeout(250)
}

/**
 * Capture the three instrument surfaces missing from the original set. ZOLA-X
 * and the four-instrument picker are photographed earlier in a full run. This
 * block deliberately runs after every narrative screenshot so opening fresh
 * pattern groups cannot change the SONG or overview frames.
 */
const captureAdditionalSynths = async () => {
  console.log('SYNTH SUPPLEMENT')
  await nav('SYNTH')
  await page.getByRole('region', { name: 'Choose a synthesizer', exact: true }).waitFor()

  await openPadSynth('BASSIC')
  await page.getByRole('region', { name: /^BASSIC editor/ }).waitFor()
  await shot('synth/bassic-idle.png', 'BASSIC at rest: twin oscillators, SUB, MIX and FILTER arranged as a tactile monophonic control surface.', 700)
  const bassicAudition = page.getByRole('button', { name: 'Hold to play synth', exact: true })
  if (await bassicAudition.count() > 0) {
    await captureHeldAudition(bassicAudition, 'synth/bassic-active.png', 'BASSIC sounding: the audition key is held while the full oscillator and filter surface remains visible.')
  }

  await btn('Back to synths').click()
  await page.getByRole('region', { name: 'Choose a synthesizer', exact: true }).waitFor()
  await openPadSynth('MONOGORG')
  await page.getByRole('region', { name: /^MONOGORG editor/ }).waitFor()
  await shot('synth/monogorg-idle.png', 'MONOGORG at rest: DRIVE, TONE, FILTER, ENV and MOD stages on its inlaid mono-bass panel.', 700)
  const monogorgAudition = page.getByRole('button', { name: 'Hold to play MONOGORG', exact: true })
  if (await monogorgAudition.count() > 0) {
    await captureHeldAudition(monogorgAudition, 'synth/monogorg-active.png', 'MONOGORG sounding: the audition key is held on the complete character-bass control surface.')
  }

  await btn('Back to synths').click()
  await page.getByRole('region', { name: 'Choose a synthesizer', exact: true }).waitFor()
  await page.getByRole('button', { name: /^DRUM SYNTH\b/ }).first().click()
  await page.getByRole('region', { name: 'DRUM SYNTH KICK editor', exact: true }).waitFor()
  await shot('synth/drum-synth-kick.png', 'DRUM SYNTH KICK: eight vertical controls for TUNE, PUNCH, BODY, CLICK, DECAY, TONE, DRIVE and DUST.', 700)
  await btn('SNARE').click()
  await page.getByRole('region', { name: 'DRUM SYNTH SNARE editor', exact: true }).waitFor()
  await shot('synth/drum-synth-snare.png', 'DRUM SYNTH SNARE: the alternate voice with SNAP, RATTLE and separate BODY/RATTLE decay controls.', 700)
}

/** Merge a successful supplement into current/ without touching existing PNGs. */
const mergeSynthSupplement = async () => {
  const manifestPath = join(CURRENT, 'MANIFEST.json')
  if (!existsSync(manifestPath)) throw new Error('The current Station set has no MANIFEST.json to supplement.')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const commit = stationCommit()
  const dirty = stationDirty()
  if (commit === 'unknown' || manifest.source?.commit !== commit || dirty !== false) {
    throw new Error(`Refusing to mix capture sources: current=${manifest.source?.commit ?? 'unknown'}, Station=${commit}, dirty=${dirty}.`)
  }

  const nextFiles = new Map((manifest.files ?? []).map((file) => [file.file, file]))
  for (const captured of shots) {
    const source = join(STAGING, captured.file)
    const destination = join(CURRENT, captured.file)
    await mkdir(dirname(destination), { recursive: true })
    await copyFile(source, destination)
    nextFiles.set(captured.file, {
      file: captured.file,
      description: captured.description,
      bytes: statSync(source).size,
      ...pngSize(source),
      sha256: sha256(source),
    })
  }

  manifest.capture.supplements = [
    ...(manifest.capture.supplements ?? []),
    {
      capturedAt: capturedAt.toISOString(),
      sourceCommit: commit,
      workingTreeDirty: dirty,
      files: shots.map(({ file }) => file),
    },
  ]
  manifest.content = 'Built-in break aalonbutler-gettinsoul.wav sliced into 8 LASER slices on pads 01-08; a 16-step pattern; pattern sections A-D; a three-bank SONG arrangement; instrument captures for BASSIC, MONOGORG, ZOLA-X and DRUM SYNTH KICK/SNARE.'
  manifest.files = [...nextFiles.values()].sort((a, b) => a.file.localeCompare(b.file))
  manifest.fileCount = manifest.files.length
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  return manifest
}

try {
  browser = await playwright.chromium.launch({ executablePath: browserExecutable, args: ['--autoplay-policy=no-user-gesture-required', '--force-color-profile=srgb'] })
  ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE, colorScheme: 'dark' })
  page = await ctx.newPage()
  page.on('pageerror', (error) => pageErrors.push(String(error.message)))

  // ---------------------------------------------------------------- boot
  await page.goto(BASE, { waitUntil: 'load' })
  await page.getByRole('region', { name: 'STATION', exact: true }).waitFor({ timeout: 30_000 })
  await page.addStyleTag({ content: '.type-lab{display:none !important}' })
  await btn('Start audio').click()
  await btn('Audio on').waitFor({ timeout: 20_000 })
  await page.waitForTimeout(900)
  console.log(`booted (set ${setId})`)

  if (SYNTH_SUPPLEMENT) {
    await captureAdditionalSynths()
    const manifest = await mergeSynthSupplement()
    rmSync(STAGING, { recursive: true, force: true })
    console.log(`\nsupplemented set ${manifest.setId} - ${shots.length} new synth shots, ${manifest.fileCount} files total`)
    console.log('page errors:', pageErrors.length === 0 ? 'none' : JSON.stringify(pageErrors))
  } else {
  // ---------------------------------------------------------------- LASER
  console.log('LASER')
  await nav('LASER')
  const chop = page.getByRole('region', { name: 'Chop', exact: true })
  await shot('laser/laser-overview.png', 'LASER entry state: CHOOSE WAV FILE, the four built-in samples, empty slice map.')

  await chop.getByRole('button', { name: '2', exact: true }).click()
  await btn('Preview source').waitFor({ timeout: 30_000 })
  await page.waitForTimeout(1300)
  await shot('laser/laser-loaded.png', 'Break loaded, waveform only, before any cut.')

  const waveform = page.locator('.waveform').first()
  await crop(waveform, 'details/waveform-laser.png', 'Clean uncut waveform - opening frame of a cut transition.')

  await setRange(page.locator('#auto-chop-smart-count'), 8)
  await page.waitForTimeout(900)
  await shot('laser/laser-preview-cut.png', 'Live cut preview: golden laser beams on the transients, CUT head at 8, CANCEL / SET.')
  await crop(waveform, 'details/slice-markers.png', 'The same waveform with golden laser cut markers - closing frame of a cut transition.')

  await btn('SET').click()
  await page.waitForTimeout(1500)
  await shot('laser/laser-sliced.png', 'Cut committed: numbered slices with draggable markers, pads 01-08 READY.')

  // Unlike the sequencer's, this playhead is derived from the visual clock every
  // frame, so it actually photographs. See NOTES in assets/station/README.md.
  await btn('Preview source').click()
  await calm()
  await page.waitForTimeout(900)
  await liveShot('laser/laser-playing.png', 'Source preview running - cyan playhead travelling across the sliced waveform.')
  await crop(waveform, 'details/waveform-playhead.png', 'Sliced waveform with the cyan playhead mid-travel.', true)
  const stopPreview = btn('Stop preview')
  if (await stopPreview.count() > 0 && await stopPreview.isEnabled()) await stopPreview.click()
  await page.waitForTimeout(400)

  // ---------------------------------------------------------------- PADS
  console.log('PADS')
  await nav('PADS')
  await shot('pads/pads-idle.png', 'Pad bank at rest: 01-08 loaded and READY, 09-16 EMPTY.')
  const padGrid = page.locator('.pad-grid').first()
  await crop(padGrid, 'details/pads-grid.png', 'The 16-pad grid alone, at rest.')

  // Held keys light several pads at once; one pointer can only hold one.
  // 2 / Q / R are PAD 02, PAD 05 and PAD 08 - all carrying slices.
  for (const key of ['2', 'q', 'r']) { await page.keyboard.down(key); await page.waitForTimeout(110) }
  await page.waitForTimeout(250)
  await liveShot('pads/pads-active.png', 'Three pads (02, 05, 08) held down at once - full press glow.')
  await crop(padGrid, 'details/pads-grid-active.png', 'The same grid with three pads lit - pairs with pads-grid.png.', true)
  for (const key of ['2', 'q', 'r']) await page.keyboard.up(key)
  await page.waitForTimeout(300)

  // ---------------------------------------------------------------- SEQ
  console.log('SEQ')
  await nav('SEQ')
  const stepTabs = page.getByRole('tablist', { name: 'Step range', exact: true }).getByRole('tab')
  const groove = {
    1: [1, 9, 16], 2: [3, 11], 3: [5, 13], 4: [7],
    5: [2, 6, 10, 14], 6: [4, 12], 7: [8, 15], 8: [6, 12],
  }
  for (const [padNo, steps] of Object.entries(groove)) {
    for (const step of steps) {
      await stepTabs.nth(step <= 8 ? 0 : 1).click()
      const cell = page.getByRole('button', { name: `PAD ${String(padNo).padStart(2, '0')}, step ${step}, empty`, exact: true })
      if (await cell.count() === 0) { console.log('   miss step', padNo, step); continue }
      await cell.click()
    }
  }
  await stepTabs.nth(0).click()
  await shot('seq-song/seq.png', 'Step matrix, 8 pads x steps 01-08, transport stopped.', 500)
  await crop(page.locator('.sequencer').first(), 'details/seq-grid.png', 'The step matrix alone, without app chrome.')

  await btn('Play').click()
  await calm()
  await page.waitForTimeout(900)
  await liveShot('seq-song/seq-active.png', 'The same pattern with the transport running (PLAY dimmed, STOP live). The playing-column marker is not capturable - see README NOTES.')
  await btn('Stop').click()
  await page.waitForTimeout(400)

  // Extra pattern sections, so SONG has a real hierarchy to show.
  for (const [variant, steps] of [['B', [1, 5, 9, 13, 3, 11]], ['C', [2, 4, 6, 8, 10, 12]], ['D', [1, 4, 7, 10, 13, 16]]]) {
    const create = page.getByRole('button', { name: `Create pattern ${variant}`, exact: true })
    if (await create.count() === 0) continue
    await create.click()
    await page.waitForTimeout(500)
    const tabs = page.getByRole('tablist', { name: 'Step range', exact: true }).getByRole('tab')
    const offset = variant === 'B' ? 16 : variant === 'C' ? 32 : 48
    const padNo = variant === 'B' ? '02' : variant === 'C' ? '05' : '07'
    for (const step of steps) {
      await tabs.nth(step <= 8 ? 0 : 1).click()
      const cell = page.getByRole('button', { name: `PAD ${padNo}, step ${step + offset}, empty`, exact: true })
      if (await cell.count() === 0) { console.log('   miss section cell', variant, step + offset); continue }
      await cell.click()
    }
  }
  await page.getByRole('button', { name: 'Pattern A', exact: true }).click()
  await page.waitForTimeout(400)

  // ---------------------------------------------------------------- MIX
  console.log('MIX')
  await nav('MIX')
  const levels = { '01': 1, '02': 0.82, '03': 0.67, '04': 0.9, '05': 0.74, '06': 0.86, '07': 0.61, '08': 0.79 }
  for (const [padNo, value] of Object.entries(levels)) {
    const fader = page.locator(`input[aria-label="PAD ${padNo} volume"]`)
    if (await fader.count() === 0) continue
    await setRange(fader, value)
    await page.waitForTimeout(60)
  }
  await shot('mix/mix.png', 'Eight channels at mixed levels, M/S per channel, BUS & FX (G1 / MASTER). Meters idle.', 600)
  const strips = page.locator('.mixer-strips').first()
  await crop(strips, 'details/mix-faders.png', 'The eight-channel bank alone, meters idle.')

  await btn('Play').click()
  await calm()
  await page.waitForTimeout(2600)
  await liveShot('mix/mix-active.png', 'The same channels during playback - live dBFS meters at different levels on all eight.')
  await crop(strips, 'details/mix-meters.png', 'The channel bank with meters moving - pairs with mix-faders.png.', true)
  await page.waitForTimeout(800)
  await liveShot('mix/mix-active-02.png', 'A second meter frame from another point in the loop, for two-frame animations.')
  await btn('Stop').click()
  await page.waitForTimeout(400)

  // ---------------------------------------------------------------- SYNTH
  console.log('SYNTH')
  await nav('SYNTH')
  await shot('synth/synth-picker.png', 'Instrument picker: BASSIC / MONOGORG / ZOLA-X / DRUM SYNTH with their own glyphs.', 400)
  await page.getByRole('button', { name: /ZOLA-X/ }).first().click()
  await page.waitForTimeout(400)
  const confirm = btn('OPEN ON NEW PATTERN')
  if (await confirm.count() > 0) { await confirm.click(); await page.waitForTimeout(1000) }
  // A more expressive wavetable read, and it clears the creation toast off the
  // system display at the same time.
  const positionSlider = page.locator('.poly-osc-main-controls .poly-control input[type="range"]').first()
  if (await positionSlider.count() > 0) { await setRange(positionSlider, 0.62); await page.waitForTimeout(500) }
  await shot('synth/zola-x-idle.png', 'ZOLA-X at rest: the wavetable screen, OSC/FILTER/ENV/MOD pages, TABLE, UNISON, POSITION, LEVEL, OSC MIX.', 700)
  const polyDisplay = page.locator('.poly-display').first()
  await crop(polyDisplay, 'details/wavetable-zola-x.png', 'The ZOLA-X wavetable screen alone, at rest.')

  const audition = page.getByRole('button', { name: 'Hold to play ZOLA-X', exact: true })
  if (await audition.count() > 0) {
    const box = await audition.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(800)
    await liveShot('synth/zola-x-active.png', 'ZOLA-X sounding: the wavetable turns into a live read, audition key lit.')
    await crop(polyDisplay, 'details/wavetable-zola-x-active.png', 'The wavetable screen while sounding - pairs with wavetable-zola-x.png.', true)
    await page.mouse.up()
    await page.mouse.move(2, 2)
    await page.waitForTimeout(300)
  }

  const newBank = btn('New bank')
  if (await newBank.count() > 0) { await newBank.click(); await page.waitForTimeout(600) }

  // ---------------------------------------------------------------- SONG
  console.log('SONG')
  await nav('SONG')
  for (const [row, slots] of [['1A', [1, 2, 5, 6]], ['1B', [3, 7]], ['1C', [4]], ['1D', [8]], ['2A', [5, 6, 7, 8]], ['3A', [2, 4]]]) {
    for (const slot of slots) {
      const cell = page.getByRole('button', { name: `${row}, slot ${slot}, empty`, exact: true })
      if (await cell.count() === 0) { console.log('   miss song slot', row, slot); continue }
      await cell.click()
      await page.waitForTimeout(70)
    }
  }
  await shot('seq-song/song.png', 'Arrangement with six lanes (1A-1D, 2A, 3A) and per-bank clip colours - bank / section / slot hierarchy.', 600)
  await crop(page.locator('.arrangement').first(), 'details/song-arrangement.png', 'The arrangement grid alone, six lanes of clips.')

  await btn('Song mode').click()
  await page.waitForTimeout(300)
  await btn('Play').click()
  await calm()
  await page.waitForTimeout(2400)
  await liveShot('seq-song/song-active.png', 'The arrangement playing in SONG mode.')
  await btn('Stop').click()
  await btn('Pattern mode').click()
  await page.waitForTimeout(400)

  // ---------------------------------------------------------------- OVERVIEW
  console.log('OVERVIEW')
  await page.locator('.bank-select-trigger').click()
  await page.waitForTimeout(250)
  const bank1 = page.getByRole('option', { name: /BANK 01/ }).first()
  if (await bank1.count() > 0) await bank1.click()
  else await page.keyboard.press('Escape')
  await page.waitForTimeout(600)

  await nav('LASER')
  await setRange(page.locator('#auto-chop-smart-count'), 8)
  await page.waitForTimeout(900)
  await shot('overview/station-overview-01.png', 'HERO. Whole instrument mid-cut: waveform with laser beams, CUT at 8, filled slice map below.', 400)
  const cancel = btn('CANCEL')
  if (await cancel.count() > 0) { await cancel.click(); await page.waitForTimeout(400) }

  await nav('PADS')
  await shot('overview/station-overview-02.png', 'Whole instrument in PADS with the loaded bank - the calmer product portrait.', 600)

  await captureAdditionalSynths()

  // ---------------------------------------------------------------- manifest
  const manifest = await writeManifest(STAGING, setId, capturedAt.toISOString())
  await promoteStaging()
  console.log(`\nset ${manifest.setId} - ${manifest.fileCount} files, commit ${manifest.source.commit}${manifest.source.workingTreeDirty ? ' (DIRTY working tree)' : ''}`)
  console.log('page errors:', pageErrors.length === 0 ? 'none' : JSON.stringify(pageErrors))
  console.log('\nNEXT: MANIFEST.json is machine truth and is now current. ASSET_INDEX.md is the')
  console.log('hand-written narrative doc - refresh its set id and any changed descriptions.')
  }
} finally {
  await browser?.close()
  stopVite()
  // Only a run that reached promoteStaging() leaves no staging directory; any
  // other outcome discards its partial work and leaves current/ untouched.
  if (existsSync(STAGING)) {
    rmSync(STAGING, { recursive: true, force: true })
    console.log('run did not finish - staging discarded, assets/station/current/ left as it was')
  }
}
