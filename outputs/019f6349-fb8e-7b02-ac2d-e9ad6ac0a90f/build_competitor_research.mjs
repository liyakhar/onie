import fs from 'node:fs/promises'
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool'

const OUT = new URL('.', import.meta.url).pathname
const OUTPUT = `${OUT}wollie_competitor_research_2026-07-15.xlsx`
const C = {
  ink: '#111111', white: '#FFFFFF', paper: '#FFFFFF', mist: '#F5F5F4', line: '#D6D3D1',
  green: '#087F5B', green2: '#D3F9D8', amber: '#F59F00', amber2: '#FFF3BF', red: '#C92A2A', red2: '#FFE3E3', blue: '#1864AB', blue2: '#D0EBFF', gray: '#57534E',
}

const officialSources = {
  wollieProduct: '/Users/liya/Projects/wollie/PRODUCT.md',
  wolliePlan: '/Users/liya/Projects/wollie/docs/plans/2026-07-13-bank-sync-budgeting-app-plan.md',
  wolliePricing: '/Users/liya/Projects/wollie/docs/brainstorms/2026-07-15-wollie-pricing-stripe-brainstorm.md',
  wollieLanding: '/Users/liya/Projects/wollie/src/routes/index.tsx',
  wollieAccounts: '/Users/liya/Projects/wollie/src/routes/app/accounts.tsx',
  wollieDashboard: '/Users/liya/Projects/wollie/src/routes/app/index.tsx',
  ynabPricing: 'https://www.ynab.com/pricing',
  ynabFeatures: 'https://www.ynab.com/features',
  wallet: 'https://budgetbakers.com/en/products/wallet/',
  walletSync: 'https://budgetbakers.com/en/products/wallet/features/bank-sync/',
  walletAbout: 'https://budgetbakers.com/en/about-us/',
  bilance: 'https://www.bilanceapp.com/',
  bilanceStore: 'https://apps.apple.com/nl/app/bilance-geld-budget-kosten/id1570659711',
  spendeePricing: 'https://www.spendee.com/pricing',
  spendeeSync: 'https://www.spendee.com/bank-connect',
  spendeeShare: 'https://help.spendee.com/article/224-shared-wallets',
  moneywiz: 'https://www.wiz.money/',
  moneywizPricing: 'https://www.wiz.money/pricing',
  pocketsmith: 'https://www.pocketsmith.com/pricing/',
  actual: 'https://actualbudget.org/',
  actualSync: 'https://actualbudget.org/docs/advanced/bank-sync/',
  snoop: 'https://test.snoop.app/plus/',
  emmaPricing: 'https://help.emma-app.com/en/article/how-much-does-emma-plusproultimate-cost-1ywhulq/',
  emmaCoverage: 'https://help.emma-app.com/en/article/i-can-see-the-wrong-countrys-banks-ukuscanada-15k3f29/',
  spiir: 'https://www.spiir.com/',
  openBanking: 'https://www.openbanking.org.uk/news/open-banking-limited-marks-8-years-of-transforming-the-uks-financial-landscape/',
  market: 'https://www.grandviewresearch.com/industry-analysis/personal-finance-software-market-report',
}

const landscape = [
  ['Wollie', 'Direct / focal product', 'Emerging EU challenger', 'Continental Europe; people who want clarity without spreadsheet upkeep', 2026, 'Pre-launch / beta; bootstrapped', 'No public traction yet', '€7.99/mo; €59/yr; 14-day no-card trial', 'Responsive web', 'Enable Banking; current picker: BE, LT, FR, NL, DE', 'Safe-to-spend, transaction review, confirmed recurring bills, calm UI', 'Coverage breadth, background sync proof, shared finances, multi-currency, native mobile', 'Medium today; high if trust wedge is proven', officialSources.wollieProduct],
  ['Wallet by BudgetBakers', 'Primary direct', 'EU/global scale leader', 'Broad consumer PFM; Europe and global', 2014, 'Private; PSD2-licensed AISP', '5M+ downloads; 500K+ paying customers', 'Free manual tier; Premium monthly/yearly/lifetime; local price varies', 'Web, iOS, Android', '15,000+ institutions; daily sync claim', 'Breadth, bank coverage, multi-currency, imports, lifetime option, scale', 'Reddit reports sync failures, weak support, rigid categories, restore gaps', 'Very high', `${officialSources.walletAbout} | ${officialSources.walletSync}`],
  ['Bilance', 'Primary direct', 'Fast-rising EU-native challenger', 'European mobile users seeking modern automation', null, 'Private Estonian company', '100,000+ European users', 'Example NL App Store: €13.99/mo; €69.99/yr; 7-day trial', 'iOS / Android mobile-first', 'EU Open Banking via GoCardless', 'Modern UX, merchant cleanup, bulk similar-transaction edits, recurring detection, AI assistant', 'No proper shared-account ownership split; subscription-only; limited platform depth', 'Very high', `${officialSources.bilance} | ${officialSources.bilanceStore}`],
  ['YNAB', 'Primary direct', 'Method and community leader', 'Committed zero-based budgeters; families and partners', 2004, 'Private, independent', 'Millions helped; 102K+ App Store reviews cited', '$14.99/mo; $109/yr; 34-day no-card trial', 'Web, iOS, Android', 'Select US, Canada, UK and EU banks', 'Distinct budgeting method, education, community, household sharing, goals', 'High price, steep learning curve, maintenance burden, uneven import outside core markets', 'High', `${officialSources.ynabPricing} | ${officialSources.ynabFeatures}`],
  ['Spendee', 'Primary direct', 'Value-oriented global tracker', 'Consumers and small shared-wallet groups', 2013, 'Private Czech company', 'Hundreds of thousands worldwide', '$5.99/mo; $35.99/yr Premium; 7-day trial', 'Web, iOS, Android', '2,500+ financial providers', 'Attractive UI, low price, multi-wallet, imports/exports, shared cash wallets', 'Bank wallets and budgets cannot be fully shared; categorization learning complaints', 'High', `${officialSources.spendeePricing} | ${officialSources.spendeeShare}`],
  ['MoneyWiz', 'Primary / power-user', 'Apple power-user specialist', 'Users with complex accounts, currencies and investments', 2010, 'Private independent software company', 'Not disclosed; long-lived product', '$5.99/mo; $59.99/yr Premium; 7-day trial', 'iOS and macOS', '40,000+ banks via multiple providers', 'Feature depth, multiple aggregators, offline, investments, reports, import formats', 'Apple-only, dense product, weaker calm/simple positioning', 'Medium-high', `${officialSources.moneywiz} | ${officialSources.moneywizPricing}`],
  ['PocketSmith', 'Primary / planning', 'Forecasting leader', 'Household CFOs and multi-currency power users', 2008, 'Private New Zealand company', 'Not disclosed; established global community', '$9.99/mo annual equivalent Foundation; higher tiers to $319.95/yr', 'Web, iOS, Android', '12,000+ institutions', 'Safe Balance, deep forecasts, calendar, multi-currency, rules, collaborators', 'Expensive, complex, mobile complaints; overkill for simple monthly clarity', 'Medium-high', officialSources.pocketsmith],
  ['Actual Budget', 'Primary / adjacent', 'Open-source envelope leader', 'Privacy-conscious and technical self-hosters', 2019, 'Open-source community; hosted service ended 2024', 'Large active open-source community; no paid user count', 'Software free; hosting/provider costs vary', 'Web / PWA / desktop-style', 'Enable Banking EU; GoCardless legacy; SimpleFIN NA; manual trigger', 'Own data, optional E2EE, rules, strong envelope budgeting, API', 'Self-host/setup burden, manual sync, provider credentials, mobile and duplicate-sync issues', 'High among technical users', `${officialSources.actual} | ${officialSources.actualSync}`],
  ['Snoop', 'Adjacent', 'UK free/open-banking aggregator', 'UK consumers focused on tracking and savings', 2019, 'Owned by Vanquis Banking Group', 'Not disclosed in reviewed sources', 'Free; Plus £4.99/mo or £39.99/yr', 'Mobile app', 'UK Open Banking', 'Free aggregation, subscriptions, payday budgets, alerts, refund tracking', 'UK-only, mobile-only, less proactive budget depth', 'Low in continental EU; high UK benchmark', officialSources.snoop],
  ['Emma', 'Adjacent', 'UK/US/Canada finance super-app', 'Mainstream mobile consumers', 2018, 'Private UK fintech', 'Not disclosed in reviewed primary sources', 'Plus £41.99/yr; Pro £83.99; Ultimate £124.99', 'Web, iOS, Android', 'UK, US and Canada only', 'Strong subscription/bill view, polished UX, broad paid tiers', 'No continental EU bank connections; tier maze; app-clutter complaints', 'Low direct; useful UX benchmark', `${officialSources.emmaPricing} | ${officialSources.emmaCoverage}`],
  ['Spiir (closed)', 'Exit / market signal', 'Former Nordic PFM', 'Nordic consumers', null, 'Service closed 8 Jun 2026', 'Thousands served over a decade', 'Was free', 'Mobile', 'Nordic / EU open banking', 'Demonstrated consumer demand and data aggregation', 'Shutdown highlights weak unit economics and continuity risk', 'Not a competitor; strategic warning', officialSources.spiir],
]

