const STORAGE_KEY = 'onie-saved-workflows'

function readIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

function writeIds(ids: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function getBookmarkedIds(): string[] {
  return readIds()
}

export function isBookmarked(postId: string): boolean {
  return readIds().includes(postId)
}

export function toggleBookmark(postId: string): boolean {
  const ids = readIds()
  const next = ids.includes(postId)
    ? ids.filter((id) => id !== postId)
    : [...ids, postId]
  writeIds(next)
  return next.includes(postId)
}
