// Explicit country and language selection only. Requested URLs never auto-redirect.
(function () {
  const LOCALE_KEY = 'zentsu-locale';
  const COUNTRY_KEY = 'zentsu-dial-country';

  function writeStored(language, country) {
    try {
      if (language) localStorage.setItem(LOCALE_KEY, language);
      if (country) localStorage.setItem(COUNTRY_KEY, country);
    } catch {
      // Navigation still works when storage is unavailable.
    }
  }

  function readCountry() {
    try {
      return localStorage.getItem(COUNTRY_KEY);
    } catch {
      return null;
    }
  }

  function countryName(picker, country) {
    const grouped = picker.querySelector(`details.nav-lang-country[data-country="${country}"]`);
    if (grouped) return grouped.getAttribute('data-country-name') || '';
    const link = picker.querySelector(`a[data-country="${country}"][hreflang]`);
    return link ? link.textContent.trim() : '';
  }

  function markCurrent(picker, country, language) {
    picker.querySelectorAll('[aria-current]').forEach((node) => {
      node.removeAttribute('aria-current');
    });
    if (!country) return;
    const grouped = picker.querySelector(`details.nav-lang-country[data-country="${country}"]`);
    if (grouped) {
      grouped.querySelector('summary')?.setAttribute('aria-current', 'true');
    }
    picker.querySelectorAll(`a[data-country="${country}"][hreflang]`).forEach((node) => {
      const currentLanguage = language && node.getAttribute('hreflang') === language;
      if (!grouped && currentLanguage) node.setAttribute('aria-current', 'page');
      else if (!grouped) node.setAttribute('aria-current', 'true');
      else if (currentLanguage) node.setAttribute('aria-current', 'page');
    });
    const summary = picker.querySelector('[data-country-summary]');
    const name = countryName(picker, country);
    if (summary && name) {
      const label = summary.getAttribute('aria-label') || '';
      summary.setAttribute('aria-label', label.replace(/:.*$/, `: ${name}`));
      summary.setAttribute('title', summary.getAttribute('aria-label'));
    }
  }

  function showCountryStep(picker) {
    picker.classList.remove('nav-lang-step-language');
    picker.querySelectorAll('.nav-lang-country').forEach((node) => {
      node.open = false;
    });
    const back = picker.querySelector('.nav-lang-back');
    if (back) back.hidden = true;
    const title = picker.querySelector('#nav-lang-title');
    if (title && title.dataset.countryTitle) title.textContent = title.dataset.countryTitle;
  }

  function showLanguageStep(picker, countryNode) {
    picker.classList.add('nav-lang-step-language');
    picker.querySelectorAll('.nav-lang-country').forEach((node) => {
      node.open = node === countryNode;
    });
    const back = picker.querySelector('.nav-lang-back');
    if (back) back.hidden = false;
    const title = picker.querySelector('#nav-lang-title');
    if (title) {
      if (!title.dataset.countryTitle) title.dataset.countryTitle = title.textContent;
      title.textContent = picker.getAttribute('data-language-title') || title.textContent;
    }
  }

  function choose(link) {
    const language = link.getAttribute('hreflang');
    const country = link.getAttribute('data-country');
    writeStored(language, country);
    window.dispatchEvent(new CustomEvent('zentsu-dial-country', { detail: { country, language } }));
    const target = new URL(link.href, location.origin);
    target.search = location.search;
    target.hash = location.hash;
    link.href = target.href;
    if (target.pathname === location.pathname) {
      return false;
    }
    return true;
  }

  function bindPicker() {
    const picker = document.querySelector('.nav-lang-picker');
    if (!picker) return;

    const storedCountry = readCountry();
    const summaryCountry = picker
      .querySelector('[aria-current="true"][data-country], summary[aria-current="true"]')
      ?.closest('[data-country]')
      ?.getAttribute('data-country');
    const currentLanguage = document.documentElement.lang;
    markCurrent(picker, storedCountry || summaryCountry, currentLanguage);

    picker.querySelectorAll('a[data-country][hreflang]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const shouldNavigate = choose(link);
        if (!shouldNavigate) {
          event.preventDefault();
          picker.open = false;
          showCountryStep(picker);
          markCurrent(picker, link.getAttribute('data-country'), link.getAttribute('hreflang'));
        }
      });
    });

    picker.querySelectorAll('.nav-lang-country').forEach((countryNode) => {
      countryNode.addEventListener('click', (event) => {
        event.stopPropagation();
      });
      countryNode.querySelector('summary')?.addEventListener('click', (event) => {
        event.preventDefault();
        countryNode.open = true;
        showLanguageStep(picker, countryNode);
      });
    });

    picker.querySelector('.nav-lang-back')?.addEventListener('click', () => {
      showCountryStep(picker);
    });

    picker.querySelectorAll('[data-nav-lang-close]').forEach((node) => {
      node.addEventListener('click', () => {
        picker.open = false;
        showCountryStep(picker);
      });
    });

    document.addEventListener('click', (event) => {
      if (!picker.contains(event.target)) {
        picker.open = false;
        showCountryStep(picker);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && picker.open) {
        picker.open = false;
        showCountryStep(picker);
        const summary = picker.querySelector('[data-country-summary]');
        if (summary) summary.focus();
      }
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindPicker);
    } else {
      bindPicker();
    }
  }
})();
