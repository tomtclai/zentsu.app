# Dial website consistency and search audit, September 8, 2026

## Scope and authority

Founder authorized implementation, commit and push on the website repository's current `main` branch. Preflight `git status --short` was empty. Only the independent `zentsu-site` repository is changed. App code, App Store metadata, ads, TestFlight and the parent repository are excluded.

Product facts come from `../Dial/metadata/version/1.2.6/` and `../Dial/metadata/app-info/`. The founder confirms these corrected descriptions reflect shipping 1.2.5; 1.2.6 is WAITING_FOR_REVIEW. This work does not advertise its unreleased weight-average or celebration changes. Pricing remains sourced from `_data/dial_prices.yml` through `npm run sync:dial-prices`.

Read parent/site AGENTS.md, brandVoice.md, `.planning/PROJECT.md`, relevant DECISIONS.md entries: Dial medication tracking rather than injection-only positioning; July 10 estimated levels and free Watch glance/Pro logging split; September 4 eligible annual 14-day trial; September 5 website authorization; September 7 tablets; September 8 Brazil prices scheduled for September 10. Current explicit product facts take precedence over stale July summaries.

## Before implementation: findings and keep/drop decision

This section was written before implementation.

### Existing strengths to keep

- Jekyll produces crawlable HTML, self-canonicals, a sitemap, and reciprocal HTML hreflang clusters from `_data/alternates.yml`. Locale navigation requires an explicit choice, not an IP/browser-language redirect.
- Existing locale coverage is substantial: 34 marketing routes including the separate Spain page, 33 support routes and 33 privacy routes. The generic Spanish alternate aliases the Mexican route; it is not a separate page. Keep existing routes rather than add medication doorway pages.
- Free phone logging, Pro chart/export distinctions, localized price data, real screenshots, local fonts, support contacts and app-specific privacy policies already exist.
- Existing English medication-log guide and three relevant blog posts provide a better starting point than new thin keyword pages.

### Problems to correct

| Priority | Evidence before implementation                                                                                                                                                                      | Change                                                                                                                                                                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | FAQs say Dial does not calculate anything; privacy policies prohibit all dose calculations despite the shipping input-based unit converter. Most locale medication lists omit tablets/orforglipron. | Explain recording injections and tablets; distinguish arithmetic on supplied mg and mg/mL from prescribing; state tablets have no estimated-level curve.                                                                                             |
| High     | Weight paragraphs say data never leaves the device, followed by optional Health read/write paragraphs. FAQ storage statements are too broad.                                                        | Specify medication/core-record private iCloud, separate local weight with optional Health, local photos, no Zentsu account or analytics. Do not promise complete restoration.                                                                        |
| Medium   | `_includes/dial/head.html` presents Pro purchases as additional offers for the app itself, with English-only plan names and no IAP distinction.                                                     | Describe the app as a free download with a zero-price offer. Keep actual optional Pro prices in visible local pricing/FAQ rather than suggest the download costs those amounts. Do not invent a rating to satisfy Google's rich-result requirements. |
| Medium   | Marketing download URLs use a generic Apple URL regardless of the page's primary storefront. Some blog anchors say App Store but point to `/dial/`.                                                 | Keep existing Apple campaign parameters; use direct country-appropriate Apple links. Give articles honest website links plus actual Apple listing links.                                                                                             |
| Medium   | Local support descriptions are often only 'Support for Dial'; privacy titles omit Dial. Medication intent is absent from some headlines/descriptions.                                               | Improve localized titles, snippets, headings and task-focused answers without keyword piles. Escape metadata at the shared HTML boundary.                                                                                                            |
| Medium   | Existing checks cover marketing locales but not every support/privacy canonical/hreflang relationship or truthful app-offer semantics.                                                              | Add bounded regression checks to the existing test system and review visual differences.                                                                                                                                                             |

### Uploaded clippings: agreement and limits

Read both supplied Markdown clippings in full: **Get app page to rank on google** (Udemy lecture 6766398) and **The importance of ranking your actual app store URL** (lecture 6766372). They agree that useful website content can target relevant searches and direct readers to an app listing. The second distinguishes a website result from an Apple/Google store result and advocates links to the listing itself.

Keep useful task-specific content, natural intent in titles/headings/descriptions, descriptive internal links and direct Apple listing links in relevant existing articles. A website result and an Apple listing result are separate opportunities, not interchangeable URLs.

