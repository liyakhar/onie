import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router'
import { getProfile, toggleFollow } from '#/server/profiles'
import { PostCard } from '#/components/PostCard'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  breadcrumbJsonLd,
  buildPageMeta,
  jsonLdScript,
  pageDescription,
  personJsonLd,
} from '#/lib/seo'

export const Route = createFileRoute('/u/$username')({
  loader: async ({ params }) => {
    const profile = await getProfile({ data: { username: params.username } })
    if (!profile) {
      throw notFound()
    }
    return profile
  },
  head: ({ loaderData, params }) => {
    const profile = loaderData
    if (!profile) return {}

    const description = pageDescription(
      profile.bio ??
        profile.headline ??
        `${profile.user.name} shares agent workflows on Onie.`,
    )

    const pageMeta = buildPageMeta({
      path: `/u/${params.username}`,
      title: `${profile.user.name} (@${profile.username})`,
      description,
      ogType: 'profile',
    })

    const breadcrumbs = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Explore', path: '/app/explore' },
      { name: profile.user.name, path: `/u/${params.username}` },
    ])

    const person = personJsonLd({
      name: profile.user.name,
      username: profile.username,
      description: profile.bio ?? profile.headline ?? undefined,
      image: profile.user.image,
    })

    return {
      meta: pageMeta.meta,
      links: pageMeta.links,
      scripts: [jsonLdScript([person, breadcrumbs])],
    }
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

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <h1 className="app-page__title">{user.name}</h1>
        {profile.headline && <p className="app-page__lede">{profile.headline}</p>}
      </header>

      <section className="profile-card" aria-label="Profile">
        <div className="profile-card__main">
          <Avatar className="h-16 w-16 border border-[var(--line)]">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-lg">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="profile-card__handle">@{profile.username}</p>
            <div className="profile-card__meta">
              <span>
                {user._count.posts} workflows · {user._count.followers} followers ·{' '}
                {user._count.following} following
              </span>
            </div>
            {profile.bio && <p className="profile-card__bio">{profile.bio}</p>}
          </div>
        </div>
        <div className="profile-card__actions">
          {isOwner ? (
            <>
              <Link to="/new" className="btn btn--compact">
                <span className="btn__label">Share a post</span>
              </Link>
              <Link to="/settings" className="feed-tab">
                Edit profile
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFollow}
              className={isFollowing ? 'feed-tab' : 'btn btn--compact'}
            >
              {isFollowing ? (
                'Following'
              ) : (
                <span className="btn__label">Follow</span>
              )}
            </button>
          )}
        </div>
      </section>

      <section className="app-section" aria-label={`${user.name}'s posts`}>
        {user.posts.length === 0 ? (
          <p className="feed-empty">No posts published yet.</p>
        ) : (
          <ol className="ledger" aria-label={`Posts by ${user.name}`}>
            {user.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                variant="ledger"
                showAuthor={false}
                actions={
                  isOwner ? (
                    <>
                      <Link
                        to="/p/$postId/edit"
                        params={{ postId: post.id }}
                        className="feed-tab"
                      >
                        Edit
                      </Link>
                    </>
                  ) : undefined
                }
              />
            ))}
          </ol>
        )}
      </section>
    </main>
  )
}
