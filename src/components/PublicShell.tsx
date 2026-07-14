import { Link, Outlet } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { OnieMark } from '#/components/OnieMark'

export function PublicShell() {
  const { data: session } = authClient.useSession()

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Wollie home" className="text-black no-underline">
            <OnieMark variant="nav" />
          </Link>

          <nav className="flex items-center gap-3" aria-label="Main navigation">
            {session?.user ? (
              <Link
                to="/app"
                className="inline-flex h-11 items-center bg-black px-4 text-xs font-medium text-white no-underline hover:bg-black/85"
              >
                Open app
              </Link>
            ) : (
              <Link
                to="/login"
                search={loginSearch({ signup: false })}
                className="inline-flex h-11 items-center border border-black/10 px-4 text-xs font-medium text-black no-underline hover:bg-black/[0.03]"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
