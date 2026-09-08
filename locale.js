// Explicit language selection only. Requested URLs never auto-redirect.
(function () {
  function writeStored(language) {
    try {
      localStorage.setItem('zentsu-locale', language);
    } catch {
      // Navigation still works when storage is unavailable.
    }
  }

  function bindPicker() {
    const picker = document.querySelector('.nav-lang details');
    if (!picker) return;

    picker.querySelectorAll('a[hreflang]').forEach((link) => {
      link.addEventListener('click', () => {
        const language = link.getAttribute('hreflang');
        if (language) writeStored(language);
        const target = new URL(link.href, location.origin);
        target.search = location.search;
        target.hash = location.hash;
        link.href = target.href;
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

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindPicker);
    } else {
      bindPicker();
    }
  }
})();
