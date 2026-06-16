import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Bell, Heart, MessageCircle, UserPlus, GitFork } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markAllRead } from '#/server/notifications'
import { authClient } from '#/lib/auth-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type NotifType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'FORK'

const ICONS: Record<NotifType, React.ReactNode> = {
  LIKE: <Heart className="h-3.5 w-3.5 text-rose-500" />,
  COMMENT: <MessageCircle className="h-3.5 w-3.5 text-sky-500" />,
  FOLLOW: <UserPlus className="h-3.5 w-3.5 text-emerald-500" />,
  FORK: <GitFork className="h-3.5 w-3.5 text-violet-500" />,
}

const LABELS: Record<NotifType, string> = {
  LIKE: 'liked your workflow',
  COMMENT: 'commented on your workflow',
  FOLLOW: 'started following you',
  FORK: 'forked your workflow',
}

export function NotificationBell() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data: session } = authClient.useSession()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
    refetchInterval: 30_000,
    enabled: Boolean(session?.user),
  })

  const { notifications = [], unreadCount = 0 } = data ?? {}

  const handleOpen = async (next: boolean) => {
    setOpen(next)
    if (next && unreadCount > 0) {
      await markAllRead()
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0 text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 border-[var(--line)] bg-[var(--surface-strong)] p-0 shadow-lg"
      >
        <div className="border-b border-[var(--line)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--ink)]">Notifications</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--ink-muted)]">
              Nothing yet — share or follow someone to get started.
            </p>
          ) : (
            notifications.map((n) => {
              const actorName = n.actor?.name ?? 'Someone'
              const actorUsername = n.actor?.profile?.username
              const label = LABELS[n.type as NotifType]
              const icon = ICONS[n.type as NotifType]
              const date = new Date(n.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })

              const inner = (
                <div
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 transition hover:bg-[var(--code-bg)]',
                    !n.read && 'bg-[var(--accent)]/5',
                  )}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)]">
                    {icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-[var(--ink)]">
                      <span className="font-semibold">{actorName}</span>{' '}
                      {label}
                      {n.post && (
                        <span className="text-[var(--ink-soft)]">
                          {' '}
                          <span className="font-medium text-[var(--ink)]">
                            &ldquo;{n.post.title}&rdquo;
                          </span>
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{date}</p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                  )}
                </div>
              )

              if (n.post?.id) {
                return (
                  <Link
                    key={n.id}
                    to="/p/$postId"
                    params={{ postId: n.post.id }}
                    className="block no-underline"
                    onClick={() => setOpen(false)}
                  >
                    {inner}
                  </Link>
                )
              }

              if (actorUsername) {
                return (
                  <Link
                    key={n.id}
                    to="/u/$username"
                    params={{ username: actorUsername }}
                    className="block no-underline"
                    onClick={() => setOpen(false)}
                  >
                    {inner}
                  </Link>
                )
              }

              return <div key={n.id}>{inner}</div>
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
