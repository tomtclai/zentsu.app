# Dial landing page: hero order, proof row, and plan heading, September 12, 2026

Implemented on branch `codex/dial-site-conversion-20260912`, in an isolated worktree created from
website `main` at `8f6397b9`. Only the `zentsu-site` repository changed. App code, App Store
Connect, Apple Ads, pricing, entitlements and the parent monorepo were not touched. No push, no
deployment, no App Review submission.

**Conversion lift is unproven.** This work fixes observed presentation defects. It has no measured
effect on downloads, purchases or revenue, and no baseline exists to measure one against. See
"Measurement" below.

## Evidence and how the page was inspected

`origin/main` and the worktree HEAD are both `8f6397b9`, so the defects below were live on
`https://zentsu.app/dial/` at the time of this work. Inspection used the built site served through
Wrangler at 375x812 (mobile-webkit and Chromium) and 1280x800, in light and dark, on `en`, `de`,
`ar`, `he`, `ja`, `ko`, `fr`, `es`, `es-es`, plus element geometry read from the live DOM rather
than from the committed baseline images, which were stale.

Before and after captures: `~/.cache/dial-site-conversion-20260912/`.

| File                                | What it shows                         |
| ----------------------------------- | ------------------------------------- |
| `en-mobile-hero-before-after.png`   | The English first viewport at 375x812 |
| `de-mobile-hero-before-after.png`   | German, the longest hero copy         |
| `ar-mobile-hero-before-after.png`   | Arabic, right to left                 |
| `en-desktop-hero-before-after.png`  | English at 1280x800                   |
| `en-mobile-full-{before,after}.png` | Full-page English mobile render       |

The "before" side was rendered from a clean `git archive HEAD` build, not from the committed
baselines.

## Changes

### 1. The hero quick answer rendered above the app icon and the headline on phones

**Observed.** `.dial-hero-copy` is a flex column. The mobile block in `_includes/css/dial/hero.css`
assigns an explicit `order` to every hero child, but `.dial-quick-answer`, added in `8f6397b9`,
never got one. It kept the initial order of `0` and sorted ahead of `order: 1`. Measured at 375
points wide: the quick answer sat at y=93 with the brand line at y=319 and the headline at y=383.
The first viewport of every locale opened with 209 points of unattributed body text. On desktop the
same omission happened to produce the intended position, so the defect was mobile only.

**Changed.** Every hero child now carries an explicit order at both breakpoints. On phones the
quick answer moved to after the download action and the hero screenshot, which is where a reader
who wants the medication list will look, and which keeps the App Store badge and the screenshot in
the first viewport. Measured on English at 375 points: the headline moved from y=383 to y=157, the
App Store badge link from y=545 to y=319, and the hero screenshot from y=739 to y=512. Desktop order
and desktop geometry are unchanged: the headline stays at y=199, the quick answer at y=409 and the
badge at y=645, in the sequence brand line, headline, category, quick answer, free line, action,
storage note, platforms, disclaimer.

**Verification.** `tests/e2e/hero-above-the-fold.spec.mjs` now asserts the top offset of every hero
element in sequence, on `en`, `de`, `ar` and `ja` at 375 points and on `en` at desktop width. The
assertion was confirmed to fail when the new `order` rule is removed, and to pass with it.

### 2. The English "Why Dial" row contradicted its own icons

**Observed.** The four icons in `_includes/dial/proof.html` are keyed by loop index and date from
`aa3a9ac`, where the points were the cycle ring, opening without an account, the Lifetime single
purchase, and the estimated level: a gauge, a padlock, a shopping bag, a chart. The site rebuild
(`ce61179`) rewrote the English points only. English therefore showed a padlock next to "Cycle ring
and next reminder on Apple Watch" and a shopping bag next to "Dial Pro quick logging from your
wrist", while the other 33 locales still read the original four claims. The English row also spent
three of its four slots restating the free and Dial Pro split that the hero states twice and the
plans section states in full.

**Changed.** English returns to the four points the other 33 locales carry. The icons match their
claims again, the row is consistent across all 34 locales, and the row now makes four distinct
checkable statements, including the two the rest of the page states nowhere else: that Dial opens
without an account, and that a single Lifetime purchase exists. Nothing was lost: the free phone log
and its lack of an entry cap are in `hero.free_line` and `plans.free_summary`; wrist logging and
export are in the Watch, supporting and plans sections.

**Verification.** Visual baselines re-recorded and reviewed for all 34 locale renders; icon and
claim pairing checked by eye on English, Arabic and Japanese.

### 3. The hero said the same thing three times

**Observed.** `8f6397b9` added `hero.quick_answer` on top of a hero that already carried
`hero.free_line`, `hero.detail` and `hero.legal`. In every locale the quick answer states what Dial
logs, what an entry keeps, that the phone log is free without an account, and what Dial Pro adds.
`hero.detail` restated the free and Dial Pro split, and `hero.legal` restated it again after its
disclaimer. Moving the quick answer next to `hero.detail` on phones made the repetition adjacent and
obvious.

