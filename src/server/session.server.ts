export async function getSessionUser() {
  const [{ auth }, { getRequestHeaders }] = await Promise.all([
    import('#/lib/auth.server'),
    import('@tanstack/react-start/server'),
  ])

  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  })

  return session?.user ?? null
}
