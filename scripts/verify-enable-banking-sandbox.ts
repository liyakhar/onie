import { createProviderJwt } from '../src/server/enable-banking-sync'

const args = new Set(process.argv.slice(2))
const allowProduction = args.has('--production')
const environment = process.env.ENABLE_BANKING_ENVIRONMENT

if (environment !== 'sandbox' && environment !== 'production') {
  throw new Error('Set ENABLE_BANKING_ENVIRONMENT to sandbox or production.')
}
if (environment === 'sandbox' && process.env.ENABLE_BANKING_PUBLIC_ACCESS_APPROVED === 'true') {
  throw new Error('Sandbox verification must not use the public-access approval flag.')
}
if (environment === 'production' && !allowProduction) {
  throw new Error('Refusing production verification unless --production is passed.')
}
if (
  environment === 'production'
  && process.env.ENABLE_BANKING_PUBLIC_ACCESS_APPROVED !== 'true'
  && process.env.ENABLE_BANKING_RESTRICTED_TESTING !== 'true'
) {
  throw new Error('Production verification requires approved public access or restricted testing.')
}

const country = String(process.argv.find((arg) => /^[a-z]{2}$/i.test(arg)) || 'BE').trim().toUpperCase()
if (!/^[A-Z]{2}$/.test(country)) throw new Error('Country must be a two-letter code such as BE.')

const token = await createProviderJwt()
const response = await fetch(
  `https://api.enablebanking.com/aspsps?country=${encodeURIComponent(country)}&psu_type=personal&service=AIS`,
  {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20_000),
  },
)
const body = await response.text()
if (!response.ok) {
  throw new Error(`Enable Banking ${environment} returned HTTP ${response.status}: ${body.slice(0, 300)}`)
}
const parsed = JSON.parse(body) as { aspsps?: Array<{ name?: string }> }
const institutions = (parsed.aspsps || []).map((item) => item.name).filter(Boolean)
console.log(`Enable Banking ${environment} verified for ${country}: ${institutions.length} AIS institutions available.`)
console.log(institutions.slice(0, 10).join(', '))
