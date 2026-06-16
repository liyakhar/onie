import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Category } from '#/generated/prisma/client'
import { CATEGORIES } from '#/lib/categories'
import { createPost } from '#/server/posts'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/new')({
  component: NewPostPage,
})

function NewPostPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<Category>('OTHER')
  const [tools, setTools] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isPending && !session?.user) {
      void router.navigate({ to: '/login' })
    }
  }, [isPending, session?.user, router])

  if (isPending || !session?.user) {
    return (
      <main className="page-wrap flex min-h-[60vh] items-center justify-center px-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]" />
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const post = await createPost({
        data: {
          title,
          description,
          content,
          category,
          tools: tools
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        },
      })
      void router.navigate({ to: '/p/$postId', params: { postId: post.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <Card className="mx-auto max-w-2xl border-[var(--line)] bg-[var(--surface-strong)]">
        <CardHeader>
          <CardTitle>Share a workflow</CardTitle>
          <CardDescription>
            Post the skills, prompts, file structure, or agent setup that works for you.
            Markdown is supported in the body.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. UX research synthesis with Claude + Cursor skills"
                required
                className="border-[var(--line)]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Short description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="One line on what this workflow helps you do"
                className="border-[var(--line)]"
              />
            </div>
            <div className="grid gap-2">
              <Label>Field</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="border-[var(--line)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tools">Tools & models (comma-separated)</Label>
              <Input
                id="tools"
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                placeholder="Claude, Cursor, SKILL.md, MCP"
                className="border-[var(--line)] font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Workflow details</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={'## Setup\n\n- Add these skills...\n\n## Steps\n\n1. ...'}
                required
                rows={14}
                className="border-[var(--line)] font-mono text-sm leading-relaxed"
              />
            </div>
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
              >
                {loading ? 'Publishing…' : 'Publish workflow'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/app">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
