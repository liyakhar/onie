import { createServerFn } from '@tanstack/react-start'
import { isTransactionalEmailConfigured } from '#/server/email.server'

export const getTransactionalEmailReadiness = createServerFn({ method: 'GET' }).handler(
  async () => ({ configured: isTransactionalEmailConfigured() }),
)
