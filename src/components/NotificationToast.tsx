import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getNotifications } from '#/server/notifications'
import { authClient } from '#/lib/auth-client'

export function NotificationToast() {
  const { data: session } = authClient.useSession()
  const prevUnread = useRef<number | null>(null)

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
    refetchInterval: 30_000,
    enabled: Boolean(session?.user),
  })

  const unreadCount = data?.unreadCount ?? 0

  useEffect(() => {
    if (prevUnread.current === null) {
      prevUnread.current = unreadCount
      return
    }

    if (unreadCount > prevUnread.current) {
      const latest = data?.notifications.find((n) => !n.read)
      const message = latest
        ? `${latest.actor?.name ?? 'Someone'} ${notificationVerb(latest.type)}`
        : 'You have new notifications'

      showToast(message)
    }

    prevUnread.current = unreadCount
  }, [unreadCount, data?.notifications])

  return null
}

function notificationVerb(type: string) {
  switch (type) {
    case 'LIKE':
      return 'liked your workflow'
    case 'COMMENT':
      return 'commented on your workflow'
    case 'FOLLOW':
      return 'started following you'
    case 'FORK':
      return 'forked your workflow'
    default:
      return 'sent you a notification'
  }
}

function showToast(message: string) {
  const el = document.createElement('div')
  el.className = 'notification-toast'
  el.setAttribute('role', 'status')
  el.textContent = message
  document.body.appendChild(el)

  requestAnimationFrame(() => {
    el.classList.add('is-visible')
  })

  const remove = () => {
    el.classList.remove('is-visible')
    window.setTimeout(() => el.remove(), 300)
  }

  window.setTimeout(remove, 4500)
}