Drop the implication that repeated keywords or added content volume cause rankings. Drop social activity as a proven ranking factor, unverified claims about ratings causing Google rank, guaranteed first-page placement, paid/spam links, fabricated reviews and repetitive doorway pages. No social campaign, backlink purchasing or new analytics is introduced. Zentsu cannot control Apple's page canonicalization, crawl policy or Google indexing of Apple URLs.

### Google primary documentation retrieved September 8

All seven URLs returned HTTP 200. Research copies were saved outside the repository in `/tmp/dial-seo-research/`.

- [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions): complete self/reciprocal fully-qualified alternates, valid language/region codes and fallback. HTML, headers and sitemap methods are equivalent; retain the existing HTML implementation, do not duplicate it in XML without need.
- [Title links](https://developers.google.com/search/docs/appearance/title-link): descriptive concise titles matching visible language/content; avoid repetition and keyword stuffing. Google may choose a different title.
- [Snippets](https://developers.google.com/search/docs/appearance/snippet): useful page-specific descriptions; Google primarily generates snippets from page content and may substitute them. Character counts are editorial aids, not ranking guarantees.
- [Crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable): actual `a href` links and contextual descriptive anchor text. Preserve crawlability without JavaScript.
- [Helpful people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): help an existing audience finish a task, give accurate sourcing, avoid arbitrary word counts or search-first mass publishing. Health-related claims deserve particular care; this site explains software, not treatment.
- [Software application structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app): free apps use `offers.price: 0`; a qualifying real review or aggregate rating is also required for Google's software rich result. Truthful incomplete eligibility is preferable to invented evidence. Schema does not guarantee a result.
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): absolute canonical URLs and a robots sitemap declaration; submission is a hint, not an indexing guarantee. Submit through Search Console only with existing verified access.

Read seo-audit and copywriting skills, their international SEO, AI-writing detection, copy-framework and natural-transition references, plus the unslop skill. Apply primary Google guidance where skill heuristics overstate canonical behavior, arbitrary lengths or site-wide effects. Brand rules override generic hype/testimonial/founder-story frameworks.

## Implementation and verification

Implemented on the website repository `main` working tree (founder-authorized push). Pre-existing uncommitted website work was kept and folded into this pass.

### Copy and metadata changes

- `_data/dial_faq.yml`: English medication and calculate answers already stated orforglipron, tablets/Rybelsus, injectable-only estimates, no tablet level curve, and arithmetic-only unit conversion. Matching answers authored for every other FAQ locale. Norwegian FAQ split out of a duplicated `da` block into its own `no` locale. Pricing answers remain empty `type: pricing` placeholders filled at render from `_data/dial_prices.yml`.
- `_data/dial/*.yml`: remaining locale `level.body`, `logging.body`, and `privacy.body` gaps closed against the English/German/French/Japanese/Korean models (tablet logging without injection site, no tablet level curve, optional private iCloud for core records, local weight with optional Health, local photos). Spain/Mexico pages already matched logging/privacy; level wording refreshed only where needed.
- `*/dial/support.html` and `*/dial/privacy.html`: thin one-line meta descriptions and privacy titles that omitted Dial replaced with Dial-named, task-specific snippets.
- English `hero.legal` left as-is: it already states Dial does not calculate doses and does not replace prescriber guidance. No separate footnote field exists in the current templates.
- Prior keep items retained: storefront country codes, free-only schema/tests, escaped meta, country App Store URLs, German/French titles, three blog App Store links, English FAQ items 1-2, Brazil prices unchanged.

### Checks run

- `npm test` exited 0 (build, HTML validate, links, app visibility, sitemap, Bench accessibility, site validate, Dial prices self-test, unit tests, Dial locale validate, non-visual e2e; 88 Playwright e2e passed, 8 skipped).
- Visual Playwright suite not re-baselined: copy/meta-only finishing pass; layout template edits already present from prior dirty work were kept, not re-snapshotted.

### Commit, push, live check

- Website-only commit on `zentsu-site` `main`, then `git push` (founder authorized). Parent monorepo, ASC, and ads untouched.
- Live verification: fetch `https://zentsu.app/dial/` and a sample of localized FAQ/support/privacy routes after deploy and confirm updated medication/calculate wording and thickened meta where applicable.

## Search Console and limitations

No verified Search Console access established at preflight. Existing website docs call for a baseline but contain no evidence of access or verification. Authorized tooling/session was not used to submit a sitemap in this pass. Never enter credentials or manufacture verification. Organic impressions, clicks, indexing, ranking and causal conversion impact remain unknown without Search Console data. Apple listing indexing is outside Zentsu's control.
