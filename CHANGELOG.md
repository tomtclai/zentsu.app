# Changelog

All notable changes to this website are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2026-09-04]

### Added

- Apple Smart App Banner on every Dial locale page (`apple-itunes-app`).
- Campaign-ready App Store links tagged by placement (hero, sticky, watch, plans, FAQ, closer, nav, QR, plans card). Placement-tagged App Store links now include the App Store Connect provider token; JSON-LD download URLs stay untagged.
- App Store badges in the hero, Watch section, Pro card, sticky bar, and closer.
- Sticky App Store bar that appears only while the hero and closer badges are off-screen, with a Get Dial text button on phones.
- Free line in the Dial hero (`hero.free_line`) across 33 locales.
- Full five-molecule medication coverage in logging copy (semaglutide, tirzepatide, liraglutide, dulaglutide, exenatide, plus custom), using each locale's App Store names.
- Object-led Dial hero, a desktop App Store QR code, and a Get Dial nav link on Dial pages.
- Accordion FAQ with eight unique answers, including what happens if you switch phones.
- Three GLP-1 explainers (`/blog/2026/how-long-semaglutide-stays-in-your-system/`, `/blog/2026/missed-glp-1-dose-what-to-record/`, `/blog/2026/bring-your-glp-1-log-to-your-doctor/`) and a Dial-only Learn group in the footer.

### Changed

- Dial landing page: calmer type, three feature stories, and a five-card grid for history, report, inventory, reminders, and imports.
- The Pro card shows one price at a time through a Lifetime / Annual / Monthly control (Lifetime selected). Currency sits on the price row.
- On phones, the App Store badge, the secondary CTA, and the top of the phone sit in the first viewport.
- Native copy for the redesign across 32 locales. Meta descriptions are 155 characters or shorter. The Dial copy-length guard now fails the site test unless `DIAL_STRICT_COPY=0`.

### Fixed

- Keep explicit translated Dial URLs on the requested locale when the browser or saved preference
  names another language; automatic first-visit localization still applies on `/dial/`.

- FAQ structured data: question 1 now uses `copy.hero.category` instead of a missing `copy.category` (which emitted `"text": null` and invalidated FAQPage). The visible FAQ now includes that answer. Privacy FAQ no longer doubles the period. Plan prices read as amount, terms, then name, not `$19.99/per year`.
- `llms.txt` described Bench as a strength-training log and listed Coil as a live iOS app. It now covers only Dial and Bench as they actually ship. It now also points at CSV export, the switch-phones FAQ, and the three explainers.
- Dial currency picker no longer collides with `locale.js` over a shared `STORAGE_KEY`.
- Picking a language on a Dial page now sticks. `locale.js` and `dial-currency.js` are classic scripts on the same page, so their identically named top-level helpers shared one global scope and the currency file's `writeStored` replaced the locale file's. The picker wrote the chosen language into the currency key, left `zentsu-locale` empty, and the next page load sent the visitor back to their browser language. Both files are now wrapped in an IIFE, and a Playwright spec covers switching, reload, and cross-page persistence.

## [Unreleased]

### Added

- English Dial medication-recording guide at `/dial/medication-log/`, with a matching landing-page
  guide section covering what to record, how to correct entries, and how to prepare a shareable
  record.
- Source checks for the guide route, canonical metadata, privacy/support links, and the free phone
  log versus Dial Pro boundary.

- `npm run sync:dial-prices` pulls live Dial customer prices from App Store Connect
  into `_data/dial_prices.yml` for every marketing-page storefront.
- Dial marketing, support, and privacy pages for the remaining 1.2 locales, each under its own
  prefix, with matching language-picker names and store listing URLs.
- Spanish Dial marketing page at `/es/dial/`, plus translated support and privacy pages, with
  reciprocal hreflang, a language switcher, a Spanish social banner, and Spanish in-app screenshots.
- Locale-list language picker on localized pages, driven by `_data/alternates.yml`, with a
  first-visit default from the browser language and an explicit picker choice stored in
  `localStorage`.

### Changed

- Refresh the English Dial hero and section copy around the free phone log, with Dial Pro clearly
  scoped to Apple Watch logging, charts, and PDF or CSV export.
- Exclude internal tests, reports, docs, and tool configuration from the generated public site and
  make Playwright use the checked-out `_site` directory by default.

- Remove the Dial release-news mailing list from every language page. The app
  is on the App Store, so the close is the badge only.
- Keep the Dial language picker on language only. Currency is a separate
  dropdown next to the plan prices. Each language still presets its App Store
  storefront, and a chosen currency persists across language pages.
- Point every Dial marketing page at localized in-app screenshots for that
  language, including Simplified and Traditional Chinese, instead of the
  English crops.
- Rewrite every Dial hero as a single native headline and drop the two-color
  coral split that only worked in English.
- Replace the Hindi, Ukrainian, and Croatian App Store badges. The AMS badge API
  served the US-UK SVG for those three. Ukrainian and Croatian now come from the
  Marketing Tools language dropdown. Hindi is not in that dropdown; it uses Apple's
  official Hindi artwork (App Store / पर डाउनलोड करें).
- Show each Dial marketing page's App Store currency and amounts from live ASC
  for that language's primary storefront, instead of U.S. dollar prices on every locale.
- Shorten Dial hero headlines in most locales so they wrap in two or three lines at 10ch,
  without a mid-word hyphen through GLP-1.
- Order the Dial language picker by total speakers, highest first, instead of add-order.
- Rebuild the Dial closing "Get Dial" block as a two-column close (icon plus title, then form)
  so long and CJK headings no longer stack into a poster-tall column.
- Improve Japanese2k emoji coverage, preserve the high-confidence mappings, and make the 16 active
  fallback SVG icons transparent and revisioned for readable light and dark mode rendering.
- Replace the misleading pregnancy emoji for お腹 with dedicated stomach artwork and remove 738
  unreferenced Japanese2k SVG files.
- Replace Bench's custom hero download button with Apple's official, self-hosted Download on the
  Mac App Store badge and add the required Apple trademark credit.
- Self-host the Inter Tight and JetBrains Mono web fonts instead of requesting them from Google.
- Gate Cloudflare Pages deployments on the complete production validation suite.
- Use extensionless canonical, sitemap, and internal URLs throughout the site.
- Clarify app-specific storage and Apple service use in the general privacy policy.
- Align the Bench privacy policy, mailing-list tag, FAQ, and structured data with its live product
  status and ongoing product-notes list.

### Fixed

- Use POSIX `grep` in production validation so the Cloudflare deployment does not depend on
  ripgrep being preinstalled on the GitHub Actions runner.
- Load Bench hero and screenshot assets from root-relative URLs so they work on extensionless and
  trailing-slash routes.
- Return a dedicated, non-indexable 404 page for unknown Cloudflare Pages routes.
- Match the shipping 17-tool Bench inventory by adding Lorem Ipsum and MOV to GIF, with both video
  converters grouped under Media.
- Meet WCAG AA text contrast for light-mode accent labels, page labels, coming-soon status, and
  Smart Detection results.
- Hide filtered-out tool categories from focus and assistive technology, and announce the matching
  tool count when a category changes.
- Present Smart Detection examples as static results and keep navigation inert while immersive
  screenshot mode makes it invisible.
- Add a keyboard skip link and focusable main-content target to every generated page.
- Expose each tool's benefit as a screen-reader description and a hoverable, keyboard-triggered
  tooltip.
