import type { NotificationType } from '#/generated/prisma/client'

export async function emitNotification(opts: {
  userId: string
  actorId: string
  type: NotificationType
  postId?: string
}) {
  if (opts.userId === opts.actorId) return

  const { prisma } = await import('#/db.server')

  if (opts.type === 'LIKE' || opts.type === 'FORK') {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: opts.userId,
        actorId: opts.actorId,
        type: opts.type,
        postId: opts.postId ?? null,
        createdAt: { gte: new Date(Date.now() - 86_400_000) },
      },
    })
    if (existing) return
  }

  await prisma.notification.create({
    data: {
      userId: opts.userId,
      actorId: opts.actorId,
      type: opts.type,
      postId: opts.postId ?? null,
    },
  })
}
