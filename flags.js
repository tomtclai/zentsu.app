// Feature flag controller. Loaded synchronously in <head> of every page.
// To launch a feature: flip its `live` boolean (and fill in any URL/data).
// New flags: add to FLAGS, then in shared.css gate the markup with .feature-<name>
// and the reveal class .flag-<name>Live.

const FLAGS = {
  appStore: { live: false, url: '' },
};

if (FLAGS.appStore.live) {
  // Add the reveal class on <html> immediately so gated markup never flashes.
  document.documentElement.classList.add('flag-appStoreLive');

  // Href rewrites must wait for <body>: this script runs in <head>, before the
  // elements it targets exist.
  const applyAppStoreUrl = () => {
    if (!FLAGS.appStore.url) return;
    document.querySelectorAll('.feature-app-store a').forEach((a) => {
      a.href = FLAGS.appStore.url;
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAppStoreUrl);
  } else {
    applyAppStoreUrl();
  }
}
