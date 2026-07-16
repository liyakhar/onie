# Wollie founder and entity decision

Status: fact-finding draft dated 2026-07-15. Do not form or pay for an entity until the founder-residence questions in section 6 are answered.

## 1. Facts currently known

- Founder has Russian and Israeli citizenship and is currently living in Wallonia, Belgium.
- Founder's partner is Belgian. The founders are considering operating as two genuine cofounders, but the intended ownership split and whether they are married are not yet established.
- The founders may travel to Georgia, but no genuine change of tax residence has yet been established.
- Wollie is an EU-facing consumer SaaS that processes bank transaction data and needs Stripe plus an unrestricted Enable Banking contract.
- The same founders may also operate client services for American customers and another early-stage product with very small profit.
- The other product is FluentAI and has a third cofounder intended to hold 20% of FluentAI only, not 20% of Wollie, client services, or the umbrella business.

Citizenship does not by itself choose the tax system. Actual personal domicile, household, work location, company management, and business substance are the controlling facts.

## 2. Provisional recommendation

While the founder lives and works in Belgium and Wollie is managed from Belgium, use a Belgian structure. A foreign shell does not remove Belgian personal tax and can give a foreign company a Belgian permanent establishment or Belgian seat of management.

Choose between:

1. **Belgian sole proprietorship** for the lowest-cost one-owner validation phase. Registration with the CBE is EUR 111.50 at the beginning of 2026. VAT activation can be completed directly without a service fee. It has simpler accounting, but cannot represent two owners and exposes the proprietor's assets to business liabilities.
2. **Belgian SRL/BV** if both people are genuine cofounders/shareholders, outside funding is expected, or liability separation is required before exposing public users' financial data. It requires a notarial deed and financial plan, full accounting, annual accounts, UBO registration, and materially higher annual accounting costs.

Do not use a partner as a nominee. Ownership, management, beneficial ownership, and who created/transferred the software IP must match reality.

### Recommended umbrella structure for the three activities

If the client work, Wollie, and the other startup have the same two real owners and ownership split, the current cost-efficient default is **one Belgian SRL/BV**, not three entities:

- use a neutral legal company name and operate Wollie and the other startup as separate commercial/brand names;
- register the NACE-BEL codes for each activity actually carried out; Belgium permits multiple codes, including up to five primary activities per establishment unit and unlimited genuine secondary activities;
- use one enterprise/VAT number, company bank account, accountant, annual accounts, UBO filing, Stripe operator, and Enable Banking contracting entity;
- maintain a separate bookkeeping cost centre, revenue category, contract folder, invoice reference, and management profit-and-loss view for each activity;
- record the IP contributed by each founder and assign or license it to the company in writing;
- make every website, proposal, invoice, privacy notice, and contract identify the same legal company, with wording such as "[legal entity], trading as Wollie" where appropriate.

This structure normally minimizes formation and recurring administration. Genuine costs of developing the products and earning client revenue are accounted for in the same company, so company taxable profit is based on the company's combined income and deductible business expenses. This is not a tax exemption, and compensation paid to founders has separate tax and social-contribution treatment.

One entity also means shared risk: a Wollie privacy/security claim or a client-contract claim can affect all assets inside the company. Use appropriate professional/cyber insurance and clean contracts, and consider spinning Wollie into a separate subsidiary or company later if it raises investment, gains material bank-data exposure, is sold, or develops a different ownership split.

Form separate entities now only if one of these is already true:

- the ownership or profit split differs between the three activities;
- the other startup has another founder, investor, grant restriction, or pre-existing company/IP;
- an investor, enterprise client, bank-data provider, or regulated partner requires ring-fencing;
- one activity is expected to be sold or funded soon; or
- the founders deliberately accept the extra accounting cost to isolate substantial liability.

### FluentAI's project-only 20% cofounder

Ordinary shares are shares in a legal company, not in a brand or internal project. If the FluentAI cofounder receives 20% ordinary shares in the umbrella SRL/BV, those shares normally participate in the umbrella company rather than only FluentAI.

Available structures, from cheapest to cleanest:

1. **Contractual project participation while FluentAI is small:** the umbrella company owns/operates FluentAI, while a lawyer-drafted agreement gives the third cofounder a defined 20% economic entitlement from FluentAI and addresses IP, costs, revenue, sale proceeds, information, vesting, departures, and conversion into shares if FluentAI is later spun out. This is not the same as holding actual company shares.
2. **Special class or tracking-style shares in the umbrella SRL/BV:** Belgian SRLs can give share classes different voting and dividend rights. A notary may be able to draft rights linked economically to FluentAI, but the cofounder still becomes a shareholder of the umbrella legal entity; statutory information/governance rights and company-wide distribution tests remain relevant. This is more complex and requires bespoke notarial/tax advice.
3. **Separate FluentAI company/subsidiary:** the two main founders or umbrella company hold 80% and the FluentAI cofounder holds 20%. This is the cleanest true-equity structure and isolates ownership/IP, but creates another formation, bank account, annual accounts, tax return, UBO filing, and accounting bill.