const featureNames = ['EU bank coverage', 'Sync reliability & repair', 'Low setup / upkeep', 'Safe-to-spend clarity', 'Budgeting depth', 'Recurring bills', 'Categorization & rules', 'Shared household', 'Multi-currency', 'Portability & recovery', 'Cross-platform', 'Price / value', 'Privacy / trust']
const weights = [12, 13, 10, 12, 8, 7, 8, 10, 5, 5, 4, 3, 3]
const featureRows = [
  ['Wollie', 2,1,3,3,1,3,1,0,0,2,1,2,3, 'Strong core promise and review workflow; live-sync breadth and household support remain unproven.', `${officialSources.wollieDashboard} | ${officialSources.wollieAccounts}`],
  ['Wallet', 3,1,2,1,2,2,1,1,3,1,3,3,3, 'Scale and breadth lead, but Reddit evidence repeatedly questions sync repair, support, categories and restoration.', officialSources.wallet],
  ['Bilance', 3,3,3,1,2,3,3,0,2,2,2,2,2, 'Closest current EU UX threat; modern automation but weak true household accounting.', officialSources.bilance],
  ['YNAB', 2,1,0,2,3,2,2,3,1,2,3,1,3, 'Method moat and sharing are excellent; complexity, price and import friction conflict with Wollie ICP.', officialSources.ynabPricing],
  ['Spendee', 3,2,2,1,2,2,1,1,2,2,3,3,2, 'Good-value broad tracker; collaboration and learning automation are incomplete.', officialSources.spendeePricing],
  ['MoneyWiz', 3,2,1,1,3,3,3,1,3,3,1,3,3, 'Powerful and broad but Apple-only and dense.', officialSources.moneywiz],
  ['PocketSmith', 3,2,1,3,3,3,3,2,3,3,3,1,3, 'Most complete planning benchmark and already owns Safe Balance; premium complexity leaves a simpler wedge.', officialSources.pocketsmith],
  ['Actual Budget', 2,1,0,2,3,2,3,1,1,3,2,3,3, 'Strong ownership and envelope depth; self-hosting and sync setup are the tax.', officialSources.actualSync],
  ['Snoop', 1,2,3,1,1,3,2,1,0,2,1,3,2, 'Great low-friction benchmark, but UK-only and mobile-only.', officialSources.snoop],
  ['Emma', 1,2,3,1,1,3,2,1,0,2,3,1,2, 'Polished mainstream UX but unavailable for continental EU banks.', officialSources.emmaCoverage],
]

