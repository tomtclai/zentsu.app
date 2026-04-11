# Zentsu LLC — Project Instructions

## Company
- **Name:** Zentsu LLC
- **Website:** https://zentsu.app
- **Contact:** tom@zentsu.app
- **Privacy inquiries:** privacy@zentsu.app
- **Terms inquiries:** terms@zentsu.app

## About
Zentsu LLC is a software company that publishes multiple mobile apps. No specific app has been built yet. Legal pages (privacy policy, terms) are written generically to cover all future apps.

## Repository
- **Repo:** https://github.com/tomtclai/zentsu.app
- **Hosting:** GitHub Pages with custom domain `zentsu.app` via Cloudflare
- **Branch:** `main` (auto-deploys to GitHub Pages)

## Site Structure
```
zentsu.app/
├── CLAUDE.md
├── CNAME               ← custom domain config for GitHub Pages
├── index.html          ← company landing page
├── privacy.html        ← privacy policy (covers all apps)
├── terms.html          ← terms & conditions (covers all apps)
└── nav.js              ← shared nav bar (single source of truth)
```

## Tech Stack
- Vanilla HTML/CSS only — no frameworks, no build step, no dependencies
- Dark/light mode via `prefers-color-scheme` CSS media query
- Nav bar is in `nav.js` — edit there, not in individual HTML files
- All pages share the same CSS design system (CSS custom properties in `:root`)

## Design System
- Font: system font stack (`-apple-system`, `BlinkMacSystemFont`, etc.)
- Light mode: `--bg: #f9f9f7`, `--surface: #ffffff`, `--accent: #4a7c6f`
- Dark mode: `--bg: #111113`, `--surface: #1c1c1e`, `--accent: #5fa896`
- Max content width: 760px (legal pages), 520px (hero)

## Conventions
- Commit and push after every meaningful change
- Use subagents for all file writes and edits
- Legal pages refer to apps as "Applications" (plural) and Zentsu LLC as "Service Provider"
- Effective date on legal pages: April 11, 2026
