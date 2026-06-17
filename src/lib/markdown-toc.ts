export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function extractToc(
  body: string,
): Array<{ id: string; label: string; level: 2 | 3 }> {
  const items: Array<{ id: string; label: string; level: 2 | 3 }> = []
  for (const line of body.split('\n')) {
    const h2 = line.match(/^## (.+)$/)
    if (h2) {
      items.push({ id: slugifyHeading(h2[1]), label: h2[1], level: 2 })
      continue
    }
    const h3 = line.match(/^### (.+)$/)
    if (h3) {
      items.push({ id: slugifyHeading(h3[1]), label: h3[1], level: 3 })
    }
  }
  return items
}