const reddit = [
  ['2026-06-16','r/ynab','YNAB','Complaint','Bank sync reliability & freshness','Pending and posted transactions appeared as duplicates; imports lagged more than two days.','A safe-to-spend number is dangerous when source data is stale or duplicated.','High',0,'https://www.reddit.com/r/ynab/comments/1u76q1l/duplicate_imported_transactions_happening_for_a/'],
  ['2025-02-07','r/ynab','YNAB','Complaint','Pricing & value fairness','Long-time international user left after price increases while automatic sync remained unusable.','Regional value mismatch creates an opening for transparent EU pricing.','High',570,'https://www.reddit.com/r/ynab/comments/1ijv9ve/leaving_ynab_after_6_years_pricing_is_the_final/'],
  ['2026-03-14','r/ynab','YNAB','Complaint','Complexity & maintenance','User found $109 steep, reauthorized accounts weekly and felt proper upkeep was too much work.','Wollie should reduce maintenance, not merely simplify visuals.','High',36,'https://www.reddit.com/r/ynab/comments/1rtdn3s/my_1year_renewal_is_in_2_weeks_and_im_really/'],
  ['2025-04-03','r/ynab','YNAB','Complaint','Complexity & maintenance','Users describe hours of videos, separate web/mobile workflows and a multi-month learning curve.','Bank-first onboarding should avoid teaching a budgeting doctrine.','High',21,'https://www.reddit.com/r/ynab/comments/1jqgwig/why_is_ynab_so_hard/'],
  ['2026-07-13','r/ynab','YNAB','Complaint','Mobile / web parity','Frequent mobile UI changes added taps and terminology that diverged from web.','Stable terminology and cross-device parity are trust features.','High',197,'https://www.reddit.com/r/ynab/comments/1uvq4ec/when_will_ynab_stop_needlessly_changing_the_ui/'],
  ['2026-02-28','r/ynab','YNAB','Complaint','Complexity & maintenance','Long-time users called the product noisy and less engaging as layers accumulated.','Feature restraint can be a moat if paired with clear outcomes.','High',48,'https://www.reddit.com/r/ynab/comments/1rh6qnn/is_ynab_becoming_too_noisy/'],
  ['2026-01-05','r/BudgetBakers','Wallet','Missing feature','Categorization & bulk correction','Core categories cannot be fully replaced; renamed categories still match against old definitions.','Transparent editable rules and bulk apply are table stakes.','Medium',6,'https://www.reddit.com/r/BudgetBakers/comments/1q46c1p/what_are_your_workarounds_about_the_fact_that/'],
  ['2025-08-05','r/BudgetBakers','Wallet','Complaint','Bank sync reliability & freshness','A Belgian ING account stopped syncing; reconnecting forced a year of recategorization.','Repair must preserve history, categories and user trust.','Medium',1,'https://www.reddit.com/r/BudgetBakers/comments/1mi86nz/back_syncing_issues_in_wallet_app/'],
  ['2026-05-01','r/BudgetBakers','Wallet','Complaint','Data portability / recovery','Deleted account had no recovery; exported data could not be fully restored with categories intact.','A finance app needs reversible deletion and tested full-fidelity restore.','High',10,'https://www.reddit.com/r/BudgetBakers/comments/1t0dbof/wallet_by_budgetbakers_deleted_inapp_account/'],
  ['2025-04-23','r/BudgetBakers','Wallet','Complaint','Bank sync reliability & freshness','Long-time user reported errors, delays and lost transactions and began searching for alternatives.','Reliability is the buying reason, not a backend detail.','High',14,'https://www.reddit.com/r/BudgetBakers/comments/1k5spt1/wallet_app_alternatives_sync_issues_driving_me/'],
  ['2025-12-12','r/BudgetBakers','Wallet','Complaint','Bank sync reliability & freshness','Multiple banks stopped syncing after updates; reconnect attempts failed.','Expose provider status, freshness, retry and safe fallback clearly.','Medium',5,'https://www.reddit.com/r/BudgetBakers/comments/1pkmd4u/bank_sync_not_working/'],
  ['2025-12-12','r/BudgetBakers','Wallet','Complaint','Vendor continuity & support','Users described slow support and fear of losing transaction history during a sync incident.','Visible service status and a recovery guarantee can differentiate.', 'High',12,'https://www.reddit.com/r/BudgetBakers/comments/1pkq3ht/banks_not_updating/'],
  ['2025-10-30','r/BudgetBakers','Wallet','Complaint','Mobile / web parity','Web/browser data did not match the mobile app.','One reconciled source of truth matters for money products.','Medium',6,'https://www.reddit.com/r/BudgetBakers/comments/1ojwt0u/syncing_problem/'],
  ['2026-04-07','r/BudgetBakers','Wallet vs Bilance','Positive alternative','Categorization & bulk correction','Bilance was praised for clean merchant names, similar-transaction bulk edits and more reliable EU sync.','Competitors already pair polished UX with smart corrections.','High',10,'https://www.reddit.com/r/BudgetBakers/comments/1senxdi/wallet_lifetime_user_vs_bilance_premium_first/'],
  ['2026-03-11','r/eupersonalfinance','Bilance / EU market','Missing feature','Shared / household finances','Joint-account spending counted 100% toward one person; user wanted ownership ratios such as 50%.','True shared-finance accounting is a sharp, under-served wedge.','High',2,'https://www.reddit.com/r/eupersonalfinance/comments/1rqxidg/euwide_expense_tracking_app/'],
  ['2025-12-12','r/BudgetBakers','Bilance','Complaint','Pricing & value fairness','User liked Bilance but rejected an annual subscription and preferred a lifetime option.','Wollie must prove recurring value, not just be cheaper than leaders.','Medium',19,'https://www.reddit.com/r/BudgetBakers/comments/1pkqdp7/alternatives_to_wallet/'],
  ['2025-04-23','r/BudgetBakers','Spendee','Complaint','Categorization & bulk correction','Automatic categories did not learn from manual corrections, creating repeated cleanup.','Teach-once categorization is a recurring unmet need.','Medium',14,'https://www.reddit.com/r/BudgetBakers/comments/1k5spt1/wallet_app_alternatives_sync_issues_driving_me/'],
  ['2026-03-11','r/eupersonalfinance','EU market','Missing feature','EU bank coverage / multi-country','User needed Spanish and German banks in one app and found country-specific tools inadequate.','Wollie should publish real bank/country coverage and expand by cross-border use cases.','High',2,'https://www.reddit.com/r/eupersonalfinance/comments/1rqxidg/euwide_expense_tracking_app/'],
  ['2025-11-13','r/eupersonalfinance','EU market','Missing feature','Shared / household finances','Couples resorted to Splitwise, workarounds or spreadsheets because shared budgeting was painful.','Household mode can remove a whole-app workaround.','High',8,'https://www.reddit.com/r/eupersonalfinance/comments/1ow2zp8/what_do_you_use_for_shared_budgeting/'],
  ['2025-10-28','r/personalfinance','Category','Concern','Privacy & bank-linking trust','Spreadsheet user valued automation but was uneasy granting a third party access to all accounts.','Explain read-only OAuth, data fields, revocation and password handling in-product.','High',4,'https://www.reddit.com/r/personalfinance/comments/1oierkj/letting_budget_apps_connect_to_your_bank/'],
  ['2025-10-28','r/personalfinance','Category','Complaint','Bank sync reliability & freshness','YNAB user avoided sync because connections repeatedly broke, not because of security concerns.','Broken automation can be worse than honest manual workflows.','High',4,'https://www.reddit.com/r/personalfinance/comments/1oierkj/letting_budget_apps_connect_to_your_bank/'],
  ['2026-06-23','r/budget','Category','Missing feature','Complexity & maintenance','User said 15–20 categories and a large setup form made budgets feel like forced spreadsheets.','Start with the bank data and three decisions, not a blank budget taxonomy.','Medium',1,'https://www.reddit.com/r/budget/comments/1udii1a/rate_this_method_or_give_suggestions/'],
  ['2024-07-28','r/budget','Category','Missing feature','Forecasting irregular expenses','User needed a clear view of irregular annual bills and large planned purchases across future months.','Safe-to-spend should reserve irregular obligations, not only recurring monthly bills.','Medium',1,'https://www.reddit.com/r/budget/comments/1ed7sms/what_do_you_lovehate_about_budgeting_apps/'],
  ['2026-02-26','r/budget','Category','Missing feature','Forecasting irregular expenses','User wanted projections based on real spending that could connect current budgets to retirement scenarios.','Do not build retirement planning now, but preserve forecast-ready data and APIs.','Low',1,'https://www.reddit.com/r/budget/comments/1o4q914/budget_appssoftware_discussion_megathread/'],
  ['2026-01-05','r/budget','Category','Complaint','Complexity & maintenance','Builder described users stitching budgeting, debt, savings and wealth apps together mentally.','Wollie can own the monthly control loop without becoming a finance super-app.','Low',1,'https://www.reddit.com/r/budget/comments/1o4q914/budget_appssoftware_discussion_megathread/'],
  ['2026-01-28','r/budget','Category','Missing feature','Data portability / recovery','A new app highlighted transaction read receipts so users could resume after weeks away.','A clear review checkpoint reduces the cost of falling behind.','Low',1,'https://www.reddit.com/r/budget/comments/1o4q914/budget_appssoftware_discussion_megathread/'],
  ['2026-06-18','r/YNABAlternatives','Category','Missing feature','Mobile / web parity','Users liked mobile-first alternatives but still missed desktop mode or full bank setup on mobile.','Cross-device jobs must be explicit and complete.','Medium',18,'https://www.reddit.com/r/YNABAlternatives/comments/1u9iulj/whats_the_best_mobile_experience_youve_found/'],
  ['2025-08-02','r/selfhosted','Actual Budget','Complaint','EU bank coverage / multi-country','New Actual users could no longer sign up for GoCardless bank data, breaking the expected EU sync path.','Provider dependence and migration plans must be visible.','High',12,'https://www.reddit.com/r/selfhosted/comments/1mfs6ro/actual_budget_cannot_sign_up_to_gocardless_bank/'],
  ['2026-01-31','r/actualbudgeting','Actual Budget','Complaint','EU bank coverage / multi-country','Users still could not get a clear answer on new GoCardless availability.','Wollie can win with an unambiguous supported-bank checker and status page.','Medium',2,'https://www.reddit.com/r/actualbudgeting/comments/1qrwymm/gocardless_bank_synchronization/'],
  ['2025-01-24','r/actualbudgeting','Actual Budget','Complaint','Bank sync reliability & freshness','One sync imported the same transaction six times.','Idempotency and duplicate resolution must be product-visible and tested.','Medium',3,'https://www.reddit.com/r/actualbudgeting/comments/1i95c5j/issues_with_syncing/'],
  ['2026-01-05','r/PersonalFinanceNZ','PocketSmith','Complaint','Pricing & value fairness','Prospect was shocked by PocketSmith price; free plan lacked automatic bank feeds.','Wollie price is credible if its core outcome is immediate.','Medium',0,'https://www.reddit.com/r/PersonalFinanceNZ/comments/1q41zsc/mybudgetpal_vs_pocketsmith/'],
  ['2025-05-02','r/AusFinance','PocketSmith','Complaint','Mobile / web parity','Android app was described as a prototype missing asset and category management.','Responsive web alone may not satisfy a mobile-first money habit.','Medium',0,'https://www.reddit.com/r/AusFinance/comments/1ke53au/negative_experience_with_pocketsmith/'],
  ['2025-12-24','r/eupersonalfinance','EU market','Complaint','EU bank coverage / multi-country','Users tried several global apps and still fell back to Excel for multi-currency, Amex and vesting data.','Narrow the ICP and be explicit about unsupported complexity.','High',26,'https://www.reddit.com/r/eupersonalfinance/comments/1pungkq/what_is_your_go_to_personal_finance_app/'],
  ['2026-04-21','r/BudgetBakers','MoneyWiz','Constraint','Mobile / web parity','MoneyWiz was recommended but noted as restricted to Apple platforms.','A web-first cross-platform product still has an accessibility advantage.','Medium',10,'https://www.reddit.com/r/BudgetBakers/comments/1srjw7b/better_app_altnerative/'],
  ['2026-03-31','r/BudgetBakers','Category','Missing feature','Data portability / recovery','User needed printable reports, proper split expenses and split income reimbursements.','Exports, splits and auditability matter to households with real-world edge cases.','Medium',19,'https://www.reddit.com/r/BudgetBakers/comments/1pkqdp7/alternatives_to_wallet/'],
  ['2026-06-10','r/YNABAlternatives','Category','Concern','Vendor continuity & support','Comparison-chart maintainer said many alternatives are one-person products with little operating history.','Trust needs operational proof: status, backups, response times and company identity.','Medium',0,'https://www.reddit.com/r/YNABAlternatives/comments/1u163dr/comparison_chart_comments/'],
  ['2026-02-28','r/ynab','Emerging alternative','Positive signal','Safe-to-spend clarity','A lightweight alternative’s “safe to spend today” number resonated as a simpler outcome than envelope maintenance.','The demand exists, but the number must be explainable and trustworthy.','Low',1,'https://www.reddit.com/r/ynab/comments/1rh6qnn/is_ynab_becoming_too_noisy/'],
  ['2025-12-15','r/BudgetBakers','Category','Willingness to pay','Bank sync reliability & freshness','User with six accounts called bank sync non-negotiable and was willing to pay about $40/year to avoid manual work.','Reliable sync is monetizable; breadth without reliability is not.','Medium',19,'https://www.reddit.com/r/BudgetBakers/comments/1pkqdp7/alternatives_to_wallet/'],
  ['2024-04-08','r/UKPersonalFinance','Category','Missing feature','Categorization & bulk correction','User wanted a correction to apply to all similar historical and future transactions.','Bulk history correction plus future rule creation should be one action.','Medium',0,'https://www.reddit.com/r/UKPersonalFinance/comments/1byvzku/budgeting_apps_looking_for_some_recommendations/'],
  ['2024-04-18','r/personalfinance','Category','Missing feature','Categorization & bulk correction','User wanted receipt-level item categories such as groceries versus alcohol, not one merchant category.','Keep receipt detail later; first solve merchant-level accuracy and splits.','Low',0,'https://www.reddit.com/r/personalfinance/comments/1c7q8h1/looking_for_a_spending_analysis_categorisation_app/'],
]

