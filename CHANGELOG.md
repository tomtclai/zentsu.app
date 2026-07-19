# Changelog

All notable changes to this website are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- Improve Japanese2k emoji coverage and replace unclear fallback artwork with readable SVG icons.
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
