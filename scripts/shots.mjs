// Visual inspection harness: screenshots the game at key stages with Brave
// (headless) and records console errors / failed requests.
//
//   node scripts/shots.mjs http://127.0.0.1:4173 out [--webgl]
import { chromium } from 'playwright'
import fs from 'node:fs'

const [, , base = 'http://127.0.0.1:4173', outDir = 'shots', ...flags] = process.argv
const webgl = flags.includes('--webgl')
fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({
  executablePath: '/usr/bin/brave-origin-stable',
  headless: true,
  args: [
    '--no-sandbox',
    // The jump makes its own sound; allow it in headless after the Start click.
    '--autoplay-policy=no-user-gesture-required',
    ...(webgl ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--disable-gpu']),
  ],
})

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const logs = []
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => logs.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`))
page.on('response', (r) => {
  if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`)
})

const shot = async (name) => {
  await page.screenshot({ path: `${outDir}/${name}.png` })
  console.log('shot', name)
}
const wait = (ms) => page.waitForTimeout(ms)

/** Clicks the first button whose visible text matches. */
async function clickText(text) {
  const btn = page.getByRole('button', { name: new RegExp(text, 'i') }).first()
  await btn.waitFor({ timeout: 15000 })
  await btn.click()
}

try {
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  await wait(1500)
  await shot('01-mission-control')

  await clickText('start the adventure')
  await clickText('skip') // dismiss the fullscreen time-travel jump video
  await wait(2500)
  await shot('02-warp')

  await clickText('follow ranger 7')
  await wait(2500)
  await shot('03-explorer-hub')

  await clickText('the story')
  await wait(1200)
  await shot('04-story')

  for (let i = 0; i < 4; i++) {
    await clickText('continue')
    await wait(500)
  }
  await shot('05-story-end')
} catch (err) {
  logs.push(`[harness] ${err.message}`)
  await shot('99-failure')
} finally {
  console.log('\n--- console / network ---')
  console.log(logs.join('\n') || '(clean)')
  await browser.close()
}
