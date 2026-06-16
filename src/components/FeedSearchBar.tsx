import { useNavigate } from '@tanstack/react-router'
import type { Category, PostKind } from '#/generated/prisma/client'
import { CATEGORIES } from '#/lib/categories'
import { POST_KINDS } from '#/lib/kinds'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Search } from 'lucide-react'

type SearchBarProps = {
  q?: string
  category?: Category
  kind?: PostKind
  basePath: '/app/explore'
}

export function FeedSearchBar({ q = '', category, kind, basePath }: SearchBarProps) {
  const navigate = useNavigate()

  const update = (next: {
    q?: string
    category?: Category | 'all'
    kind?: PostKind | 'all'
  }) => {
    void navigate({
      to: basePath,
      search: {
        q: next.q ?? q,
        category:
          next.category === 'all' || next.category === undefined
            ? undefined
            : next.category ?? category,
        kind:
          next.kind === 'all' || next.kind === undefined
            ? undefined
            : next.kind ?? kind,
      },
    })
  }

  return (
    <div className="feed-search">
      <div className="feed-search__field">
        <Search className="feed-search__icon" aria-hidden="true" />
        <input
          className="feed-search__input"
          type="search"
          defaultValue={q}
          placeholder="Search workflows, prompts, skills..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              update({ q: e.currentTarget.value })
            }
          }}
        />
      </div>
      <Select
        value={kind ?? 'all'}
        onValueChange={(value) => update({ kind: value as PostKind | 'all' })}
      >
        <SelectTrigger className="feed-search__select" aria-label="Filter by type">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {POST_KINDS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={category ?? 'all'}
        onValueChange={(value) => update({ category: value as Category | 'all' })}
      >
        <SelectTrigger className="feed-search__select" aria-label="Filter by field">
          <SelectValue placeholder="All fields" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All fields</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
