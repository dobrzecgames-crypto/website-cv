#!/usr/bin/env node
/**
 * Static file server for local prototyping. Zero dependencies — node:http and
 * node:fs only, so the project still has no package.json and nothing to install.
 *
 *   node tools/serve.mjs [--port 4173] [--root .]
 *
 * Serves the repository root so the prototype can reference assets/ directly
 * at the same paths it will use later. No caching, no directory listings.
 */

import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}

const ROOT = resolve(flag('root', resolve(fileURLToPath(import.meta.url), '..', '..')))
const PORT = Number(flag('port', process.env.PORT || 4173))

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4'
}

const send = (res, code, body) => {
  res.writeHead(code, { 'content-type': 'text/plain; charset=utf-8' })
  res.end(body)
}

const server = createServer(async (req, res) => {
  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  } catch {
    return send(res, 400, '400 bad request')
  }

  if (pathname.endsWith('/')) pathname += 'index.html'

  // resolve inside ROOT, refuse anything that escapes it
  const target = join(ROOT, normalize(pathname).replace(/^([/\\])+/, ''))
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return send(res, 403, '403 forbidden')

  let info
  try {
    info = await stat(target)
  } catch {
    return send(res, 404, `404 not found — ${pathname}`)
  }
  if (info.isDirectory()) return send(res, 404, `404 not found — ${pathname}`)

  res.writeHead(200, {
    'content-type': TYPES[extname(target).toLowerCase()] || 'application/octet-stream',
    'content-length': info.size,
    'cache-control': 'no-store'
  })
  createReadStream(target).pipe(res)
})

server.listen(PORT, () => {
  console.log(`website prototype  ->  http://localhost:${PORT}/`)
  console.log(`serving            ->  ${ROOT}`)
})
