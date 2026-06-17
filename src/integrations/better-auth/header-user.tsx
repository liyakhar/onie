import { Link } from '@tanstack/react-router'
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
import { getMyProfile } from '#/server/profiles'
import { useQuery } from '@tanstack/react-query'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()
  const { data: profile, isPending: isProfilePending } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfile(),
    enabled: Boolean(session?.user),
  })

  if (isPending || (session?.user && isProfilePending)) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--code-bg)]" />
  }

  if (session?.user) {
    const username = profile?.username

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label="Account menu"
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
          {username ? (
            <DropdownMenuItem asChild>
              <Link to="/u/$username" params={{ username }}>
                My profile
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/welcome" search={{ redirect: '/app/explore' }}>
                Set up profile
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              void authClient.signOut()
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
