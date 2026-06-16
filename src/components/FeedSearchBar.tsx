import { useNavigate } from '@tanstack/react-router'
import type { Category } from '#/generated/prisma/client'
import { CATEGORIES } from '#/lib/categories'
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
  basePath: '/app/explore'
}

export function FeedSearchBar({ q = '', category, basePath }: SearchBarProps) {
  const navigate = useNavigate()

  const update = (next: { q?: string; category?: Category | 'all' }) => {
    void navigate({
      to: basePath,
      search: {
        q: next.q ?? q,
        category:
          next.category === 'all' || next.category === undefined
            ? undefined
            : next.category ?? category,
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
          placeholder="Search workflows, skills, tools..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              update({ q: e.currentTarget.value })
            }
          }}
        />
      </div>
      <Select
        value={category ?? 'all'}
        onValueChange={(value) =>
          update({ category: value as Category | 'all' })
        }
      >
        <SelectTrigger className="feed-search__select">
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
