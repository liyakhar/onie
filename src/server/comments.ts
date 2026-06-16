import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/server/db-access.server'
import { getSessionUser } from '#/server/session.server'
import { emitNotification } from '#/server/notifications.server'

const commentInclude = {
  author: {
    select: {
      id: true,
      name: true,
      image: true,
      profile: { select: { username: true } },
    },
  },
} as const

export const getComments = createServerFn({ method: 'GET' })
  .inputValidator((data: { postId: string }) => data)
  .handler(async ({ data }) => {
    const prisma = await getDb()
    return prisma.comment.findMany({
      where: { postId: data.postId },
      orderBy: { createdAt: 'asc' },
      include: commentInclude,
    })
  })

export const createComment = createServerFn({ method: 'POST' })
  .inputValidator((data: { postId: string; content: string }) => data)
  .handler(async ({ data }) => {
    const prisma = await getDb()
    const user = await getSessionUser()
    if (!user) {
      throw new Error('Sign in to comment')
    }

    const content = data.content.trim()
    if (!content) {
      throw new Error('Comment cannot be empty')
    }

    const comment = await prisma.comment.create({
      data: {
        postId: data.postId,
        authorId: user.id,
        content,
      },
      include: commentInclude,
    })

    const post = await prisma.post.findUnique({
      where: { id: data.postId },
      select: { authorId: true },
    })
    if (post) {
      void emitNotification({
        userId: post.authorId,
        actorId: user.id,
        type: 'COMMENT',
        postId: data.postId,
      })
    }

    return comment
  })
