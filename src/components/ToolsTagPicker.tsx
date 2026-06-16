import { useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { SUGGESTED_TOOLS } from '#/lib/tools'
import { getPopularTools } from '#/server/posts'
import { cn } from '#/lib/utils'

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function ToolsTagPicker({
  value,
  onChange,
  id,
  className,
}: {
  value: string[]
  onChange: (tools: string[]) => void
  id?: string
  className?: string
}) {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState('')
  const [popular, setPopular] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    void getPopularTools().then(setPopular).catch(() => setPopular([]))
  }, [])

  const suggestions = [...new Set([...popular, ...SUGGESTED_TOOLS])]
    .filter((tool) => {
      const taken = value.some((t) => t.toLowerCase() === tool.toLowerCase())
      if (taken) return false
      if (!input.trim()) return true
      return tool.toLowerCase().includes(input.trim().toLowerCase())
    })
    .slice(0, 8)

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw)
    if (!tag) return
    const exists = value.some((t) => t.toLowerCase() === tag.toLowerCase())
    if (exists) {
      setInput('')
      return
    }
    onChange([...value, tag])
    setInput('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={cn('tag-picker', className)}>
      <div
        className="tag-picker__field"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span key={tag} className="tag-picker__chip">
            {tag}
            <button
              type="button"
              className="tag-picker__remove"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120)
          }}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? 'Type a tool and press Enter' : 'Add another…'}
          className="tag-picker__input"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          autoComplete="off"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul id={listId} className="tag-picker__suggestions" role="listbox">
          {suggestions.map((tool) => (
            <li key={tool} role="option">
              <button
                type="button"
                className="tag-picker__suggestion"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(tool)}
              >
                {tool}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="tag-picker__hint">Press Enter or comma to add. Pick from suggestions or type your own.</p>
    </div>
  )
}
