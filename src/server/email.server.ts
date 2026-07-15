type AccountEmail = {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendAccountEmail(message: AccountEmail) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[wollie] Email not delivered in development: ${message.subject} -> ${message.to}`)
      return
    }
    throw new Error('Transactional email is not configured.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error(`Transactional email provider rejected the request (${response.status}).`)
  }
}

export function accountActionEmail(title: string, introduction: string, url: string) {
  const safeTitle = escapeHtml(title)
  const safeIntroduction = escapeHtml(introduction)
  const safeUrl = escapeHtml(url)
  return {
    text: `${introduction}\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
    html: `<h1>${safeTitle}</h1><p>${safeIntroduction}</p><p><a href="${safeUrl}">Continue securely</a></p><p>If you did not request this, you can ignore this email.</p>`,
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] || character)
}
