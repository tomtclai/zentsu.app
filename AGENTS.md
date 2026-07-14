# Zentsu website

This repository is the Jekyll source for `zentsu.app`. It is an independent repository inside the
Zentsu workspace and deploys to Cloudflare Pages.

## Validation and deployment

- Run `npm test` before committing. It builds the site, validates generated HTML, checks internal
  links and fragments, verifies app visibility, and checks sitemap invariants.
- Do not push or deploy this repository without explicit founder confirmation.
- Do not edit generated files under `_site/`.

## Sources of truth

- Product prices live in `_config.yml`. Never hardcode a price in page copy.
- App visibility and card data live in `_data/apps.yml`.
- Bench tool inventory lives in `_data/tools.yml`.
- Shared metadata and resource links live in `_includes/head-common.html`.
- Customer-facing copy follows `../brandVoice.md`.

## Privacy and external resources

- Do not make a blanket claim that every app stores data only on-device. Coil uses the user's
  private iCloud database, and Dial can use private CloudKit for specified core records.
- Keep the general privacy page scoped to information Zentsu receives, then link to the app-specific
  policies for local storage and Apple service details.
- Site fonts are self-hosted under `assets/fonts/`. Keep the matching license files when updating
  them. Do not restore requests to Google Fonts or another font CDN.

## Structure

- Every page includes `_includes/head-common.html` inside its own `head` element.
- Shared layout rules belong in `shared.css`; product-specific rules belong in their existing
  stylesheet.
- Add redirects through `_redirects` and verify their canonical destination in the generated site.
