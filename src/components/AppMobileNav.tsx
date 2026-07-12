import { Link } from '@tanstack/react-router'
import { Compass, Home, Plus, User } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { useQuery } from '@tanstack/react-query'
import { getMyProfile } from '#/server/profiles'
import { appNavActiveOptions } from '#/lib/nav-active'

export function AppMobileNav() {
  const { data: session } = authClient.useSession()
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => getMyProfile(),
    enabled: Boolean(session?.user),
  })

  const profileTo = profile?.username
    ? { to: '/u/$username' as const, params: { username: profile.username } }
    : session?.user
      ? { to: '/welcome' as const }
      : { to: '/login' as const, search: loginSearch({ redirect: '/app', signup: true }) }

  const shareTo = session?.user
    ? { to: '/new' as const }
    : { to: '/login' as const, search: loginSearch({ redirect: '/new', signup: true }) }

  return (
    <nav className="app-mobile-nav" aria-label="Mobile navigation">
      <Link
        to="/app"
        className="app-mobile-nav__item"
        activeOptions={appNavActiveOptions}
        activeProps={{ className: 'app-mobile-nav__item is-active' }}
      >
        <Home className="h-5 w-5" aria-hidden="true" />
        <span>Feed</span>
      </Link>
      <Link
        to="/app/explore"
        className="app-mobile-nav__item"
        activeOptions={appNavActiveOptions}
        activeProps={{ className: 'app-mobile-nav__item is-active' }}
      >
        <Compass className="h-5 w-5" aria-hidden="true" />
        <span>Explore</span>
      </Link>
      <Link
        {...shareTo}
        className="app-mobile-nav__item"
        activeProps={{ className: 'app-mobile-nav__item is-active' }}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        <span>Share</span>
      </Link>
      <Link
        {...profileTo}
        className="app-mobile-nav__item"
        activeProps={{ className: 'app-mobile-nav__item is-active' }}
      >
        <User className="h-5 w-5" aria-hidden="true" />
        <span>Profile</span>
      </Link>
    </nav>
  )
}
