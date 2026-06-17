import { createServerFn } from '@tanstack/react-start'
import type { Category, PostKind } from '#/generated/prisma/client'
import { getDb } from '#/server/db-access.server'
import { getSessionUser } from '#/server/session.server'
import { emitNotification } from '#/server/notifications.server'
import { getSuggestedProfiles } from '#/server/profiles'

export type PostSummary = {
  id: string
  title: string
  description: string | null
  category: Category
  kind: PostKind
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
  kind?: PostKind
  tool?: string
  q?: string
  authorIds?: string[]
}) {
  const where: {
    category?: Category
    kind?: PostKind
    tools?: { has: string }
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

  if (data.kind) {
    where.kind = data.kind
  }

  if (data.tool) {
    where.tools = { has: data.tool }
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

function postScore(post: PostSummary) {
  return post._count.likes * 2 + post._count.comments
}

async function getForYouFeed(prisma: Awaited<ReturnType<typeof getDb>>, userId?: string) {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  let userField: Category | undefined
  if (userId) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { field: true },
    })
    userField = profile?.field
  }

  const [topWeek, fieldPosts, recent] = await Promise.all([
    prisma.post.findMany({
      where: { createdAt: { gte: weekAgo } },
      include: postInclude,
      take: 30,
    }),
    userField
      ? prisma.post.findMany({
          where: { category: userField },
          include: postInclude,
          orderBy: { createdAt: 'desc' },
          take: 12,
        })
      : Promise.resolve([]),
    prisma.post.findMany({
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
  ])

  const ranked = [...topWeek].sort((a, b) => {
    const scoreDiff = postScore(b) - postScore(a)
    if (scoreDiff !== 0) return scoreDiff
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const seen = new Set<string>()
  const merged: PostSummary[] = []

  for (const post of [...ranked.slice(0, 5), ...fieldPosts, ...recent]) {
    if (seen.has(post.id)) continue
    seen.add(post.id)
    merged.push(post)
    if (merged.length >= 50) break
  }

  return merged
}

export const loadHomeFeed = createServerFn({ method: 'GET' })
  .inputValidator((data: { tab?: 'for-you' | 'following' }) => data)
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    const tab = data.tab ?? 'for-you'

    if (tab === 'following' && !user) {
      return {
        posts: [] as PostSummary[],
        topThisWeek: [] as PostSummary[],
        suggested: [],
        tab,
        field: 'OTHER' as Category,
        isGuest: true,
      }
    }

    const prisma = await getDb()
    const profile = user
      ? await prisma.profile.findUnique({
          where: { userId: user.id },
          select: { field: true },
        })
      : null
    const field = profile?.field ?? ('OTHER' as Category)

    const [posts, topThisWeek, suggested] = await Promise.all([
      getFeedPosts({ data: { tab: tab === 'following' ? 'following' : 'for-you' } }),
      tab === 'for-you' ? getTopWorkflowsWeek() : Promise.resolve([]),
      tab === 'for-you' && user
        ? getSuggestedProfiles({ data: { field } })
        : Promise.resolve([]),
    ])

    return { posts, topThisWeek, suggested, tab, field, isGuest: !user }
  })

export const getFeedPosts = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      tab?: 'following' | 'discover' | 'for-you'
      category?: Category
      kind?: PostKind
      tool?: string
      q?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()
    const tab = data.tab ?? 'discover'
    const q = data.q?.trim()

    if (tab === 'for-you') {
      return getForYouFeed(prisma, user?.id)
    }

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
      where: buildFeedWhere({
        category: data.category,
        kind: data.kind,
        tool: data.tool,
        q,
        authorIds,
      }),
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
        forkedFrom: {
          select: {
            id: true,
            title: true,
          },
        },
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
      kind: PostKind
      tools?: string[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()
    if (!user) {
      throw new Error('Sign in to publish')
    }

    return prisma.post.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        content: data.content.trim(),
        category: data.category,
        kind: data.kind,
        tools: normalizeTools(data.tools),
        authorId: user.id,
      },
      include: postInclude,
    })
  })

export const updatePost = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: string
      title: string
      description?: string
      content: string
      category: Category
      kind: PostKind
      tools?: string[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()
    if (!user) {
      throw new Error('Sign in required')
    }

    const post = await prisma.post.findFirst({
      where: { id: data.id, authorId: user.id },
    })
    if (!post) {
      throw new Error('Workflow not found')
    }

    return prisma.post.update({
      where: { id: data.id },
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        content: data.content.trim(),
        category: data.category,
        kind: data.kind,
        tools: normalizeTools(data.tools),
      },
      include: postInclude,
    })
  })

export const deletePost = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()
    if (!user) {
      throw new Error('Sign in required')
    }

    const post = await prisma.post.findFirst({
      where: { id: data.id, authorId: user.id },
    })
    if (!post) {
      throw new Error('Workflow not found')
    }

    await prisma.user.updateMany({
      where: { pinnedPostId: data.id },
      data: { pinnedPostId: null },
    })

    await prisma.post.delete({ where: { id: data.id } })

    return { ok: true }
  })

export const getPopularTools = createServerFn({ method: 'GET' }).handler(async () => {
  const prisma = await getDb()
  const posts = await prisma.post.findMany({
    select: { tools: true },
    take: 200,
    orderBy: { createdAt: 'desc' },
  })

  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tool of post.tools) {
      const key = tool.trim()
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([tool]) => tool)
})

function normalizeTools(tools?: string[]) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const tool of tools ?? []) {
    const trimmed = tool.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }
  return result
}

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
        kind: true,
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
        kind: original.kind,
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