Current recommendation: do not give the FluentAI cofounder ordinary umbrella-company shares. If FluentAI remains very small and all three founders agree, use a professionally drafted project-participation and IP agreement now, with a mandatory spin-out/conversion mechanism before investment, sale, or material revenue. If the existing promise specifically guarantees actual shares now, form a separate FluentAI entity rather than silently replacing shares with a profit right.

Before selecting an option, collect the existing FluentAI founder agreement, messages promising 20%, code/IP contribution history, revenue, contracts, and any prior share issuance. A Belgian lawyer/notary must confirm that the final instrument matches what was already promised.

## 3. Options compared

| Option | Formation and recurring administration | Tax and residence reality | Payments/KYB | Current assessment |
| --- | --- | --- | --- | --- |
| Belgian sole proprietorship | CBE registration EUR 111.50; professional account; VAT/social-insurance setup; simplified accounts may be possible | Profit belongs to the proprietor and is taxed personally in Belgium; social contributions apply | Strong fit for Belgian Stripe and an EEA bank-data-provider review | Cheapest compliant validation route if there is one real owner and the proprietor may legally be self-employed |
| Belgian SRL/BV | Notary and financial plan; standard notary base fees start at EUR 217 plus EUR 298 administrative costs, VAT, publication, registration and other disbursements; full accounts | Belgian company tax generally 25%, with distributions/remuneration taxed under their own rules | Strong EEA company identity and supports two disclosed founders | Best durable route for two founders/public financial-data operations, but not the cheapest pre-revenue route |
| Estonian OÜ | E-Residency EUR 150, company registration EUR 265, contact person roughly EUR 200-400/year, accounting from roughly EUR 50/month | Estonia itself warns that management abroad can create foreign permanent establishment or dual residence; dividends are taxed at company level when distributed and still declared where founders reside | EU/Stripe capable, but no tax shortcut while managed from Belgium | Not recommended. First-time e-Residency applications from Russian citizens are currently not reviewed, and Belgian management would remain a tax problem |
| Georgian individual entrepreneur with small-business status | Registration fee GEL 26 standard; monthly records/returns; individual rather than jointly owned company | 1% applies to qualifying Georgian-source small-business income, rising to 3% after the statutory threshold; it is not a worldwide 1% promise while the person lives/works in Belgium | Georgia is not currently listed as a directly supported Stripe country; non-EEA position complicates bank-provider KYB | Consider only after a genuine relocation, end of Belgian residence, Georgian work/substance, and written confirmation of source treatment and payment access |
| Georgian LLC/Virtual Zone | Low registration fee but requires company, status, local administration and defensible IT activity/substance | Georgian law exempts qualifying profit from software developed by a Virtual Zone legal person and supplied outside Georgia; Belgium can still tax a company managed from Belgium | Stripe/EEA bank-provider access is weaker and needs confirmation before formation | Possible only as a later relocation structure, not a current Belgian-resident shortcut |

Published accounting prices are market estimates, not statutory fees. Current Belgian market guides place basic sole-proprietor accounting around EUR 1,000-2,500/year and small SRL/BV accounting around EUR 2,000-5,500/year, depending on VAT, payroll, transaction volume and cross-border work.

## 4. Immigration and right-to-work gate

The founder is a non-EEA national. Wallonia generally requires a professional card for self-employed work unless a residence-status exemption applies. Its rule expressly includes a sole proprietor, a company representative (paid or unpaid), and an active partner (paid or unpaid). Listed exemptions include a valid unlimited-duration foreigner identity card/CIRE and being the spouse of a Belgian. The published Walloon exemption list does not say that an unmarried romantic partnership alone is enough.

Do not register the founder as self-employed, working director, unpaid representative, or active partner until the exact Belgian residence card and Walloon exemption are checked. A passive shareholding is a different question, but it must not be used to disguise actual work or management.

## 5. Why Estonia and Georgia do not currently reduce tax safely

