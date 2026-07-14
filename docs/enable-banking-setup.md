# Direct Enable Banking setup

Wollie uses Enable Banking directly for read-only European account information. It does not use Open Banking IO and does not implement payment initiation.

## Development sandbox

1. Sign in at <https://enablebanking.com/cp>.
2. Create a **Sandbox** API application.
3. Add `http://localhost:3000/app/accounts` as an exact redirect URL.
4. Let the control panel generate and download the private key.
5. Put the application ID and PKCS#8 private key in `.env.local`:

   ```dotenv
   ENABLE_LIVE_BANK_SYNC=true
   BANK_SYNC_ENCRYPTION_KEY=<at-least-32-random-characters>
   ENABLE_BANKING_ENVIRONMENT=sandbox
   ENABLE_BANKING_APPLICATION_ID=<application-id>
   ENABLE_BANKING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   ENABLE_BANKING_REDIRECT_URL=http://localhost:3000/app/accounts
   ```

6. Apply migrations with `pnpm db:migrate` and start Wollie with `pnpm dev`.
7. Sign in, open **Sync**, choose a sandbox bank, and approve the simulated consent.

## Testing your own real accounts

Create a separate **Production** application and activate restricted mode by linking every account you own that you want to test. Set `ENABLE_BANKING_ENVIRONMENT=production` and use that application's ID, private key, and exact callback URL.

Restricted mode is for personal or evaluation use and returns only whitelisted accounts. It cannot be opened to Wollie users. Public production access requires an Enable Banking contract and completed company KYB.

## Coverage boundary

ING Belgium and Wise are documented in Enable Banking's Belgian market coverage. The app loads the current institution list from `GET /aspsps`, so Revolut is offered only when the provider returns it for the selected country. Bank Hapoalim is not covered because Enable Banking does not list Israel as a supported market.