const painThemes = [
  ['Bank sync reliability & freshness',5,5,'“Is this number based on fresh, deduplicated data?”','Sync health center; last-fresh timestamp; idempotent import; duplicate resolution; repair without losing categories.'],
  ['Categorization & bulk correction',5,5,'“Learn this once and fix the rest for me.”','One action to correct current, historical similar, and future transactions; transparent editable rules.'],
  ['Shared / household finances',5,5,'“Show my share, our share and my partner’s share without Splitwise.”','Account ownership ratios, split transactions, joint/personal views, partner invite and permissions.'],
  ['Complexity & maintenance',5,5,'“Don’t make me build another spreadsheet inside an app.”','Bank-first onboarding; suggested starter plan; weekly review queue; progressive disclosure.'],
  ['Pricing & value fairness',4,4,'“I’ll pay if sync works and saves real time.”','Keep €59 annual; prove outcome in trial; avoid feature tiers; publish value and coverage.'],
  ['EU bank coverage / multi-country',5,5,'“My accounts cross borders; your coverage should too.”','Public bank checker, country roadmap, provider fallback plan, multi-currency architecture.'],
  ['Privacy & bank-linking trust',5,5,'“What exactly can you see, and can you move money?”','Permission receipt, read-only explanation, revoke/delete/export controls, data-flow diagram.'],
  ['Data portability / recovery',5,4,'“A backup must actually restore everything.”','Versioned export and import, soft delete/trash, restore drill, audit log.'],
  ['Mobile / web parity',4,4,'“Do the same core jobs on every device.”','PWA polish now; native wrapper only after retention; parity checklist for review/sync/budget.'],
  ['Forecasting irregular expenses',4,4,'“Reserve annual and irregular costs before telling me I can spend.”','Sinking funds and planned obligations included in safe-to-spend breakdown.'],
  ['Vendor continuity & support',5,4,'“Will this still work, and will someone answer?”','Public status, incident history, support target, provider contingency and export guarantee.'],
  ['Safe-to-spend clarity',5,5,'“Give me one number, then show exactly why.”','Explainable calculation, assumptions, confidence state and what needs review before trust.'],
]

const opportunities = [
  ['Trustworthy sync control center','Repeated highest-frequency complaint across Wallet, YNAB and Actual','Know what is fresh, broken or duplicated before making a decision',5,5,4,5,5,'0–3 months','Per-account freshness; sync history; retry/reconnect; dedupe; repair preserving user edits','Do not claim “automatic” until background reliability is measured'],
  ['Explainable safe-to-spend confidence','Wollie promise + repeated demand for one number; PocketSmith proves category exists','One trusted number with a transparent bill/budget/review breakdown',5,4,4,5,5,'0–3 months','Calculation waterfall; confidence badge; unresolved-data deductions; “why changed” history','Do not present a precise number when data is stale or incomplete'],
  ['First-class household ownership','EU Reddit users cannot split joint-account economics correctly','See mine, yours and ours without external split apps',5,5,3,4,5,'3–6 months','Partner invite; account ownership ratio; split/exclude; joint vs personal safe-to-spend','Do not call basic shared login “household support”'],
  ['Teach-once categorization','Users repeatedly redo identical fixes across products','Correct once; apply to similar history and future automatically',5,4,4,4,5,'0–3 months','Bulk similar selection; explainable rule preview; undo; merchant normalization','Avoid opaque AI that silently rewrites history'],
  ['Transparent service status & support','Slow support and provider ambiguity destroy trust','Know whether an issue is Wollie, provider or bank—and when it will recover',4,5,4,5,4,'0–3 months','Status page; provider labels; incident copy; support response target; in-app diagnostics','Do not hide outages behind generic error copy'],
  ['Full-fidelity backup and restore','Wallet deletion/restore complaints; continuity concern for indie apps','Leave safely, recover mistakes and trust the company more',4,4,4,5,4,'0–3 months','Versioned export/import; soft deletion; restore test; documented schema','An export-only checkbox is not portability'],
  ['Bank-first starter plan','Large category forms cause abandonment','Connect, review a few unclear items, accept a suggested monthly plan',4,4,4,4,5,'0–3 months','Data-driven baseline; three-step plan; user confirms bills and flexible spending','Do not force zero-based setup or 20 empty categories'],
  ['EU multi-country and currency path','Cross-border accounts remain a visible gap','See accounts across European countries and currencies without falling back to Excel',5,4,2,4,5,'6–12 months','Coverage checker; currency-aware balances; explicit FX rules; second provider where needed','Do not market “Europe” from a five-country selector alone'],
  ['Outcome-anchored simple pricing','€59 is mid-market but Wallet lifetime and Spendee undercut it','Understand the time and anxiety saved during the trial',4,3,5,4,4,'0–3 months','One plan; annual default; bank coverage before signup; trial success checklist','Avoid a feature maze or discounts that undermine trust'],
  ['Plain-English weekly money check-in','Users want guidance without a finance super-app','Review what changed, what needs attention and what is safe this week',4,4,4,4,5,'3–6 months','Deterministic summary first; source links; optional AI phrasing later','Do not lead with an AI chat gimmick'],
  ['Irregular obligation runway','Annual bills and large purchases make monthly budgets lie','Reserve non-monthly obligations before they silently consume spendable money',4,3,3,4,4,'3–6 months','Planned expenses, sinking funds, BNPL installments, runway impact','Avoid retirement forecasting and investment scope creep'],
  ['Mobile habit parity','Finance review is frequent and phone-heavy','Review, correct and trust the same money state on phone and desktop',4,2,2,3,4,'6–12 months','Installable PWA; offline review queue; native wrapper only if retention supports it','Do not build native apps before the core loop is proven'],
]

