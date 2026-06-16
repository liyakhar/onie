import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/server/db-access.server'
import { getSessionUser } from '#/server/session.server'

export const getNotifications = createServerFn({ method: 'GET' }).handler(
  async () => {
    const prisma = await getDb()
    const user = await getSessionUser()
    if (!user) return { notifications: [], unreadCount: 0 }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    const actorIds = [...new Set(notifications.map((n) => n.actorId))]
    const postIds = [
      ...new Set(notifications.map((n) => n.postId).filter(Boolean) as string[]),
    ]

    const [actors, posts] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: {
          id: true,
          name: true,
          image: true,
          profile: { select: { username: true } },
        },
      }),
      postIds.length > 0
        ? prisma.post.findMany({
            where: { id: { in: postIds } },
            select: { id: true, title: true },
          })
        : Promise.resolve([]),
    ])

    const actorMap = Object.fromEntries(actors.map((a) => [a.id, a]))
    const postMap = Object.fromEntries(posts.map((p) => [p.id, p]))

    const enriched = notifications.map((n) => ({
      ...n,
      actor: actorMap[n.actorId] ?? null,
      post: n.postId ? (postMap[n.postId] ?? null) : null,
    }))

    const unreadCount = notifications.filter((n) => !n.read).length

    return { notifications: enriched, unreadCount }
  },
)

export const markAllRead = createServerFn({ method: 'POST' }).handler(async () => {
  const prisma = await getDb()
  const user = await getSessionUser()
  if (!user) return

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  })
})
