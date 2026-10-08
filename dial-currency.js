// Currency picker for Dial plan prices.
// Country (nav) sets the storefront default. Language and currency stay
// independent: a later currency click overrides display amounts only.
// Schema.org offers stay on the page storefront.
(function () {
  const DIAL_CURRENCY_STORAGE_KEY = 'zentsu-dial-currency';
  const DIAL_COUNTRY_STORAGE_KEY = 'zentsu-dial-country';

  function priceData() {
    const node = document.getElementById('dial-price-data');
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
      return localStorage.getItem(DIAL_CURRENCY_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function writeStored(currency) {
    try {
      localStorage.setItem(DIAL_CURRENCY_STORAGE_KEY, currency);
    } catch {
      // Private mode can block storage; the in-page switch still works.
    }
  }

  function readCountry() {
    try {
      return localStorage.getItem(DIAL_COUNTRY_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function countriesById(list) {
    const map = {};
    for (const row of list || []) {
      if (row && row.id) map[row.id] = row;
    }
    return map;
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

  function catalogByCurrency(prices, currencyPrices) {
    const map = {};
    for (const [lang, row] of Object.entries(prices || {})) {
      if (!row || !row.currency || map[row.currency]) continue;
      map[row.currency] = { ...row, lang };
    }
    for (const row of Object.values(currencyPrices || {})) {
      if (!row || !row.currency || map[row.currency]) continue;
      map[row.currency] = { ...row };
    }
    return map;
  }

  function countryRecord(data) {
    return countriesById(data.countries)[data.country];
  }

  function territoryRow(data) {
    const country = countryRecord(data);
    if (!country || !data.territoryPrices) return null;
    return data.territoryPrices[country.territory] || null;
  }

  function resolvePrices(data, currency) {
    const selected = territoryRow(data);
    const country = countryRecord(data);
    const defaultCurrency = selected ? selected.currency : data.defaultCurrency;
    const defaultRow = selected || data.prices[data.lang];
    const namedNote =
      selected && country
        ? String(data.overrideNote || '')
            .replaceAll('{currency}', selected.currency)
            .replaceAll('{storefront}', country.name)
        : data.defaultNote;
    const defaultNote =
      data.country && data.defaultCountry && data.country !== data.defaultCountry
        ? namedNote
        : data.defaultNote;
    const fallback = {
      currency: defaultCurrency,
      row: defaultRow,
      note: defaultNote,
    };
    if (!currency || currency === defaultCurrency) return fallback;
    const row = catalogByCurrency(data.prices, data.currencyPrices)[currency];
    if (!row) return fallback;
    return {
      currency,
      row,
      note: String(data.overrideNote || '')
        .replaceAll('{currency}', currency)
        .replaceAll('{storefront}', row.territory),
    };
  }

  function applyStoreLinks(country) {
    if (!country) return;
    document.querySelectorAll('[data-dial-store-link]').forEach((node) => {
      try {
        const url = new URL(node.getAttribute('href'), location.origin);
        url.pathname = rewriteStorePath(url.pathname, country);
        node.setAttribute('href', url.href);
      } catch {
        return;
      }
    });
  }

  function applyPrices(resolved) {
    if (!resolved.row) return;
    const amounts = {
      lifetime: resolved.row.lifetime_display,
      annual: resolved.row.annual_display,
      monthly: resolved.row.monthly_display,
    };
    for (const [key, value] of Object.entries(amounts)) {
      document.querySelectorAll(`[data-dial-price="${key}"]`).forEach((node) => {
        if (value) node.textContent = value;
      });
    }
    const note = document.querySelector('[data-dial-price-note]');
    if (note && resolved.note) note.textContent = resolved.note;

    const summary = document.querySelector('[data-dial-currency-summary]');
    if (summary) {
      summary.textContent = resolved.currency;
      const label = summary.getAttribute('aria-label');
      if (label) {
        summary.setAttribute('aria-label', label.replace(/:.*$/, `: ${resolved.currency}`));
      }
    }

    document.querySelectorAll('[data-dial-currency]').forEach((button) => {
      const selected = button.getAttribute('data-dial-currency') === resolved.currency;
      if (selected) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  function bindPicker(data) {
    const picker = document.querySelector('.dial-currency details');
    if (!picker) return;

    picker.querySelectorAll('[data-dial-currency]').forEach((button) => {
      button.addEventListener('click', () => {
        const currency = button.getAttribute('data-dial-currency');
        if (!currency) return;
        writeStored(currency);
        applyPrices(
          resolvePrices({ ...data, country: readCountry() || data.defaultCountry }, currency),
        );
        picker.open = false;
      });
    });

    document.addEventListener('click', (event) => {
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      if (path.includes(picker) || picker.contains(event.target)) return;
      picker.open = false;
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && picker.open) {
        picker.open = false;
        const summary = picker.querySelector('summary');
        if (summary) summary.focus();
      }
    });
  }

  function applyCountry(data, country, options = {}) {
    const next = { ...data, country };
    const selected = territoryRow(next);
    if (options.resetCurrency && selected) writeStored(selected.currency);
    const stored = readStored();
    const defaultCurrency = selected?.currency || data.defaultCurrency;
    const currency = options.resetCurrency
      ? defaultCurrency
      : stored && stored !== defaultCurrency
        ? stored
        : defaultCurrency;
    applyPrices(resolvePrices(next, currency));
    applyStoreLinks(country);
  }

  function init() {
    const data = priceData();
    if (!data || !data.prices || !data.lang) return;
    const knownCountries = countriesById(data.countries);
    const storedCountry = readCountry();
    const country =
      storedCountry && knownCountries[storedCountry] ? storedCountry : data.defaultCountry;
    const selected = territoryRow({ ...data, country });
    const stored = readStored();
    const known = catalogByCurrency(data.prices, data.currencyPrices);
    const currency =
      stored && known[stored] && stored !== (selected?.currency || data.defaultCurrency)
        ? stored
        : selected?.currency || (stored && known[stored] ? stored : data.defaultCurrency);
    applyPrices(resolvePrices({ ...data, country }, currency));
    applyStoreLinks(country);
    bindPicker(data);
    window.addEventListener('zentsu-dial-country', (event) => {
      const nextCountry = event.detail && event.detail.country;
      if (!nextCountry || !knownCountries[nextCountry]) return;
      applyCountry(data, nextCountry, { resetCurrency: true });
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      catalogByCurrency,
      resolvePrices,
      rewriteStorePath,
      countriesById,
    };
  }
})();
