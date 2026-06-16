#!/usr/bin/env node
/**
 * Draft an outreach reply from pasted post text (no X API required).
 *
 * Usage:
 *   pnpm outreach:draft -- --url "https://x.com/user/status/123" --text "post body..."
 *   pnpm outreach:draft -- --url "..." --text-file ./post.txt --author @someone
 *   pnpm outreach:draft -- --url "..." --text "..." --dry --no-llm
 */
import { readFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { loadConfig, loadSignals } from './lib/config.mjs'
import { createDraft } from './lib/draft-core.mjs'
import { appendQueue, newQueueRow } from './lib/queue.mjs'

function parseArgs(argv) {
  const args = { url: null, text: null, textFile: null, author: null, dry: false, yes: false, noLlm: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--url') args.url = argv[++i]
    else if (a === '--text') args.text = argv[++i]
    else if (a === '--text-file') args.textFile = argv[++i]
    else if (a === '--author') args.author = argv[++i]
    else if (a === '--dry') args.dry = true
    else if (a === '--yes' || a === '-y') args.yes = true
    else if (a === '--no-llm') args.noLlm = true
    else if (a === '--help' || a === '-h') args.help = true
  }
  return args
}

function printHelp() {
  console.log(`Usage:
  pnpm outreach:draft -- --url <post-url> --text "<post body>"
  pnpm outreach:draft -- --url <url> --text-file post.txt [--author @handle]

Options:
  --dry       Print draft without writing to queue
  --yes, -y   Queue without confirmation
  --no-llm    Template only (skip Anthropic/OpenAI polish)
`)
}

async function readStdin() {
  if (input.isTTY) return null
  const chunks = []
  for await (const chunk of input) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8').trim() || null
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  let postText = args.text
  if (args.textFile) postText = await readFile(args.textFile, 'utf8')
  if (!postText) postText = await readStdin()

  if (!args.url || !postText) {
    printHelp()
    process.exitCode = 1
    console.error('\nError: --url and post text (--text, --text-file, or stdin) are required.')
    return
  }

  const [config, signals] = await Promise.all([loadConfig(), loadSignals()])
  const { classify, draftText, skipped } = await createDraft(postText, {
    config,
    signals,
    useLlm: !args.noLlm,
  })

  console.log(`\nClassify: score ${classify.score}/5 — ${classify.reason}`)
  console.log(`Variant: ${classify.variant}${classify.field ? ` · field: ${classify.field}` : ''}`)
  if (classify.specific_detail) console.log(`Detail: ${classify.specific_detail}`)

  if (skipped || !draftText) {
    console.log('\nSkipped (below min score). Not queued.')
    process.exitCode = 2
    return
  }

  console.log(`\n--- Draft (${draftText.length} chars) ---\n`)
  console.log(draftText)
  console.log('\n-----------------------------------')

  if (args.dry) return

  let finalText = draftText
  if (!args.yes) {
    const rl = createInterface({ input, output })
    const answer = await rl.question('\nQueue this draft? [Y/n/e=edit] ')
    if (answer.toLowerCase() === 'n') {
      rl.close()
      console.log('Not queued.')
      return
    }
    if (answer.toLowerCase() === 'e') {
      console.log('Edited reply (single line):')
      const edited = await rl.question('> ')
      if (edited.trim()) finalText = edited.trim()
    }
    rl.close()
  }

  const row = newQueueRow({
    postUrl: args.url,
    postText,
    authorHandle: args.author,
    classify,
    draftText: finalText,
  })
  await appendQueue(row)
  console.log(`\nQueued as ${row.id}`)
  console.log('Run: pnpm outreach:review')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
