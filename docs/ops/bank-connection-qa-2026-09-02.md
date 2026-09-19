# Bank connections: QA and coverage

**Checked:** September 2, 2026  
**Scope:** current local Wollie branch and `https://wollie.pages.dev`

## The answer in one minute

| Question | Actual answer |
| --- | --- |
| What powers the current landing-page bank finder? | Enable Banking's institution directory, through `getPublicEnableBankingInstitutions`. |
| Is it using Synci, the paid provider? | No. The landing finder does not call Synci at all. |
| Can a public Wollie customer connect a real bank through Synci today? | No. The Synci feature is built and tested, but it is disabled because no Synci Managed subscription is active and the public-access setting is off. |
| What is usable today? | Enable Banking remains for restricted private testing. It must not be presented as public bank coverage. |
| Is the public site current? | No. `wollie.pages.dev` is serving an older landing page than this branch, so it needs a deployment before it represents the current product. |

## What the current finder really does

The landing page calls the Enable Banking provider directory whenever its country changes. It is a lookup only: it does not connect an account and it does not use the Synci portal.

The current local Belgium lookup returned only **BBVA**. Searching the same finder for **Wise**, **Revolut**, and **KBC** returned no match. That is expected from a restricted sandbox directory, but it makes the label “Find your bank” misleading for a public landing page.

The Accounts page is clearer: it displays **“Sandbox data”** and identifies the sample account as **Mock ASPSP**. That connection is not Liya's Wise account or a real customer bank connection.

## QA results

| Check | Result | Evidence |
| --- | --- | --- |
| Landing page renders a country selector and bank search | Pass | Local page loaded and controls are keyboard-accessible. |
| Local Belgium finder returns its provider result | Pass, test-only | Empty search returned BBVA. |
| Local Belgium finder finds Wise | Fail for current provider | “No matching bank found for this country.” |
| Local Belgium finder finds Revolut | Fail for current provider | “No matching bank found for this country.” |
| Local Belgium finder finds KBC | Fail for current provider | “No matching bank found for this country.” |
| Accounts page labels sandbox data | Pass | It explicitly says the balances and transactions are sample data. |
| Synci activation guard | Pass | 10 automated provider tests pass. Synci requires live sync, explicit public access, and Managed-app credentials. |
| Real Synci connection | Not runnable yet | Local configuration has no Synci Managed client ID, secret, or public-access flag. No live Synci subscription is active. |
| Production landing version | Fail | `wollie.pages.dev` serves an older page and does not match this branch's current landing design. |

No real bank login was started during QA, so no bank connection or consent was created.

## What will be supported once Wollie turns on Synci

Synci's official Belgian directory currently lists **49 institutions**. For Wollie's likely first market, the important consumer options are:

| Group | Institutions listed by Synci for Belgium |
| --- | --- |
| Main Belgian banks | Argenta, Belfius, BNP Paribas Fortis, CBC Banque, Crelan, ING, KBC, KBC Brussels, Keytrade Bank, Nagelmackers, VDK Bank |
| Digital and international banks | Aion Bank, bunq, N26, Revolut, Wise, Lunar, Monese, Vivid Money |
| Other Belgian institutions | ABN AMRO Bank Commercial, Bank J. Van Breda, Beobank, Deutsche Bank, Europa Bank, Fintro, Hello bank!, Triodos Bank |
| Business and payment providers | Airwallex, Ebury, Finom, Qonto, Soldo, Stripe, Sumitomo Mitsui Banking Corporation |
| Wallets and other financial services | Neteller, Nickel, PayPal, Paysera, Skrill, Swan |

### The two accounts you asked about

| Account | In Synci's Belgian directory | Connectable in Wollie today | Result after Synci is enabled |
| --- | --- | --- | --- |
| Liya's Wise account | Yes | No | Expected to be available through Synci's secure portal. |
| Alex's Revolut account | Yes | No | Expected to be available through Synci's secure portal. |

“Expected” is deliberate. A directory listing means the institution is offered, but the exact account type, available history, pending-card support, and consent period can differ by bank. The final source of truth should always be the live Synci portal shown during connection.

### Full Belgian list from Synci on the check date

ABN AMRO Bank Commercial, Aion Bank, Airwallex, Argenta, Bank J. Van Breda & Co, Banque CPH, Banque Transatlantique, Banque Triodos, Banx, BBVA, Belfius, Beobank, BNP Paribas Fortis, BNP Paribas Fortis Business, bunq, CBC Banque, Crelan, Deutsche Bank, Ebury, Europa Bank, Finom, Fintro, Fintro Business, Hello bank!, HSBCnet, ING, ING Wholesale Banking, KBC, KBC Brussels, Keytrade Bank, Lunar, Monese, N26 Bank, Nagelmackers, Neteller, Nickel Beta, PayPal, Paysera, Qonto, Revolut, Skrill, Soldo, Stripe, Sumitomo Mitsui Banking Corporation, Swan, Triodos Bank, VDK Bank, Vivid Money, and Wise.

## Banks not supported today

There are two different meanings of “not supported,” and the product needs to keep them separate.

1. **Not connectable in Wollie today:** every real public bank. Synci is disabled and Enable Banking is restricted to private testing.
2. **Not listed by Synci:** an institution that does not appear in Synci's live directory for the selected country. This must be checked live, rather than kept as a hard-coded list that goes stale.

Synci currently advertises bank coverage in 31 European and UK countries: Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Ireland, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden, and the United Kingdom. Countries outside that rollout should be described in Wollie as **“not available yet”**, not permanently unsupported.

## How the paid Synci flow will work

1. A signed-in Wollie user presses **Connect a bank**.
2. Wollie creates or reuses that person's Managed user in Synci, on the server only.
3. Wollie opens Synci's one-time hosted bank portal. The user sees only banks allowed by Wollie's country and provider settings.
4. The user signs in with their bank. Wollie never receives their bank password.
5. Synci returns the user to Wollie, and Wollie imports read-only balances and transactions.

Wollie pays Synci per active bank connection from its own subscription. A household with two people and two banks normally uses two connection slots.

## Before public launch

1. Buy the Synci connection quantity required for the beta and create the Managed app.
2. Add the Managed client ID, secret, portal return URL, allowed countries, and connection limit to Railway. Turn on `SYNCI_PUBLIC_ACCESS_ENABLED` only after the first two are complete.
3. Replace the current public Enable Banking finder with a Synci-labelled availability link or a Synci-backed directory. Do not make a sandbox list look like public coverage.
4. Test Wise and Revolut end to end with two explicit tester accounts, then record the outcomes here.

## Sources

- [Synci Managed Apps documentation](https://docs.synci.io/managed)
- [Synci Belgium bank directory](https://synci.io/banks/belgium)
- [Synci supported institutions and countries](https://help.synci.io/en/help/articles/1019329-supported-institutions)
