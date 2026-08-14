# Changelog

All notable changes to this website are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

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