const profiles = [
  ['Wallet by BudgetBakers','Scale PFM / broad automation','Coverage, imports, multi-currency, planned payments, API direction, lifetime value','Sync reliability, support, rigid categories, restore weakness','Subscription plus lifetime; global app stores','High switching cost from historical data; 500K+ paying; PSD2 license','Beat on trust, repair and household logic—not breadth','Very high','Watch 2026 API/MCP and ShareCost integration',officialSources.walletAbout],
  ['Bilance','Modern EU money app','Merchant cleanup, recurring detection, modern UI, bulk similar edits, EU sync','Joint account ownership model missing; subscription cost; less platform breadth','Paid-only mobile subscription','100K+ users; fast product velocity; EU-first brand','Ship household mode before Bilance; match transaction cleanup quality','Very high','Likely to add shared finances; closest wedge collision',officialSources.bilance],
  ['YNAB','Method + education ecosystem','Proven behavior change, community, support, goals, household sharing','Learning curve, upkeep, price, import frustration and UI churn','Single premium subscription; education-led acquisition','Methodology and community create retention beyond features','Target people who reject the method but still want control','High','Could simplify onboarding or improve EU imports',officialSources.ynabPricing],
  ['Spendee','Affordable tracker and shared wallets','Price, visual design, provider breadth, imports/exports','Learning categories, shared bank wallet and shared budget limitations','Freemium + low-priced Premium','Hundreds of thousands; broad country presence','Offer more trustworthy automation and true household economics','High','Could close shared-bank gap cheaply',officialSources.spendeePricing],
  ['MoneyWiz','Feature-rich Apple personal accounting','Multi-provider sync, investments, reports, imports, multi-currency, offline','Apple-only and cognitively dense','Standard and Premium subscriptions','Long operating history and 40K+ bank claim','Stay narrower and calmer; avoid power-user arms race','Medium-high','Cross-platform expansion would raise threat',officialSources.moneywiz],
  ['PocketSmith','Forecasting and household CFO platform','Safe Balance, 10–60 year forecasts, calendar, rules, currencies, collaborators','Price, complexity, weaker mobile perception','Tiered premium by feeds and forecast horizon','Deep historical data and sophisticated workflows','Make safe-to-spend immediate and approachable, not less capable by accident','Medium-high','Already validates safe-balance concept',officialSources.pocketsmith],
  ['Actual Budget','Open-source envelope budgeting','Data ownership, E2EE, rules, API, migration, price','Self-hosting, credentials, manual bank sync, provider ambiguity','Free open source; hosting/provider ecosystem','Community and data ownership create strong loyalty','Use managed reliability and simplicity as the counter-position','High in technical segment','Now documents Enable Banking—the same EU provider class as Wollie',officialSources.actualSync],
  ['Snoop','UK tracking and savings assistant','Low friction, free tier, payday analysis, alerts and subscriptions','UK-only, mobile-only, shallow proactive budgeting','Freemium + Plus','Open Banking distribution and established UK brand','Use as onboarding benchmark, not direct continental rival','Low direct','Could expand geography via owner resources',officialSources.snoop],
  ['Emma','Mainstream finance super-app','Polish, subscriptions, fraud tools, web/mobile, monetization breadth','No continental EU coverage, tier maze, product clutter','Freemium with three paid tiers','Strong consumer brand in UK/US/Canada','Contrast one calm purpose with super-app sprawl','Low direct','Geographic expansion would raise threat',officialSources.emmaCoverage],
]

const sources = [
  ['Internal','Wollie product definition',officialSources.wollieProduct,'Target user, purpose, calm design principles'],
  ['Internal','Wollie implementation plan',officialSources.wolliePlan,'Current scope, provider strategy and non-goals'],
  ['Internal','Wollie pricing decision',officialSources.wolliePricing,'€7.99 monthly, €59 yearly, 14-day no-card trial'],
  ['Internal','Wollie live dashboard route',officialSources.wollieDashboard,'Safe-to-spend, review queue, detected bills and dashboard behavior'],
  ['Official','YNAB pricing',officialSources.ynabPricing,'Price, trial, household sharing, selected EU support, single-currency limit'],
  ['Official','YNAB features',officialSources.ynabFeatures,'Bank import, reports, goals, apps and review signal'],
  ['Official','BudgetBakers company facts',officialSources.walletAbout,'Founded 2014, 5M+ downloads, 500K+ paying'],
  ['Official','Wallet product',officialSources.wallet,'Features, imports, multi-currency, business model'],
  ['Official','Wallet bank sync',officialSources.walletSync,'15K+ institutions, read-only, daily sync, security claims'],
  ['Official','Bilance homepage',officialSources.bilance,'100K+ users, EU positioning, core features'],
  ['App Store','Bilance NL listing',officialSources.bilanceStore,'Example current subscription price and trial'],
  ['Official','Spendee pricing',officialSources.spendeePricing,'Price, trial and feature tiers'],
  ['Official','Spendee bank connect',officialSources.spendeeSync,'2,500+ providers and country list'],
  ['Official','Spendee shared wallets help',officialSources.spendeeShare,'Shared-wallet limitations'],
  ['Official','MoneyWiz product',officialSources.moneywiz,'40K+ banks, platforms, power-user features'],
  ['Official','MoneyWiz pricing',officialSources.moneywizPricing,'Premium and Standard pricing'],
  ['Official','PocketSmith pricing',officialSources.pocketsmith,'Plans, Safe Balance, currencies, feeds and forecasts'],
  ['Official','Actual Budget product',officialSources.actual,'Open source, E2EE, envelopes and ownership'],
  ['Official','Actual Budget bank sync docs',officialSources.actualSync,'Providers, manual sync, credential and encryption caveats'],
  ['Official','Snoop Plus',officialSources.snoop,'Price, feature comparison, mobile-only note'],
  ['Official','Emma pricing',officialSources.emmaPricing,'Plus, Pro and Ultimate prices'],
  ['Official','Emma coverage',officialSources.emmaCoverage,'UK, US and Canada only; no outside-bank support'],
  ['Official','Spiir closure notice',officialSources.spiir,'Service ended 8 Jun 2026'],
  ['Industry','Open Banking Limited milestone',officialSources.openBanking,'16.5M UK user connections by late 2025'],
  ['Market research','Personal finance software market',officialSources.market,'$1.08B in 2022 to $1.59B by 2030; 5.1% CAGR estimate'],
]

