#!/usr/bin/env node
import pg from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

try {
  const result = await client.query(`
    SELECT
      count(*) FILTER (WHERE "tokenRef" IS NOT NULL)::int AS total,
      count(*) FILTER (
        WHERE "tokenRef" IS NOT NULL
          AND "tokenRef" NOT LIKE 'enc:v1:%'
      )::int AS plaintext
    FROM "BankConnection"
    WHERE provider = 'SIMPLEFIN'
  `)
  const counts = result.rows[0] ?? { total: 0, plaintext: 0 }
  console.log(JSON.stringify(counts))
  if (counts.plaintext > 0) process.exitCode = 1
} finally {
  await client.end()
}
