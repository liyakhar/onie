import { Link, useRouter } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export default function BetterAuthHeader() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    void router.navigate({ to: '/login' })
  }

  if (isPending) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--code-bg)]" />
  }

  if (session?.user) {
    return (
      <>
        <button
          type="button"
          className="app-nav__sign-out"
          onClick={() => void handleSignOut()}
        >
          <LogOut aria-hidden="true" />
          <span>Sign out</span>
        </button>

        <div className="app-nav__profile-menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-grid min-h-11 min-w-11 place-items-center rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label="Open profile and settings"
              >
                <Avatar className="h-8 w-8 border border-[var(--line)]">
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback className="bg-[var(--code-bg)] text-xs font-medium">
                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-[var(--line)] bg-[var(--surface-strong)]"
            >
              <DropdownMenuItem asChild>
                <Link to="/settings">Profile &amp; settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void handleSignOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/login">Sign in</Link>
      </Button>
      <Button variant="brand" size="sm" asChild>
        <Link to="/login" search={loginSearch({ signup: true })}>
          Join
        </Link>
      </Button>
    </div>
  )
}