const wb = Workbook.create()
const summary = wb.worksheets.add('Executive Summary')
const market = wb.worksheets.add('Market Landscape')
const matrix = wb.worksheets.add('Feature Matrix')
const comp = wb.worksheets.add('Competitor Profiles')
const red = wb.worksheets.add('Reddit Evidence')
const pains = wb.worksheets.add('Pain Themes')
const opp = wb.worksheets.add('Opportunities')
const pos = wb.worksheets.add('Positioning')
const src = wb.worksheets.add('Source Index')

function col(n) { let s=''; for (let x=n+1;x>0;x=Math.floor((x-1)/26)) s=String.fromCharCode(65+(x-1)%26)+s; return s }
function title(sheet, lastCol, name, subtitle) {
  sheet.showGridLines = false
  sheet.getRange(`A1:${lastCol}1`).merge(); sheet.getRange('A1').values=[[name]]
  sheet.getRange(`A1:${lastCol}1`).format={fill:C.ink,font:{bold:true,color:C.white,size:20},verticalAlignment:'center'}
  sheet.getRange(`A2:${lastCol}2`).merge(); sheet.getRange('A2').values=[[subtitle]]
  sheet.getRange(`A2:${lastCol}2`).format={fill:C.mist,font:{color:C.gray,size:10,italic:true},wrapText:true,verticalAlignment:'center'}
  sheet.getRange('1:1').format.rowHeight=34; sheet.getRange('2:2').format.rowHeight=30
}
function table(sheet, startRow, headers, rows, widths, name, rowHeight=42) {
  const endCol=col(headers.length-1), endRow=startRow+rows.length
  sheet.getRange(`A${startRow}:${endCol}${endRow}`).values=[headers,...rows]
  sheet.getRange(`A${startRow}:${endCol}${startRow}`).format={fill:C.ink,font:{bold:true,color:C.white,size:9},wrapText:true,verticalAlignment:'center'}
  sheet.getRange(`A${startRow}:${endCol}${endRow}`).format.borders={insideHorizontal:{style:'thin',color:C.line},bottom:{style:'thin',color:C.line}}
  sheet.getRange(`A${startRow+1}:${endCol}${endRow}`).format={font:{size:9,color:C.ink},wrapText:true,verticalAlignment:'top'}
  sheet.getRange(`${startRow}:${startRow}`).format.rowHeight=32
  if(rows.length) sheet.getRange(`${startRow+1}:${endRow}`).format.rowHeight=rowHeight
  widths.forEach((w,i)=>sheet.getRange(`${col(i)}:${col(i)}`).format.columnWidth=w)
  const t=sheet.tables.add(`A${startRow}:${endCol}${endRow}`,true,name); t.style='TableStyleMedium2'; t.showBandedRows=true; t.showFilterButton=true
  return {endRow,endCol,table:t}
}
function section(sheet, range, text) {
  sheet.getRange(range).merge(); sheet.getRange(range.split(':')[0]).values=[[text]]
  sheet.getRange(range).format={fill:C.green,font:{bold:true,color:C.white,size:11},verticalAlignment:'center'}
}

// Executive Summary
title(summary,'J','Wollie competitive research','Current as of 2026-07-15 · EU-first bank-sync budgeting · 40 Reddit observations + primary competitor sources')
for (const [r,label,value,fill] of [
  [4,'VERDICT','Wollie has a distinctive promise, but not yet a defensible product moat.',C.red2],
  [7,'CURRENT STANDOUT','Messaging: yes · Feature moat: weak · Operational proof: not yet',C.amber2],
  [10,'BEST WEDGE','Reliable EU sync + explainable safe-to-spend + first-class shared finances',C.green2],
]) {
  summary.getRange(`A${r}:C${r}`).merge(); summary.getRange(`A${r}`).values=[[label]]; summary.getRange(`A${r}:C${r}`).format={fill:C.ink,font:{bold:true,color:C.white,size:9}}
  summary.getRange(`D${r}:J${r+1}`).merge(); summary.getRange(`D${r}`).values=[[value]]; summary.getRange(`D${r}:J${r+1}`).format={fill,font:{bold:true,color:C.ink,size:14},wrapText:true,verticalAlignment:'center'}
}
section(summary,'A13:J13','What the evidence says')
const findings=[
  ['01','“Calm” is attractive but easy to copy; PocketSmith already markets Safe Balance and Bilance already feels modern in Europe.'],
  ['02','Bank sync reliability is the dominant pain: stale data, duplicates, reconnection loops and lost categorization make every downstream insight suspect.'],
  ['03','Shared household money is the clearest unmet EU job: users want mine / yours / ours and ownership ratios without Splitwise workarounds.'],
  ['04','€59/year is credible mid-market pricing: below YNAB, PocketSmith and Bilance; above Spendee/Snoop and vulnerable to Wallet lifetime offers.'],
  ['05','The target should be continental European couples or households with 2+ accounts who want control without zero-based-budget upkeep.'],
]
findings.forEach((x,i)=>{const r=14+i*2; summary.getRange(`A${r}:A${r+1}`).merge(); summary.getRange(`A${r}`).values=[[x[0]]]; summary.getRange(`A${r}:A${r+1}`).format={fill:C.green,font:{bold:true,color:C.white,size:11},horizontalAlignment:'center',verticalAlignment:'center'}; summary.getRange(`B${r}:J${r+1}`).merge(); summary.getRange(`B${r}`).values=[[x[1]]]; summary.getRange(`B${r}:J${r+1}`).format={fill:i%2?C.paper:C.mist,font:{size:10},wrapText:true,verticalAlignment:'center',borders:{bottom:{style:'thin',color:C.line}}}})
section(summary,'A24:J24','Recommended sequence')
const seq=[
  ['0–3 months','Prove trust','Sync health + dedupe + safe-to-spend explanation + teach-once categories + full export/restore'],
  ['3–6 months','Create the moat','Household invite, ownership ratios, joint/personal views, irregular obligations, weekly review'],
  ['6–12 months','Expand carefully','Multi-country and multi-currency, second provider resilience, PWA/native decision from retention data'],
]
table(summary,25,['Horizon','Objective','Deliverables'],seq,[16,22,86],'SummarySequence',44)
summary.getRange('A31:B31').values=[['Competitor','Weighted fit']]
for(let i=0;i<featureRows.length;i++) summary.getRange(`A${32+i}:B${32+i}`).formulas=[[`='Feature Matrix'!A${6+i}`,`='Feature Matrix'!O${6+i}`]]
summary.getRange('A31:B41').format.borders={preset:'all',style:'thin',color:C.line}; summary.getRange('A31:B31').format={fill:C.ink,font:{bold:true,color:C.white}}
summary.getRange('B32:B41').format.numberFormat='0%'
const scoreChart=summary.charts.add('bar',summary.getRange('A31:B41')); scoreChart.title='Current weighted fit for Wollie’s target user'; scoreChart.hasLegend=false; scoreChart.yAxis={numberFormatCode:'0%'}; scoreChart.setPosition('D31','J47')
summary.freezePanes.freezeRows(2); summary.getRange('A:A').format.columnWidth=12; summary.getRange('B:B').format.columnWidth=16

