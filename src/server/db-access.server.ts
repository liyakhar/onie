export async function getDb() {
  const { prisma } = await import('#/db.server')
  return prisma
}
