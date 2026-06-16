/**
 * Run: dev-browser --timeout 120 < scripts/setup-google-oauth.mjs
 * Sign in to Google in the opened window if prompted, then the script continues.
 */
const REDIRECT_URI = 'http://localhost:3001/api/auth/callback/google'
const CLIENT_NAME = 'Onie Local Dev'

const page = await browser.getPage('gcp-oauth-setup')

await page.goto('https://console.cloud.google.com/apis/credentials', {
  waitUntil: 'domcontentloaded',
})

// Wait for Google sign-in to finish (up to 2 min)
for (let i = 0; i < 60; i++) {
  const url = page.url()
  if (url.includes('console.cloud.google.com')) break
  await page.waitForTimeout(2000)
}

if (!page.url().includes('console.cloud.google.com')) {
  throw new Error('Still on Google sign-in. Sign in in the browser window and re-run this script.')
}

console.log('On credentials page:', page.url())

// Create credentials > OAuth client ID
const createBtn = page.getByRole('button', { name: /create credentials/i })
if (await createBtn.count()) {
  await createBtn.click()
  await page.getByRole('menuitem', { name: /oauth client id/i }).click()
} else {
  // Fallback: direct link sometimes shown when no OAuth clients exist
  const oauthLink = page.getByRole('link', { name: /oauth client id/i })
  if (await oauthLink.count()) {
    await oauthLink.first().click()
  }
}

// OAuth consent screen wizard if this is first OAuth client
const configureConsent = page.getByRole('button', { name: /configure consent screen/i })
if (await configureConsent.count()) {
  console.log(
    'OAuth consent screen required. Complete it in the browser (External > app name "Onie" > save), then re-run this script.',
  )
  throw new Error('Configure OAuth consent screen first')
}

// Application type: Web application
const appType = page.getByLabel(/application type/i)
if (await appType.count()) {
  await appType.selectOption({ label: 'Web application' })
}

const nameInput = page.getByLabel(/^name$/i)
if (await nameInput.count()) {
  await nameInput.fill(CLIENT_NAME)
}

// Authorized redirect URIs — GCP uses "URIs" section with add button
const addUriBtn = page.getByRole('button', { name: /add uri/i })
if (await addUriBtn.count()) {
  await addUriBtn.click()
}

const uriInputs = page.locator('input[placeholder*="https"], input[aria-label*="URI"], input[name*="redirect"]')
const uriCount = await uriInputs.count()
if (uriCount > 0) {
  await uriInputs.nth(uriCount - 1).fill(REDIRECT_URI)
} else {
  const redirectField = page.getByLabel(/authorized redirect uris/i)
  if (await redirectField.count()) {
    await redirectField.fill(REDIRECT_URI)
  }
}

const createClient = page.getByRole('button', { name: /^create$/i })
await createClient.click()

await page.waitForTimeout(3000)

// Read client ID and secret from the dialog
const bodyText = await page.evaluate(() => document.body.innerText)

const clientIdMatch = bodyText.match(/Client ID\s*\n?\s*([0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com)/i)
const secretMatch = bodyText.match(/Client secret\s*\n?\s*([A-Za-z0-9_-]+)/i)

if (!clientIdMatch || !secretMatch) {
  const path = await saveScreenshot(await page.screenshot({ fullPage: true }), 'gcp-oauth-result.png')
  console.log(JSON.stringify({ screenshot: path, bodySnippet: bodyText.slice(0, 2000) }, null, 2))
  throw new Error('Could not read Client ID / secret from page. See screenshot.')
}

const result = {
  GOOGLE_CLIENT_ID: clientIdMatch[1],
  GOOGLE_CLIENT_SECRET: secretMatch[1],
  redirectUri: REDIRECT_URI,
}

console.log('SUCCESS')
console.log(JSON.stringify(result, null, 2))

await writeFile('google-oauth-creds.json', JSON.stringify(result, null, 2))