// Market Landscape
title(market,'N','Market landscape','Primary direct set: Wallet, Bilance, YNAB, Spendee, MoneyWiz, PocketSmith and Actual · adjacent UK benchmarks included')
market.getRange('A4:N4').merge(); market.getRange('A4').values=[['Market signal: Open Banking Limited reported 16.5M live UK user connections by late 2025. A public market estimate projects personal-finance software from $1.08B (2022) to $1.59B (2030), 5.1% CAGR. Directionally useful; not a market-share estimate for Wollie.']]
market.getRange('A4:N4').format={fill:C.blue2,font:{color:C.ink,size:10},wrapText:true}; market.getRange('4:4').format.rowHeight=42
table(market,6,['Company','Set','Position','Target / geography','Founded','Status','Traction signal','Pricing','Platforms','Bank coverage','Strengths','Weaknesses / gaps','Threat to Wollie','Sources'],landscape,[20,18,22,34,10,22,28,31,18,34,40,42,20,48],'LandscapeTable',68)
market.getRange(`E7:E${6+landscape.length}`).format.numberFormat='0'
market.freezePanes.freezeRows(6); market.freezePanes.freezeColumns(1)

// Feature matrix
title(matrix,'Q','Weighted feature matrix','0 = absent / poor · 1 = weak · 2 = credible · 3 = strong · weights reflect Wollie’s intended continental-EU low-maintenance customer')
matrix.getRange('A3').values=[['Weight']]; matrix.getRange('B3:N3').values=[weights]; matrix.getRange('A4').values=[['Scale']]; matrix.getRange('B4:N4').values=[featureNames.map(()=> '0–3')]
matrix.getRange('B3:N3').format.numberFormat='0'; matrix.getRange('A3:N4').format={fill:C.mist,font:{bold:true,color:C.gray,size:9},wrapText:true,borders:{bottom:{style:'thin',color:C.line}}}
const fmHeaders=['Competitor',...featureNames,'Weighted fit','Score rationale','Primary sources']
matrix.getRange(`A5:Q${5+featureRows.length}`).values=[fmHeaders,...featureRows.map(r=>[...r.slice(0,14),null,r[14],r[15]])]
matrix.getRange('A5:Q5').format={fill:C.ink,font:{bold:true,color:C.white,size:9},wrapText:true}; matrix.getRange(`A6:Q${5+featureRows.length}`).format={font:{size:9},wrapText:true,verticalAlignment:'top',borders:{insideHorizontal:{style:'thin',color:C.line}}}
for(let i=0;i<featureRows.length;i++) matrix.getRange(`O${6+i}`).formulas=[[`=SUMPRODUCT(B${6+i}:N${6+i},$B$3:$N$3)/(3*SUM($B$3:$N$3))`]]
matrix.getRange(`B6:N${5+featureRows.length}`).conditionalFormats.add('colorScale',{colors:[C.red2,C.amber2,C.green2],thresholds:['min','50%','max']})
matrix.getRange(`O6:O${5+featureRows.length}`).conditionalFormats.add('dataBar',{color:C.green,gradient:true}); matrix.getRange(`O6:O${5+featureRows.length}`).format.numberFormat='0%'
const fmWidths=[18,...featureNames.map(()=>13),14,52,48]; fmWidths.forEach((w,i)=>matrix.getRange(`${col(i)}:${col(i)}`).format.columnWidth=w)
matrix.getRange('5:5').format.rowHeight=50; matrix.getRange(`6:${5+featureRows.length}`).format.rowHeight=62
const fmt=matrix.tables.add(`A5:Q${5+featureRows.length}`,true,'FeatureMatrixTable'); fmt.style='TableStyleMedium2'; fmt.showBandedRows=true
matrix.freezePanes.freezeRows(5); matrix.freezePanes.freezeColumns(1)

// Competitor profiles
title(comp,'J','Competitor profiles','Strategic profiles emphasize how each rival wins, where it breaks, and how Wollie should respond')
table(comp,5,['Competitor','Positioning','Core strengths','Product weaknesses / gaps','Business model / GTM','Moat / switching cost','Wollie response','Threat','12–18 month watch','Primary source'],profiles,[22,28,46,48,30,40,44,15,38,48],'ProfilesTable',82)
comp.freezePanes.freezeRows(5); comp.freezePanes.freezeColumns(1)

// Reddit evidence
title(red,'J','Reddit evidence','Paraphrased public posts; not a representative survey. Upvotes are directional and were captured from search results where available.')
const redditRows=reddit.map((r,i)=>[i+1,new Date(`${r[0]}T12:00:00Z`),...r.slice(1)])
table(red,5,['ID','Date','Subreddit','Product / scope','Signal type','Pain theme','User problem (paraphrased)','Strategic implication','Strength','Upvotes','Source URL'],redditRows,[7,13,20,22,18,30,60,58,12,10,66],'RedditEvidenceTable',70)
red.getRange(`B6:B${5+redditRows.length}`).format.numberFormat='yyyy-mm-dd'; red.getRange(`A6:A${5+redditRows.length}`).format.numberFormat='0'; red.getRange(`J6:J${5+redditRows.length}`).format.numberFormat='#,##0'
red.freezePanes.freezeRows(5); red.freezePanes.freezeColumns(2)

// Pain themes
title(pains,'I','Pain themes','Counts are formula-driven from the Reddit Evidence sheet. Priority combines relative frequency, high-signal posts, impact and strategic fit.')
pains.getRange('A3:I3').values=[['Theme','Evidence count','High-signal count','User impact (1–5)','Wollie fit (1–5)','Priority','User language','Recommended response','Example sources']]
const painRows=painThemes.map((r,i)=>[r[0],null,null,r[1],r[2],null,r[3],r[4],reddit.filter(x=>x[5]===r[0]).slice(0,2).map(x=>x[9]).join(' | ')])
pains.getRange(`A5:I${5+painRows.length}`).values=[['Theme','Evidence count','High-signal count','User impact','Wollie fit','Priority','User language','Recommended response','Example sources'],...painRows]
for(let i=0;i<painRows.length;i++) { const rr=6+i; pains.getRange(`B${rr}`).formulas=[[`=COUNTIF('Reddit Evidence'!$F$6:$F$${5+redditRows.length},A${rr})`]]; pains.getRange(`C${rr}`).formulas=[[`=COUNTIFS('Reddit Evidence'!$F$6:$F$${5+redditRows.length},A${rr},'Reddit Evidence'!$I$6:$I$${5+redditRows.length},"High")`]]; pains.getRange(`F${rr}`).formulas=[[`=(B${rr}/MAX($B$6:$B$${5+painRows.length}))*45%+(C${rr}/MAX($C$6:$C$${5+painRows.length}))*15%+(D${rr}/5)*20%+(E${rr}/5)*20%`]] }
pains.getRange(`A5:I${5+painRows.length}`).format.borders={insideHorizontal:{style:'thin',color:C.line}}; pains.getRange('A5:I5').format={fill:C.ink,font:{bold:true,color:C.white,size:9},wrapText:true}; pains.getRange(`A6:I${5+painRows.length}`).format={font:{size:9},wrapText:true,verticalAlignment:'top'}
pains.getRange(`F6:F${5+painRows.length}`).format.numberFormat='0%'; pains.getRange(`F6:F${5+painRows.length}`).conditionalFormats.add('dataBar',{color:C.green,gradient:true})
;[28,14,14,14,14,14,42,58,62].forEach((w,i)=>pains.getRange(`${col(i)}:${col(i)}`).format.columnWidth=w); pains.getRange('5:5').format.rowHeight=32; pains.getRange(`6:${5+painRows.length}`).format.rowHeight=66
const pt=pains.tables.add(`A5:I${5+painRows.length}`,true,'PainThemesTable'); pt.style='TableStyleMedium2'; pt.showBandedRows=true; pains.freezePanes.freezeRows(5)

