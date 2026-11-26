# Dial guide includes

Shared parts of every Dial guide page. `zh-hant/dial/printable-dose-log.html` is the model page.

| Include            | Renders                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `head.html`        | Smart App Banner and `Article` JSON-LD with `citations`                                                                          |
| `byline.html`      | Author, published and reviewed dates from `_data/dial_guides.yml[lang].byline`                                                   |
| `sources.html`     | The `citations` list                                                                                                             |
| `store-url.html`   | App Store URL: storefront from `_data/dial_storefronts.yml[lang]`, `ct` from `store_campaign`, optional `ppid` from `store_ppid` |
| `label-table.html` | One label-rules table from `_data/dial_label_rules/<lang>.yml`                                                                   |

## Front matter for a new guide

```yaml
title: <page title> | Dial
headline: <H1 text>
description: '<1 to 154 characters>'
canonical: https://zentsu.app/<lang>/dial/<slug>/
permalink: /<lang>/dial/<slug>/
lang: <zh-hant | ko | ja | pt | es-es>
# es-es only:
# locale: es-ES
# resource_lang: es
alternate_group: <dial-medication-log | dial-missed-dose | dial-change-injection-day | dial-side-effects-log | dial-dose-log | dial-site-rotation | dial-storage | dial-travel | dial-pen-needles | dial-sharps-disposal | dial-site-reactions | dial-eppe>
favicon: /assets/dial-icon.png
og_site_name: Dial
og_image: https://zentsu.app/assets/dial-og.png
og_image_alt: '<localized alt text>'
og_type: article
page_stylesheet: /dial-guides.css
published_on: 2026-11-19
reviewed_on: 2026-11-19
last_modified_at: 2026-11-19
store_campaign: g-tw-missed-dose
store_ppid: 3266e85e-a526-41d4-a1de-93bd3fe15736
citations:
  - name: '<label title>'
    url: https://...
    publisher: '<regulator>'
    revised: '<revision or access date>'
```

- `store_campaign` is the App Store Connect campaign token, 30 characters or fewer, letters, digits, `.`, `_` and `-` only. Leave it out to use `site-dial-blog`.
- `store_ppid` is a custom product page id. Leave it out for the default product page.
- `last_modified_at` writes `<lastmod>` for the page in `sitemap.xml`. Set it to `reviewed_on` on a new page, and to the day of the change when a live page gets a correction.
- `scripts/validate-site.mjs` checks every guide in the groups above: the store link built from these fields, the banner, `Article`, two dates, description length and dashes.

## Page opening

After the H1 and the byline come the boundary paragraph (`<p class="dial-guide-boundary">`: what the page
covers and that it is not medical advice) and then the answer paragraph
(`<p class="dial-guide-answer">`): two or three sentences that answer the title's question, each
fact attributed in the sentence to the named source. It restates facts the page body carries and
adds none. The class has no style rule.

A guide that is live is not reworded. A live page changes only for a correction of fact, a broken
link, or the lists the data files render.

## Label rules data

One file per site language, so each language is edited on its own: `_data/dial_label_rules/<lang>.yml`
(`zh-hant`, `ko`, `ja`, `pt`, `es-es`). One file serves that language's missed-dose, change-day
and rotation tables.

```yaml
products:
  - name: 猛健樂筆 Mounjaro KwikPen
    source_url: https://mcp.fda.gov.tw/im_detail_1/<label id>
    source_revised: 現行版，2026年11月19日查閱
    rules:
      missed_dose:
        text: <what the label says about a missed dose>
        section: （<section>）
      change_day:
        text: <what the label says about changing the weekly day>
        section: （<section>）
      rotation:
        text: <areas and rotation wording from the label>
        section: （<section>）
```

- `name`: the product as the local label names it. It is the row header.
- `rules.<topic>.text`: the rule, in the page language. `topic` is `missed_dose`, `change_day`, `rotation`, `storage`, `site_reaction` or `transport`. A product without that topic is left out of that table.
- `rules.<topic>.section`: the label section, written with its own brackets and wording. Optional.
- `source_url`, `source_revised`: the link in the source column and its text. List the same label in the page's `citations` too.

Usage on a page. Every heading string comes from the page, so the include holds no translated text:

```liquid
{%- include dial-guide/label-table.html
  topic='missed_dose'
  caption='各藥品仿單的漏打規定'
  product_heading='藥品'
  rule_heading='仿單寫法'
  source_heading='仿單版本' %}
```

`id` is optional (default `label-<topic>`); set it when one page shows the same topic twice.
Leave out `source_heading` to drop the source column. A language file or topic with no rows
renders nothing, so a page can include the table before its data exists. Open the tag with `{%-`
as shown, or an empty table leaves a whitespace-only line that `npm run validate:html` rejects.
