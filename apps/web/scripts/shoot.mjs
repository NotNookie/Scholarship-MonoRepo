#!/usr/bin/env node
/*
  Dev screenshot helper — captures platform-console routes via the system's
  Chrome/Edge in headless mode. No extra dependencies.

  Requires the dev server running:  npm run dev -- --port 5178
  Then:
    node scripts/shoot.mjs overview "to=/platform&nav=pill&header=light&variant=compact"
    node scripts/shoot.mjs munis    "to=/platform/municipalities" 1400 1200

  It uses the DEV-only /__dev-as/super_admin route to log in and jump to `to`,
  and optional query params (variant/header/nav/buttons) set the design combo.
  Output PNGs land in apps/web/.shots/.
*/
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
const browser = BROWSERS.find(existsSync)
if (!browser) {
  console.error('No Chrome/Edge/Chromium found. Install one or edit BROWSERS in scripts/shoot.mjs.')
  process.exit(1)
}

const base = process.env.PF_BASE || 'http://localhost:5178'
const outDir = process.env.PF_OUT || join(process.cwd(), '.shots')
mkdirSync(outDir, { recursive: true })

const [name = 'shot', query = 'to=/platform', width = '1400', height = '1000'] = process.argv.slice(2)
const url = `${base}/__dev-as/super_admin?${query}`
const out = join(outDir, `${name}.png`)

execFileSync(browser, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  `--window-size=${width},${height}`, '--virtual-time-budget=6000',
  `--user-data-dir=${join(tmpdir(), 'pf-shot-' + name)}`,
  `--screenshot=${out}`, url,
], { stdio: 'ignore' })

console.log(out)
