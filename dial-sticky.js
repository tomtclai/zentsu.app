function stickyBarVisible(heroVisible, closerVisible) {
  return !heroVisible && !closerVisible;
}

function initDialSticky() {
  if (typeof document === 'undefined' || !('IntersectionObserver' in window)) return;

  var bar = document.querySelector('.dial-sticky-cta');
  var hero = document.getElementById('hero-primary-cta');
  var closer = document.getElementById('closer-primary-cta');
  if (!bar || !hero || !closer) return;

  var heroVisible = true;
  var closerVisible = false;
  var measured = false;

  function measureBar() {
    if (measured) return;
    bar.hidden = false;
    document.documentElement.style.setProperty('--sticky-cta-height', bar.offsetHeight + 'px');
    bar.hidden = true;
    measured = true;
  }

  function updateBar() {
    measureBar();
    var show = stickyBarVisible(heroVisible, closerVisible);
    bar.hidden = !show;
    document.body.classList.toggle('dial-sticky-visible', show);
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === closer) closerVisible = entry.isIntersecting;
        updateBar();
      });
    },
    { threshold: 0.01 },
  );

  observer.observe(hero);
  observer.observe(closer);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDialSticky);
  } else {
    initDialSticky();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { stickyBarVisible, initDialSticky };
}