// Opportunities
title(opp,'L','Differentiation opportunities','Priority = desirability 30% + differentiation 25% + feasibility 20% + trust 15% + strategic fit 10% · scored 1–5')
opp.getRange('D3:H3').values=[[30,25,20,15,10]]; opp.getRange('C3').values=[['Weights →']]; opp.getRange('D3:H3').format.numberFormat='0"%"'; opp.getRange('C3:H3').format={fill:C.mist,font:{bold:true,color:C.gray,size:9}}
const oppRows=opportunities.map(r=>[r[0],r[1],r[2],...r.slice(3,8),null,...r.slice(8)])
opp.getRange(`A5:L${5+oppRows.length}`).values=[['Opportunity','Evidence','User outcome','Desirability','Differentiation','Feasibility','Trust leverage','Strategic fit','Priority score','Horizon','Build / prove','Guardrail'],...oppRows]
for(let i=0;i<oppRows.length;i++){const rr=6+i; opp.getRange(`I${rr}`).formulas=[[`=SUMPRODUCT(D${rr}:H${rr},$D$3:$H$3)/(5*SUM($D$3:$H$3))`]]}
opp.getRange('A5:L5').format={fill:C.ink,font:{bold:true,color:C.white,size:9},wrapText:true}; opp.getRange(`A6:L${5+oppRows.length}`).format={font:{size:9},wrapText:true,verticalAlignment:'top',borders:{insideHorizontal:{style:'thin',color:C.line}}}; opp.getRange(`I6:I${5+oppRows.length}`).format.numberFormat='0%'; opp.getRange(`I6:I${5+oppRows.length}`).conditionalFormats.add('dataBar',{color:C.green,gradient:true}); opp.getRange(`J6:J${5+oppRows.length}`).dataValidation={rule:{type:'list',values:['0–3 months','3–6 months','6–12 months']}}
;[32,48,42,14,14,14,14,14,15,16,58,48].forEach((w,i)=>opp.getRange(`${col(i)}:${col(i)}`).format.columnWidth=w); opp.getRange('5:5').format.rowHeight=36; opp.getRange(`6:${5+oppRows.length}`).format.rowHeight=78
const ot=opp.tables.add(`A5:L${5+oppRows.length}`,true,'OpportunitiesTable'); ot.style='TableStyleMedium2'; ot.showBandedRows=true; opp.freezePanes.freezeRows(5); opp.freezePanes.freezeColumns(1)

// Positioning
title(pos,'H','Positioning recommendation','Position Wollie around a specific European household outcome—not around generic aggregation, “AI”, or feature breadth')
section(pos,'A4:H4','Recommended position')
pos.getRange('A5:H7').merge(); pos.getRange('A5').values=[['Wollie gives European households one trustworthy number for what they can spend—after bills, budgets and shared expenses.']]; pos.getRange('A5:H7').format={fill:C.green2,font:{bold:true,size:18,color:C.ink},wrapText:true,verticalAlignment:'center',horizontalAlignment:'center'}
section(pos,'A9:H9','Positioning choices')
const positioningRows=[
  ['Beachhead','Continental European couples / households with two or more accounts who want control but reject spreadsheet or zero-based-budget maintenance.','Narrow enough to create tailored shared-money and coverage proof.'],
  ['Category','A calm European household money control app.','Avoid “all-in-one personal finance” and “budget tracker”; both are saturated.'],
  ['Core promise','Know what is safe to spend—and why.','The explanation and confidence state are part of the feature.'],
  ['Proof 1','Freshness and sync status for every account.','Turns a hidden failure mode into visible trust.'],
  ['Proof 2','Mine / yours / ours with ownership ratios.','Creates separation from Bilance, Wallet and simple shared logins.'],
  ['Proof 3','Correct a category once; Wollie fixes similar transactions with preview and undo.','Directly answers repeated Reddit pain.'],
  ['Price story','One complete plan at €59/year, priced below complex leaders.','Lead with saved time and reliable coverage, not a longer feature checklist.'],
  ['Avoid segment','Strict envelope-method devotees, investment/tax power users, users needing 60-year forecasts.','YNAB, Actual, MoneyWiz and PocketSmith already win those jobs.'],
]
table(pos,10,['Decision','Recommendation','Why'],positioningRows,[22,68,58],'PositioningChoices',58)
section(pos,'A21:H21','Messaging options')
const messages=[
  ['Primary headline','Know what you can spend. Trust why.','Best after sync confidence and explanation ship.'],
  ['EU proof line','Your European accounts, bills and shared spending—kept in one clear monthly plan.','Use only with public coverage checker.'],
  ['Household line','Mine, yours and ours—without the spreadsheet.','Use after ownership ratios and partner mode.'],
  ['Trial CTA','Connect an account. See your real monthly picture in minutes.','Better than “Explore every feature.”'],
  ['Trust line','Read-only access. Clear permissions. Export or delete your data anytime.','Must link to precise privacy controls.'],
]
table(pos,22,['Use','Copy','Proof requirement'],messages,[22,72,58],'MessagingTable',52)
pos.freezePanes.freezeRows(2)

// Source Index
title(src,'E','Source index','Primary sources were preferred for product facts; Reddit is stored row-by-row on the Reddit Evidence sheet. Accessed 2026-07-15.')
const sourceRows=sources.map((r,i)=>[i+1,...r,new Date('2026-07-15T12:00:00Z')])
table(src,5,['ID','Type','Title','URL / local source','Claims supported','Accessed'],sourceRows,[8,16,34,82,62,14],'SourceIndexTable',52)
src.getRange(`F6:F${5+sourceRows.length}`).format.numberFormat='yyyy-mm-dd'; src.freezePanes.freezeRows(5)

// Global polish
for (const sheet of [summary,market,matrix,comp,red,pains,opp,pos,src]) {
  // Preserve intentionally styled white header text and bold callouts.
  // A used-range font assignment would overwrite those local styles.
  sheet.getRange('A1').format.font={name:'Aptos Display',size:20,bold:true,color:C.white}
}

// Compact QA outputs before export
const checks=[]
checks.push((await wb.inspect({kind:'table',range:'Executive Summary!A1:J30',include:'values,formulas',tableMaxRows:30,tableMaxCols:10,maxChars:7000})).ndjson)
checks.push((await wb.inspect({kind:'table',range:`Feature Matrix!A3:Q${5+featureRows.length}`,include:'values,formulas',tableMaxRows:20,tableMaxCols:17,maxChars:7000})).ndjson)
checks.push((await wb.inspect({kind:'table',range:`Opportunities!A3:L${5+oppRows.length}`,include:'values,formulas',tableMaxRows:20,tableMaxCols:12,maxChars:7000})).ndjson)
checks.push((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A',options:{useRegex:true,maxResults:300},summary:'final formula error scan',maxChars:5000})).ndjson)
await fs.writeFile(`${OUT}qa_inspect.ndjson`,checks.join('\n'))

for (const sheet of [summary,market,matrix,comp,red,pains,opp,pos,src]) {
  const preview=await wb.render({sheetName:sheet.name,autoCrop:'all',scale:1,format:'png'})
  await fs.writeFile(`${OUT}preview_${sheet.name.replaceAll(' ','_')}.png`,new Uint8Array(await preview.arrayBuffer()))
}

const xlsx=await SpreadsheetFile.exportXlsx(wb)
await xlsx.save(OUTPUT)
console.log(JSON.stringify({output:OUTPUT,sheets:9,redditRows:redditRows.length,competitors:landscape.length,opportunities:oppRows.length}))
