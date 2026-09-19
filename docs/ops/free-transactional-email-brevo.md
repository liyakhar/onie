# Free Wollie transactional email setup with Brevo

Use this when Resend's free one-domain limit is already used by another project.

## Goal

Send Wollie account emails without paying for Resend Pro:

- password reset
- household invitations
- account deletion confirmation
- security/account notices

## Recommended sender

Use:

```txt
Wollie <account@wollie.app>
```

`hello@wollie.app` can stay as the human support/contact address.

## Brevo setup

1. Create or open a Brevo account.
2. Add and authenticate `wollie.app` or a sending subdomain such as `mail.wollie.app`.
3. Add the DNS records Brevo gives you in TransIP.
4. Create a Brevo SMTP/API key for production transactional email.
5. In Cloudflare Pages production secrets, set:

```txt
BREVO_API_KEY=<Brevo API key>
EMAIL_FROM=Wollie <account@wollie.app>
```

`RESEND_API_KEY` can stay unset for Wollie.

## Validation

After DNS is verified and secrets are set:

1. Open `/login`.
2. Use "Forgot password?"
3. Send a reset email to a real inbox.
4. Confirm the email arrives from `account@wollie.app`.

## Notes

Brevo's free plan currently includes transactional email and 300 daily email sends, which is enough for early Wollie launch/account emails. Upgrade only if volume grows or deliverability/support needs change.
