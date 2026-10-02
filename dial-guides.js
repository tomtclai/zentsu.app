(function () {
  document.querySelectorAll('[data-print-page]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => window.print());
  });
})();
