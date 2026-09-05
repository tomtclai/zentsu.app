# Dial website growth and maintenance

## Rollout and measurement

The rebuild leads with the free dose log, identifies paid features before the download,
and uses actual product images. Recordkeeping guides should answer distinct practical
questions with product-specific steps. Do not create near-identical medication pages.

Baseline traffic, conversion, and revenue are unknown. Before interpreting results,
record a comparable 28-day period from Google Search Console and App Store Connect:

- Search Console: Dial page and guide impressions, clicks, click-through rate, queries,
  country, and device. Check URL inspection and sitemap discovery after deployment.
- App Store Connect: campaign-attributed downloads and available conversion/revenue
  measures using the existing provider token and placement names in
  `_data/dial_campaign.yml`. Keep names stable to allow comparisons.
- Review after 28 days, then compare the next equivalent period. Separate search
  discovery from App Store acquisition. Low counts, seasonality, listing changes, and
  acquisition campaigns prevent treating a simple before/after change as causation.

Apple suppresses small campaign groups; absence of a row is not zero downloads.
Do not add health-event telemetry or advertising pixels to measure this website.
Choose the next change from observed weak points: search impressions without clicks,
qualified visits without downloads, or downloads without paid adoption. Do not claim
that the redesign itself increased customers before evidence exists.

## Product claims before each release

1. Check `Dial/metadata/review/STATUS.md` and the live store version. Verify important
   feature and entitlement claims against the matching release commit, not only HEAD.
2. Separate free phone recording from Pro charts, exports and wrist logging. Preserve
   the one-medication and one-reminder free limits. Avoid a headline or search snippet
   that implies every depicted feature is free.
3. Describe medication levels as estimates from recorded doses. Never promise measured
   levels, treatment outcomes, dose recommendations, or clinically validated benefits.
4. Explain optional private iCloud storage accurately. Weight and photo storage are
   separate/local; do not promise complete cross-device restoration.
5. Keep prices sourced from `_data/dial_prices.yml`; refresh through the existing ASC
   sync script after an authorized pricing change. Verify trials and Family Sharing
   independently before adding promotional claims.
6. Use genuine screenshots and official unmodified Apple badges. Add ratings only
   from verified evidence, with consistent visible attribution and schema.

At research time, live 1.2.1 was build 52, release commit `5f2ea68b` in the parent
repository. Version 1.2.2 was in review. Do not infer live availability of Time
Sensitive reminders, one-hour snoozing, offer-code redemption, or locked chart previews
from development code. Recheck this dated fact before the next copy update.

## Maintaining the 33 locales

Keep product structure in shared Liquid includes and translated copy in locale data.
Preserve localized URLs, self-canonicals, reciprocal language alternates, localized
screenshots, and storefront-derived prices. A new English guide must not declare
nonexistent translations. Add alternate-language links only when real translations
exist and have been reviewed.

FAQ price answers use `type: pricing`, independent of question order. Application
schema includes a free-download offer plus the existing source-driven paid offers.
Keep the focused schema tests alongside the full build, link, locale, functional,
accessibility, and visual checks. Review intentional screenshot changes before updating
baselines. Preserve self-hosted fonts and responsive image assets.

Valid schema is not a promise of a Google rich result. Software-app eligibility also
requires a qualifying real rating or review. FAQ markup is retained for semantic
consistency, but Google discontinued FAQ rich results in May 2026.

## Primary references

- [Google people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google software application schema](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [Google documentation updates, including FAQ retirement](https://developers.google.com/search/updates)
- [Apple campaign links and privacy thresholds](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)
- [Apple marketing artwork guidelines](https://developer.apple.com/app-store/marketing/guidelines/)
