const LOCALE_TO_PAGE = {
  ar: 'ar',
  'ar-SA': 'ar',
  ca: 'ca',
  cs: 'cs',
  da: 'da',
  'de-DE': 'de',
  el: 'el',
  'en-AU': 'en',
  'en-CA': 'en',
  'en-GB': 'en',
  'en-US': 'en',
  'es-ES': 'es-es',
  'es-MX': 'es',
  fi: 'fi',
  'fr-CA': 'fr',
  'fr-FR': 'fr',
  he: 'he',
  hi: 'hi',
  hr: 'hr',
  hu: 'hu',
  id: 'id',
  it: 'it',
  ja: 'ja',
  ko: 'ko',
  ms: 'ms',
  'nl-NL': 'nl',
  no: 'no',
  pl: 'pl',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  ro: 'ro',
  ru: 'ru',
  sk: 'sk',
  sv: 'sv',
  th: 'th',
  tr: 'tr',
  uk: 'uk',
  vi: 'vi',
  'zh-Hans': 'zh',
  'zh-Hant': 'zh-hant',
};

const PAGE_TO_HREFLANG = {
  ar: 'ar',
  ca: 'ca',
  cs: 'cs',
  da: 'da',
  de: 'de',
  el: 'el',
  en: 'en',
  es: 'es-MX',
  'es-es': 'es-ES',
  fi: 'fi',
  fr: 'fr',
  he: 'he',
  hi: 'hi',
  hr: 'hr',
  hu: 'hu',
  id: 'id',
  it: 'it',
  ja: 'ja',
  ko: 'ko',
  ms: 'ms',
  nl: 'nl',
  no: 'no',
  pl: 'pl',
  pt: 'pt',
  ro: 'ro',
  ru: 'ru',
  sk: 'sk',
  sv: 'sv',
  th: 'th',
  tr: 'tr',
  uk: 'uk',
  vi: 'vi',
  zh: 'zh',
  'zh-hant': 'zh-hant',
};

const REGION_ORDER = ['africa_me_india', 'asia_pacific', 'europe', 'latin_america', 'us_canada'];

function localeToPage(locale) {
  return LOCALE_TO_PAGE[locale] ?? null;
}

function pagesForLocales(locales) {
  const pages = [];
  for (const locale of locales) {
    const page = localeToPage(locale);
    if (page && !pages.includes(page)) pages.push(page);
  }
  return pages;
}

function hreflangForPage(page) {
  return PAGE_TO_HREFLANG[page] ?? page;
}

function urlForPage(page, alternates) {
  const hreflang = hreflangForPage(page);
  return alternates[hreflang] ?? alternates[page] ?? alternates.es ?? null;
}

function rewriteStorePath(pathname, country) {
  if (!country) return pathname;
  if (/^\/[a-z]{2}\/app\//.test(pathname)) {
    return pathname.replace(/^\/[a-z]{2}\/app\//, `/${country}/app/`);
  }
  if (pathname.startsWith('/app/')) {
    return `/${country}${pathname}`;
  }
  return pathname;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LOCALE_TO_PAGE,
    PAGE_TO_HREFLANG,
    REGION_ORDER,
    localeToPage,
    pagesForLocales,
    hreflangForPage,
    urlForPage,
    rewriteStorePath,
  };
}
