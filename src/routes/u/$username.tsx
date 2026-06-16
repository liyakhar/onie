import { createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { getProfile, toggleFollow } from '#/server/profiles'
import { pinPost } from '#/server/posts'
import { categoryLabel } from '#/lib/categories'
import { PostCard } from '#/components/PostCard'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/u/$username')({
  loader: async ({ params }) => {
    const profile = await getProfile({ data: { username: params.username } })
    if (!profile) {
      throw notFound()
    }
    return profile
  },
  component: ProfilePage,
})

function ProfilePage() {
  const router = useRouter()
  const profile = Route.useLoaderData()
  const { user, isFollowing, isOwner } = profile

  const handleFollow = async () => {
    try {
      await toggleFollow({ data: { username: profile.username } })
      void router.invalidate()
    } catch (err) {
      console.error(err)
    }
  }

  const handlePin = async (postId: string | null) => {
    try {
      await pinPost({ data: { postId } })
      void router.invalidate()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <section className="mb-8 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border border-[var(--line)]">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-lg">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold text-[var(--ink)]">{user.name}</h1>
              <p className="font-mono text-sm text-[var(--ink-muted)]">@{profile.username}</p>
              {profile.headline && (
                <p className="mt-2 text-[var(--ink-soft)]">{profile.headline}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{categoryLabel(profile.field)}</Badge>
                <span className="text-sm text-[var(--ink-muted)]">
                  {user._count.posts} workflows · {user._count.followers} followers ·{' '}
                  {user._count.following} following
                </span>
              </div>
              {profile.bio && (
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner ? null : (
              <Button
                onClick={handleFollow}
                variant={isFollowing ? 'outline' : 'default'}
                className={
                  isFollowing
                    ? 'border-[var(--line)]'
                    : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
                }
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
      </section>

      {user.pinnedPost && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
            Pinned workflow
          </h2>
          <PostCard post={user.pinnedPost} pinned />
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-[var(--ink-muted)]"
              onClick={() => handlePin(null)}
            >
              Unpin
            </Button>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
          Workflows
        </h2>
        <div className="grid gap-4">
          {user.posts.length === 0 ? (
            <p className="text-[var(--ink-soft)]">No workflows published yet.</p>
          ) : (
            user.posts.map((post) => (
              <div key={post.id} className="space-y-2">
                <PostCard post={post} />
                {isOwner && user.pinnedPostId !== post.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[var(--ink-muted)]"
                    onClick={() => handlePin(post.id)}
                  >
                    Pin to profile
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
