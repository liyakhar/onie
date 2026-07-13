import { spawnSync } from 'node:child_process'

const baseUrl = process.argv[2] ?? 'https://onie.pages.dev'
const routes = ['/', '/login', '/app', '/app/accounts', '/app/transactions', '/app/budgets', '/app/recurring', '/app/insights', '/app/settings']
const badStrings = [
  'Server function info not found',
  'Application error',
  'Demo accounts',
  'liya_k',
  'sasha_zelts',
  'mathiew_builds',
  'matios_apps',
  'rayan_roberts',
]
const ignoredBrowserNoise = [
  'IPH_BatterySaverMode',
  'PHONE_REGISTRATION_ERROR',
  'task_policy_set',
  'mach_port_rendezvous',
  'policy_logger',
  'SharedImageManager::ProduceMemory',
  'installwebapp?usp=chrome_default',
  'blink.mojom.FrameWidgetHost',
  'blink.mojom.WidgetHost',
]

const results = []

for (const route of routes) {
  const url = `${baseUrl}${route}`
  const chrome = spawnSync(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--dump-dom',
      '--virtual-time-budget=3000',
      '--window-size=1440,1000',
      url,
    ],
    { encoding: 'utf8', timeout: 30_000 },
  )

  const html = chrome.stdout ?? ''
  const stderr = chrome.stderr ?? ''
  const title = html.match(/<title>(.*?)<\/title>/is)?.[1] ?? ''
  const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/is)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''
  const badMatches = badStrings.filter((badString) => html.includes(badString))
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)

  results.push({
    route,
    status: chrome.status,
    title,
    h1,
    badMatches,
    stderr: stderr
      .split('\n')
      .filter((line) => line.includes('ERROR') || line.includes('FATAL'))
      .filter((line) => !ignoredBrowserNoise.some((noise) => line.includes(noise)))
      .slice(0, 5),
    visibleText,
  })
}

console.log(JSON.stringify(results, null, 2))

const failed = results.some(
  (result) =>
    result.status !== 0 ||
    result.badMatches.length > 0 ||
    result.stderr.length > 0,
)

process.exit(failed ? 1 : 0)