**Changed, in all 34 marketing locales.**

- `hero.legal` is now the disclaimer alone. The trailing "Dial Pro adds Watch logging, charts and
  exports" sentence is gone. This is the one-sentence legal line the unreleased changelog already
  claimed; the previous commit had shortened three sentences to two.
- `hero.detail` now carries only the storage fact, worded from that locale's own reviewed
  `privacy.body`: medication records can sync through the user's own iCloud, weight and progress
  photos stay on the device. The sentences it lost are stated by `hero.quick_answer` directly above
  it, and by the logging, level, report and privacy sections.

Every edit is a removal or a condensation of copy that already existed in that language. No new
claim was introduced, no English fallback was added, and the correct free and Pro boundary, the one
medication and one reminder limits, the injectable-only estimated level, and the private-iCloud
versus local-weight-and-photos distinction are all unchanged.

**Verification.** `npm run validate:dial-locales` passes 34 locales and 340 checks with 0 failures,
including key parity against English, the `hero.legal` copy-presence check, and the em-dash guard.

### 4. The plans section heading was unstyled

**Observed.** `.dial-section-heading` is used by the supporting section and the plans section, but
the type rule was scoped to `.dial-supporting .dial-section-heading h2`. At 1280 points wide,
"Keep the rest of the record together." rendered at 41.6px and "Start with the free phone log." at
the browser default 24px. The pricing section's heading read as less important than every other
section on the page.

**Changed.** The rule is scoped to `.dial-section-heading h2` in both `stories.css` and
`responsive.css`, so the two sections that use that container share one type scale. The selector
covers no other element on the site.

**Verification.** Measured 41.6px at desktop and 26.4px at 375 points, matching the supporting
section; reviewed in the re-recorded light and dark baselines.

## Checks

Run from `/Users/tom/Documents/code/zentsu-site-conversion-20260912`.

| Command               | Result                                                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`            | exit 0. Build, HTML validation, link and fragment check, app visibility, sitemap invariants, Bench accessibility, site validation, Dial price self-test, unit tests, 34-locale Dial validator, and 93 Playwright functional and axe tests passed. |
| `npm run test:visual` | exit 0, 36 comparisons passed against the re-recorded baselines.                                                                                                                                                                                  |

The committed visual baselines were already stale before this work: at `8f6397b9`, `npm run
test:visual` failed 32 of 36 comparisons because the baselines predate `14d6c04`, `f301a82` and
`8f6397b9`. All 36 were re-recorded here and each changed render was reviewed. `npm test` passed at
`8f6397b9` as well, so the functional suite is not what regressed.

## Deliberately not changed

- **The estimated-level screenshots are cropped through a line of text.** Every `dial-web-level`
  asset, in all 33 image sets, ends mid-way through the "How this estimate works" row. The bottom
  boundary is not at the same offset in every locale, so a blanket crop is not safe, and a correct
  fix is a re-capture through the parent repository's screenshot pipeline, which this task does not
  cover. Reported as a follow-up.
- **The price note reads "Subscriptions renew until canceled" while Lifetime is selected.** The
  plan label and the price both say "once", and the note is a general statement rather than a claim
  about Lifetime, so nothing on the page is false. Separating the renewal sentence from the
  storefront sentence would mean re-cutting renewal-disclosure copy in 34 locales, which is
  higher-risk legal-adjacent work than anything else in this pass. Reported as a follow-up with the
  recommendation to gate the renewal sentence on the selected plan through the existing
  `:has()` pattern in `plans.css`, keeping the storefront sentence always visible.
- **The narrow centred blocks.** The boundary section, the guide card and the FAQ list are centred
  while the full-width sections align left. That is the page's existing pattern for narrow prose
  blocks, not a regression, so it was left alone.
- **Everything the Moonly interview suggests but does not evidence.** No questionnaire, urgency,
  discount, sharing loop, hard paywall, testimonial, rating or redesign was added.

## Measurement

There is still no verified baseline for website traffic, website-to-store conversion, or the
website's contribution to purchases. No analytics, pixel, or attribution system was added, and none
should be inferred from this work. The existing campaign tokens, placement names and storefront
links in `_data/dial_campaign.yml` and `_includes/dial-store-url.html` are unchanged, so
App Store Connect campaign reporting stays comparable across this change.

A before-and-after read of downloads would be confounded by concurrent App Store and app changes,
including the approved custom-product-page keyword assignments of September 12 and the 1.2.9 build
sitting in TestFlight. Do not attribute any movement in downloads or purchases to this change.
Apple's guidance on suppressed small campaign groups still applies: a missing row is not zero.

## References

- [Apple campaign links and privacy thresholds](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)
- [Google helpful, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [MDN: CSS order](https://developer.mozilla.org/en-US/docs/Web/CSS/order)
