import { readText } from './config.mjs'

/**
 * Optional LLM polish when ANTHROPIC_API_KEY or OPENAI_API_KEY is set.
 * Falls back silently to template draft.
 */
export async function maybeImproveDraft({ postText, classify, templateDraft, siteUrl }) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim()
  const openaiKey = process.env.OPENAI_API_KEY?.trim()
  if (!anthropicKey && !openaiKey) return null

  const voice = await readText('references/voice.md').catch(() => '')
  const system = `You write short X replies as a founder. Under 280 chars. First person. Helpful not salesy. One Onie mention with URL. Return ONLY the reply text, no quotes.

${voice.slice(0, 1200)}`

  const user = `Post to reply to:
${postText}

Variant: ${classify.variant}
Detail to reference: ${classify.specific_detail}
Field: ${classify.field}
Site: ${siteUrl}

Template draft (improve, don't copy blindly):
${templateDraft}`

  try {
    if (anthropicKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || res.statusText)
      return data.content?.[0]?.text?.trim() || null
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        max_tokens: 200,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || res.statusText)
    return data.choices?.[0]?.message?.content?.trim() || null
  } catch (err) {
    console.warn(`LLM draft skipped: ${err.message}`)
    return null
  }
}
