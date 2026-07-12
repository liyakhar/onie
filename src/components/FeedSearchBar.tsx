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
import { useState } from 'react'

type SearchBarProps = {
  q?: string
  category?: Category
  kind?: PostKind
  tool?: string
  basePath: '/app/explore'
  view?: string
  onClearFilters?: () => void
  hasActiveFilters?: boolean
}

export function FeedSearchBar({
  q = '',
  category,
  kind,
  tool,
  basePath,
  view,
  onClearFilters,
  hasActiveFilters,
}: SearchBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(q)

  const update = (next: {
    q?: string
    category?: Category | 'all'
    kind?: PostKind | 'all'
    tool?: string | null
  }) => {
    void navigate({
      to: basePath,
      search: {
        q: next.q ?? query,
        category:
          next.category === 'all' || next.category === undefined
            ? undefined
            : (next.category ?? category),
        kind:
          next.kind === 'all' || next.kind === undefined
            ? undefined
            : (next.kind ?? kind),
        tool:
          next.tool === null
            ? undefined
            : next.tool === undefined
              ? tool
              : next.tool,
        view: view as 'workflows' | 'people' | undefined,
      },
    })
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    update({ q: query.trim() })
  }

  return (
    <div className="feed-search">
      <form className="feed-search__field" onSubmit={submitSearch}>
        <Search className="feed-search__icon" aria-hidden="true" />
        <input
          className="feed-search__input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search workflows, prompts, skills..."
        />
        <button type="submit" className="feed-search__submit" aria-label="Search">
          Search
        </button>
      </form>
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
      {tool && (
        <button
          type="button"
          className="feed-search__tool-clear"
          onClick={() => update({ tool: null })}
        >
          {tool} ×
        </button>
      )}
      {hasActiveFilters && onClearFilters && (
        <button type="button" className="feed-search__clear" onClick={onClearFilters}>
          Clear filters
        </button>
      )}
    </div>
  )
}
