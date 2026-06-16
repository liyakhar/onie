import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { outreachRoot } from './config.mjs'
import { classifyPost } from './classify.mjs'
import { extractSpecificDetail } from './specific-detail.mjs'
import { loadTemplate, renderTemplate, truncateForTweet } from './template.mjs'
import { maybeImproveDraft } from './llm.mjs'

export async function createDraft(postText, { config, signals, useLlm = true }) {
  const classify = classifyPost(postText, signals)
  if (classify.score < config.minClassifyScore || classify.variant === 'skip') {
    return { classify, draftText: null, skipped: true }
  }

  const specific_detail = extractSpecificDetail(postText, classify.variant)
  const enrichedClassify = { ...classify, specific_detail }

  const templateBody = await loadTemplate(classify.variant)
  let draftText = truncateForTweet(
    renderTemplate(templateBody, {
      specific_detail,
      field: classify.field || 'your field',
      site_url: config.siteUrl,
    }),
  )

  if (useLlm) {
    const improved = await maybeImproveDraft({
      postText,
      classify: enrichedClassify,
      templateDraft: draftText,
      siteUrl: config.siteUrl,
    })
    if (improved) draftText = truncateForTweet(improved)
  }

  return { classify: enrichedClassify, draftText, skipped: false }
}

export async function loadPrompt(name) {
  return readFile(path.join(outreachRoot(), 'prompts', `${name}.md`), 'utf8')
}
