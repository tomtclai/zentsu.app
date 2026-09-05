// Locale picker + first-visit language default.
// Loaded only on pages that declare hreflang alternates (see head-common.html).
// Crawlers keep the URL they requested; hreflang and canonical stay the SEO signal.
// Real users: an explicit picker choice in localStorage wins. Otherwise the first
// matching published locale in navigator.languages is used. Unpublished languages
// are ignored, so adding a locale is YAML, not a new redirect rule.
// Wrapped in an IIFE: this and dial-currency.js are classic scripts on the same Dial
// page, so top-level declarations would share one global scope and the later file's
// helpers would silently replace this file's.
(function () {
  const STORAGE_KEY = 'zentsu-locale';
  const BOT_UA =
    /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|linkedinbot|embedly|pinterest|redditbot|whatsapp|telegrambot|applebot|ia_archiver|semrush|ahrefs|duckduckbot/i;

  function publishedLocales() {
    const node = document.getElementById('zentsu-locales');
    if (!node) return null;
    try {
      const parsed = JSON.parse(node.textContent);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function writeStored(language) {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Private mode can block storage; the picker navigation still works.
    }
  }

  function normalizePath(path) {
    if (!path) return '/';
    return path.endsWith('/') ? path : `${path}/`;
  }

  function chineseSiteLocale(lower) {
    if (!lower.startsWith('zh')) return null;
    if (
      lower === 'zh-hant' ||
      lower.startsWith('zh-hant-') ||
      lower === 'zh-tw' ||
      lower === 'zh-hk' ||
      lower === 'zh-mo'
    ) {
      return 'zh-hant';
    }
    if (
      lower === 'zh-hans' ||
      lower.startsWith('zh-hans-') ||
      lower === 'zh-cn' ||
      lower === 'zh-sg' ||
      lower === 'zh'
    ) {
      return 'zh';
    }
    return null;
  }

  function localeFromLanguageTags(tags, locales) {
    for (const tag of tags) {
      if (!tag) continue;
      const lower = String(tag).toLowerCase();
      const chinese = chineseSiteLocale(lower);
      if (chinese && Object.prototype.hasOwnProperty.call(locales, chinese)) return chinese;
      if (Object.prototype.hasOwnProperty.call(locales, lower)) return lower;
      const base = lower.split('-')[0];
      if (base !== 'zh' && Object.prototype.hasOwnProperty.call(locales, base)) return base;
    }
    return null;
  }

  function matchingLocale(locales) {
    const stored = readStored();
    if (stored && Object.prototype.hasOwnProperty.call(locales, stored)) return stored;

    const requested =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language];

    return localeFromLanguageTags(requested, locales);
  }

  function applyDefaultLocale() {
    if (BOT_UA.test(navigator.userAgent || '')) return;
    const locales = publishedLocales();
    if (!locales) return;

    const next = matchingLocale(locales);
    if (!next) return;
    if (next === document.documentElement.lang) return;

    const target = locales[next];
    if (!target) return;
    if (normalizePath(location.pathname) === normalizePath(target)) return;

    const dest = new URL(target, location.origin);
    dest.search = location.search;
    dest.hash = location.hash;
    location.replace(dest.pathname + dest.search + dest.hash);
  }

  function bindPicker() {
    const picker = document.querySelector('.nav-lang details');
    if (!picker) return;

    picker.querySelectorAll('a[hreflang]').forEach((link) => {
      link.addEventListener('click', () => {
        const language = link.getAttribute('hreflang');
        if (language) writeStored(language);
      });
    });

    document.addEventListener('click', (event) => {
      if (!picker.contains(event.target)) picker.open = false;
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && picker.open) {
        picker.open = false;
        const summary = picker.querySelector('summary');
        if (summary) summary.focus();
      }
    });
  }

  if (typeof document !== 'undefined' && typeof navigator !== 'undefined') {
    applyDefaultLocale();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindPicker);
    } else {
      bindPicker();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { chineseSiteLocale, localeFromLanguageTags };
  }
})();
