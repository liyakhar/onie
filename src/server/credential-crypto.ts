const CREDENTIAL_PREFIX = 'enc:v1'
const CREDENTIAL_CONTEXT = new TextEncoder().encode('wollie:simplefin-access-url:v1')

export function isEncryptedCredential(value: string) {
  return value.startsWith(`${CREDENTIAL_PREFIX}:`)
}

export async function encryptCredential(value: string, secret: string) {
  assertCredentialSecret(secret)
  if (!value) throw new Error('Cannot encrypt an empty credential.')

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await importCredentialKey(secret)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: CREDENTIAL_CONTEXT },
    key,
    new TextEncoder().encode(value),
  )

  return `${CREDENTIAL_PREFIX}:${toBase64Url(iv)}:${toBase64Url(new Uint8Array(ciphertext))}`
}

export async function decryptCredential(value: string, secret: string) {
  assertCredentialSecret(secret)
  const [prefix, version, encodedIv, encodedCiphertext] = value.split(':')
  if (`${prefix}:${version}` !== CREDENTIAL_PREFIX || !encodedIv || !encodedCiphertext) {
    throw new Error('Credential is not encrypted with a supported format.')
  }

  const key = await importCredentialKey(secret)
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: fromBase64Url(encodedIv),
      additionalData: CREDENTIAL_CONTEXT,
    },
    key,
    fromBase64Url(encodedCiphertext),
  )

  return new TextDecoder().decode(plaintext)
}

function assertCredentialSecret(secret: string) {
  if (secret.length < 32) {
    throw new Error('BANK_SYNC_ENCRYPTION_KEY must be at least 32 characters.')
  }
}

async function importCredentialKey(secret: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}
