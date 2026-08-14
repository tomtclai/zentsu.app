// Currency picker for Dial plan prices.
// Language (nav) and currency (next to the prices) are independent.
// A page's storefront is the default. An explicit choice is stored separately
// and survives language changes. Amounts stay the live ASC figures from
// _data/dial_prices.yml. Schema.org offers stay on the page storefront.

const STORAGE_KEY = 'zentsu-dial-currency';

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
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(currency) {
  try {
    localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    // Private mode can block storage; the in-page switch still works.
  }
}

function catalogByCurrency(prices) {
  const map = {};
  for (const [lang, row] of Object.entries(prices || {})) {
    if (!row || !row.currency || map[row.currency]) continue;
    map[row.currency] = { ...row, lang };
  }
  return map;
}

function resolvePrices(data, currency) {
  const fallback = {
    currency: data.defaultCurrency,
    row: data.prices[data.lang],
    note: data.defaultNote,
  };
  if (!currency || currency === data.defaultCurrency) return fallback;
  const row = catalogByCurrency(data.prices)[currency];
  if (!row) return fallback;
  return {
    currency,
    row,
    note: String(data.overrideNote || '').replaceAll('{currency}', currency),
  };
}

function applyPrices(resolved) {
  if (!resolved.row) return;
  const amounts = {
    lifetime: resolved.row.lifetime_display,
    annual: resolved.row.annual_display,
    monthly: resolved.row.monthly_display,
  };
  for (const [key, value] of Object.entries(amounts)) {
    const node = document.querySelector(`[data-dial-price="${key}"]`);
    if (node && value) node.textContent = value;
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
      applyPrices(resolvePrices(data, currency));
      picker.open = false;
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

function init() {
  const data = priceData();
  if (!data || !data.prices || !data.lang) return;
  const stored = readStored();
  const known = catalogByCurrency(data.prices);
  const currency = stored && known[stored] ? stored : data.defaultCurrency;
  applyPrices(resolvePrices(data, currency));
  bindPicker(data);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { catalogByCurrency, resolvePrices };
}
