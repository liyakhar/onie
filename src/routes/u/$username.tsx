import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router'
import { getProfile, toggleFollow } from '#/server/profiles'
import { pinPost } from '#/server/posts'
import { categoryLabel } from '#/lib/categories'
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

  const handlePin = async (postId: string | null) => {
    try {
      await pinPost({ data: { postId } })
      void router.invalidate()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">{categoryLabel(profile.field)}</p>
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
              <span className="profile-card__field">{categoryLabel(profile.field)}</span>
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
              <Link to="/settings" className="btn btn--compact">
                <span className="btn__label">Edit profile</span>
              </Link>
              <Link to="/new" className="feed-tab">
                New workflow
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

      {user.pinnedPost && (
        <section className="app-section" aria-labelledby="pinned-h">
          <h2 className="app-section__title" id="pinned-h">
            Pinned workflow
          </h2>
          <ol className="ledger" aria-label="Pinned workflow">
            <PostCard
              post={user.pinnedPost}
              pinned
              variant="ledger"
              actions={
                isOwner ? (
                  <button type="button" className="feed-tab" onClick={() => handlePin(null)}>
                    Unpin
                  </button>
                ) : undefined
              }
            />
          </ol>
        </section>
      )}

      <section className="app-section" aria-labelledby="workflows-h">
        <h2 className="app-section__title" id="workflows-h">
          Workflows
        </h2>
        {user.posts.length === 0 ? (
          <p className="feed-empty">No workflows published yet.</p>
        ) : (
          <ol className="ledger" aria-label="Published workflows">
            {user.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                variant="ledger"
                actions={
                  isOwner ? (
                    <>
                      {user.pinnedPostId !== post.id && (
                        <button
                          type="button"
                          className="feed-tab"
                          onClick={() => handlePin(post.id)}
                        >
                          Pin to profile
                        </button>
                      )}
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
