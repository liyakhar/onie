import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        termsAcceptedAt: { type: 'date', required: true, returned: false },
        termsVersion: { type: 'string', required: true, returned: false },
        privacyVersion: { type: 'string', required: true, returned: false },
      },
    }),
  ],
})
