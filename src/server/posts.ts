import { createServerFn } from '@tanstack/react-start'
import type { Category } from '#/generated/prisma/client'
import { getDb } from '#/server/db-access.server'
import { getSessionUser } from '#/server/session.server'
import { emitNotification } from '#/server/notifications.server'

export type PostSummary = {
  id: string
  title: string
  description: string | null
  category: Category
  tools: string[]
  createdAt: Date
  author: {
    id: string
    name: string
    image: string | null
    profile: {
      username: string
      field: Category
    } | null
  }
  _count: {
    likes: number
    comments: number
  }
}

const postInclude = {
  author: {
    select: {
      id: true,
      name: true,
      image: true,
      profile: {
        select: {
          username: true,
          field: true,
        },
      },
    },
  },
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
} as const

function buildFeedWhere(data: {
  category?: Category
  q?: string
  authorIds?: string[]
}) {
  const where: {
    category?: Category
    OR?: Array<{
      title?: { contains: string; mode: 'insensitive' }
      description?: { contains: string; mode: 'insensitive' }
      content?: { contains: string; mode: 'insensitive' }
    }>
    authorId?: { in: string[] }
  } = {}

  if (data.category) {
    where.category = data.category
  }

  if (data.q) {
    where.OR = [
      { title: { contains: data.q, mode: 'insensitive' } },
      { description: { contains: data.q, mode: 'insensitive' } },
      { content: { contains: data.q, mode: 'insensitive' } },
    ]
  }

  if (data.authorIds) {
    where.authorId = { in: data.authorIds }
  }

  return where
}

export const getFeedPosts = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { tab?: 'following' | 'discover'; category?: Category; q?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()
    const tab = data.tab ?? 'discover'
    const q = data.q?.trim()

    if (tab === 'following' && !user) {
      return [] as PostSummary[]
    }

    let authorIds: string[] | undefined
    if (tab === 'following' && user) {
      const follows = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      })
      authorIds = follows.map((f) => f.followingId)
      if (authorIds.length === 0) {
        return [] as PostSummary[]
      }
    }

    return prisma.post.findMany({
      where: buildFeedWhere({ category: data.category, q, authorIds }),
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: postInclude,
    })
  })

export const getTopWorkflowsWeek = createServerFn({ method: 'GET' }).handler(
  async () => {
    const prisma = await getDb()
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const posts = await prisma.post.findMany({
      where: { createdAt: { gte: weekAgo } },
      include: postInclude,
      take: 30,
    })

    return posts
      .sort((a, b) => {
        const scoreA = a._count.likes * 2 + a._count.comments
        const scoreB = b._count.likes * 2 + b._count.comments
        if (scoreB !== scoreA) return scoreB - scoreA
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
      .slice(0, 5)
  },
)

export const getPost = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()

    const post = await prisma.post.findUnique({
      where: { id: data.id },
      include: {
        ...postInclude,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            pinnedPostId: true,
            profile: {
              select: {
                username: true,
                field: true,
                bio: true,
                headline: true,
              },
            },
          },
        },
      },
    })

    if (!post) return null

    let likedByMe = false
    if (user) {
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: { userId: user.id, postId: post.id },
        },
      })
      likedByMe = Boolean(like)
    }

    return { ...post, likedByMe }
  })

export const toggleLike = createServerFn({ method: 'POST' })
  .inputValidator((data: { postId: string }) => data)
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()
    if (!user) {
      throw new Error('Sign in to like')
    }

    const existing = await prisma.like.findUnique({
      where: {
        userId_postId: { userId: user.id, postId: data.postId },
      },
    })

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
      const count = await prisma.like.count({ where: { postId: data.postId } })
      return { liked: false, likeCount: count }
    }

    const post = await prisma.post.findUnique({
      where: { id: data.postId },
      select: { authorId: true },
    })

    await prisma.like.create({
      data: { userId: user.id, postId: data.postId },
    })
    const count = await prisma.like.count({ where: { postId: data.postId } })

    if (post) {
      void emitNotification({
        userId: post.authorId,
        actorId: user.id,
        type: 'LIKE',
        postId: data.postId,
      })
    }

    return { liked: true, likeCount: count }
  })

export const createPost = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      title: string
      description?: string
      content: string
      category: Category
      tools?: string[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()
    if (!user) {
      throw new Error('Sign in to share a workflow')
    }

    return prisma.post.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        content: data.content.trim(),
        category: data.category,
        tools: data.tools ?? [],
        authorId: user.id,
      },
      include: postInclude,
    })
  })

export const forkPost = createServerFn({ method: 'POST' })
  .inputValidator((data: { postId: string }) => data)
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()
    if (!user) {
      throw new Error('Sign in to fork this workflow')
    }

    const original = await prisma.post.findUnique({
      where: { id: data.postId },
      select: {
        title: true,
        description: true,
        content: true,
        category: true,
        tools: true,
        authorId: true,
      },
    })
    if (!original) {
      throw new Error('Workflow not found')
    }
    if (original.authorId === user.id) {
      throw new Error('You cannot fork your own workflow')
    }

    const forked = await prisma.post.create({
      data: {
        title: `Fork of: ${original.title}`,
        description: original.description,
        content: original.content,
        category: original.category,
        tools: original.tools,
        authorId: user.id,
        forkedFromId: data.postId,
      },
      include: postInclude,
    })

    void emitNotification({
      userId: original.authorId,
      actorId: user.id,
      type: 'FORK',
      postId: data.postId,
    })

    return forked
  })

export const pinPost = createServerFn({ method: 'POST' })
  .inputValidator((data: { postId: string | null }) => data)
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()
    if (!user) {
      throw new Error('Sign in required')
    }

    if (data.postId) {
      const post = await prisma.post.findFirst({
        where: { id: data.postId, authorId: user.id },
      })
      if (!post) {
        throw new Error('Post not found')
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { pinnedPostId: data.postId },
    })

    return { ok: true }
  })