- Belgian residents declare worldwide income in Belgium.
- A foreign company whose principal establishment, management, or administration is in Belgium may be taxable in Belgium.
- Estonia expressly says e-Residency is not tax residence and a company managed abroad will probably have a permanent establishment abroad.
- Georgia's 1% small-business rate applies to an entrepreneur natural person and Georgian-source qualifying income. It does not automatically apply to work actually carried out from Belgium.
- A short trip to Georgia does not by itself end Belgian domicile. Belgium determines domicile and the centre of economic interests from the facts, and temporary absence does not necessarily change it.

## 6. Founder inputs required before forming anything

- [x] Belgian region of residence: Wallonia
- [ ] Is the founder registered in Belgium's National Register? If yes, since what date?
- [ ] Exact Belgian residence-card type/letter, expiry date, and whether it permits or exempts self-employment
- [ ] Are the founders married, legally cohabiting, or unmarried partners?
- [ ] Confirm whether both people are real working cofounders and the intended company share/voting split
- [ ] For each of client work, Wollie, and the other startup: current owners, founders, IP owner, contracts, revenue, expenses, and intended profit split
- [ ] Who owns the Wollie code/IP today, and what ownership split is intended?
- [ ] Is Georgia a short trip or a real move involving Belgian deregistration and at least 183 days/substance in Georgia?
- [ ] Expected first-year revenue for each activity, personal cash needed each month, and whether profits can remain in the company
- [ ] Intended initial customer territory: Belgium only, EU, or worldwide

## 7. Formation sequence after the decision

1. Obtain one paid, written cross-border residence/entity consultation scoped to Belgium and Georgia; provide this document so the adviser validates facts rather than starting from zero.
2. Confirm the founder's right to self-employment in Wallonia.
3. Map ownership, contracts, revenue, and IP for all three activities. If the ownership is the same, agree one genuine equity/IP split and form one umbrella SRL/BV.
4. Register the NACE-BEL codes for the activities actually started; add later activities within one month of starting them.
5. Register CBE, VAT and UBO as applicable; join the required social-insurance fund; open the business account.
6. Decide the VAT scheme using the Belgian-sited turnover from all relevant activities in the same enterprise. The Belgian small-business exemption generally applies only up to EUR 25,000 annual qualifying turnover, reduced pro rata in the first partial year, and does not allow input-VAT deduction. Operations located abroad are excluded from this Belgian-turnover calculation, so the accountant must classify the American client contracts rather than simply add every invoice.
7. Activate Belgian Stripe and complete Enable Banking KYB only with the true operator and UBOs.
8. Replace the current France-specific legal/tax drafts with Belgian/EU documents before taking payment.

## Official sources

- Belgian personal residence and worldwide income: https://fin.belgium.be/en/private-individuals/international/coming-to-belgium/tax-return and https://fin.belgium.be/en/private-individuals/international/foreign-income-accounts/income
- Foreign company managed in Belgium: https://finance.belgium.be/en/enterprises/corporation-tax/corporate-income-tax-return
- Belgian registration fee and process: https://economie.fgov.be/en/themes/enterprises/starting-business/steps-starting-business/steps-take-business-counter
- Belgian company/VAT/UBO steps: https://business.belgium.be/start-a-business/register-your-business/register-as-a-company
- Belgian SRL/BV requirements and notary base fees: https://www.notaire.be/entreprendre/les-differentes-formes-juridiques-de-societe/la-srl-societe-responsabilite-limitee
- Registering multiple activities/NACE-BEL codes: https://business.belgium.be/en/setting_up_your_business/define_the_economic_activities_of_your_enterprise
- Belgian small-business VAT exemption and EUR 25,000 threshold: https://finance.belgium.be/en/enterprises/vat/vat-obligation/vat-exemption-scheme-small-businesses
- Walloon professional-card scope, fees, and process: https://www.wallonie.be/fr/demarches/obtenir-une-carte-professionnelle-pour-travailleur-etranger-independant
- Walloon professional-card exemptions: https://emploi.wallonie.be/home/travailleurs-etrangers/carte-professionnelle-independant/Demandeur/les-dispenses-de-cartes-professi.html
- Estonian costs and cross-border tax warning: https://learn.e-resident.gov.ee/hc/en-gb/articles/360000625118-Costs-fees and https://www.emta.ee/en/business-client/registration-business/non-residents-e-residents/tax-liabilities-companies
- Estonian Russian-citizen application restriction: https://learn.e-resident.gov.ee/hc/en-gb/articles/39469872256913-Restrictions-on-e-Residency-applications
- Georgian registration fees: https://napr.gov.ge/en/page/fees-and-terms/business-registration-fee
- Georgian Tax Code (small business, residence, Virtual Zone): https://www.rs.ge/Media/Default/კანონმდებლობა/კანონები/tax%20code.pdf
- Stripe supported countries: https://stripe.com/en-fr/global
