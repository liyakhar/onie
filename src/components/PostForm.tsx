import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import type { Category, PostKind } from '#/generated/prisma/client'
import { CATEGORIES } from '#/lib/categories'
import { POST_KINDS } from '#/lib/kinds'
import { createPost, deletePost, updatePost } from '#/server/posts'
import { ToolsTagPicker } from '#/components/ToolsTagPicker'

export type PostFormValues = {
  title: string
  description: string
  content: string
  category: Category
  kind: PostKind
  tools: string[]
}

type PostFormProps = {
  mode: 'create' | 'edit'
  postId?: string
  initial: PostFormValues
  cancelTo: string
}

export function PostForm({ mode, postId, initial, cancelTo }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [content, setContent] = useState(initial.content)
  const [category, setCategory] = useState<Category>(initial.category)
  const [kind, setKind] = useState<PostKind>(initial.kind)
  const [tools, setTools] = useState<string[]>(initial.tools)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = { title, description, content, category, kind, tools }
      if (mode === 'create') {
        const post = await createPost({ data: payload })
        void router.navigate({ to: '/p/$postId', params: { postId: post.id } })
      } else if (postId) {
        const post = await updatePost({ data: { id: postId, ...payload } })
        void router.navigate({ to: '/p/$postId', params: { postId: post.id } })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!postId) return
    if (!window.confirm('Delete this workflow permanently? This cannot be undone.')) return

    setError('')
    setDeleting(true)
    try {
      await deletePost({ data: { id: postId } })
      void router.navigate({ to: cancelTo })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow')
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="app-form">
      <div className="app-form__field">
        <label className="app-form__label" htmlFor="post-title">
          Title
        </label>
        <input
          id="post-title"
          className="app-form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. UX research synthesis with Claude + Cursor skills"
          required
        />
      </div>

      <div className="app-form__field">
        <label className="app-form__label" htmlFor="post-description">
          Short description
        </label>
        <input
          id="post-description"
          className="app-form__input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="One line on what this workflow helps you do"
        />
      </div>

      <div className="app-form__field">
        <label className="app-form__label" htmlFor="post-kind">
          What are you sharing?
        </label>
        <select
          id="post-kind"
          className="app-form__select"
          value={kind}
          onChange={(e) => setKind(e.target.value as PostKind)}
        >
          {POST_KINDS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <p className="app-form__hint">
          {POST_KINDS.find((k) => k.value === kind)?.description}
        </p>
      </div>

      <div className="app-form__field">
        <label className="app-form__label" htmlFor="post-category">
          Field
        </label>
        <select
          id="post-category"
          className="app-form__select"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <p className="app-form__hint">
          {CATEGORIES.find((c) => c.value === category)?.description}
        </p>
      </div>

      <div className="app-form__field">
        <label className="app-form__label" htmlFor="post-tools">
          Tools & models
        </label>
        <ToolsTagPicker id="post-tools" value={tools} onChange={setTools} />
      </div>

      <div className="app-form__field">
        <label className="app-form__label" htmlFor="post-content">
          Workflow details
        </label>
        <textarea
          id="post-content"
          className="app-form__textarea app-form__textarea--mono"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'## Setup\n\n- Add these skills...\n\n## Steps\n\n1. ...'}
          required
          rows={14}
        />
        <p className="app-form__hint">Markdown supported.</p>
      </div>

      {error && <p className="post-detail__error">{error}</p>}

      <div className="app-form__actions">
        <button type="submit" className="btn" disabled={loading || deleting}>
          <span className="btn__label">
            {loading
              ? mode === 'create'
                ? 'Publishing…'
                : 'Saving…'
              : mode === 'create'
                ? 'Publish workflow'
                : 'Save changes'}
          </span>
        </button>
        <Link to={cancelTo} className="feed-tab">
          Cancel
        </Link>
        {mode === 'edit' && (
          <button
            type="button"
            className="feed-tab app-form__danger"
            onClick={handleDelete}
            disabled={loading || deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </form>
  )
}
