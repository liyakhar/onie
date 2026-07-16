import { createProviderJwt } from '../src/server/enable-banking-sync'

if (process.env.ENABLE_BANKING_ENVIRONMENT !== 'sandbox') {
  throw new Error('Refusing provider verification unless ENABLE_BANKING_ENVIRONMENT=sandbox.')
}
if (process.env.ENABLE_BANKING_PUBLIC_ACCESS_APPROVED === 'true') {
  throw new Error('Sandbox verification must not use the public-access approval flag.')
}

const country = String(process.argv[2] || 'BE').trim().toUpperCase()
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
  throw new Error(`Enable Banking sandbox returned HTTP ${response.status}: ${body.slice(0, 300)}`)
}
const parsed = JSON.parse(body) as { aspsps?: Array<{ name?: string }> }
const institutions = (parsed.aspsps || []).map((item) => item.name).filter(Boolean)
console.log(`Enable Banking sandbox verified for ${country}: ${institutions.length} AIS institutions available.`)
console.log(institutions.slice(0, 10).join(', '))
