export function normalizeInvitationEmail(value: string) {
  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error('Enter a valid email address.')
  }
  return email
}

export function createInvitationToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export async function hashInvitationToken(token: string) {
  const normalized = token.trim()
  if (!/^[A-Za-z0-9_-]{40,128}$/.test(normalized)) {
    throw new Error('This invitation link is not valid.')
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
