// Feature flag controller. Loaded synchronously in <head> of every page.
// To launch a feature: flip its `live` boolean (and fill in any URL/data).
// New flags: add to FLAGS, then in shared.css gate the markup with .feature-<name>
// and the reveal class .flag-<name>Live.

const FLAGS = {
  appStore: { live: false, url: '' },
};

if (FLAGS.appStore.live) {
  document.documentElement.classList.add('flag-appStoreLive');
  document.querySelectorAll('.feature-app-store a').forEach((a) => {
    if (FLAGS.appStore.url) a.href = FLAGS.appStore.url;
  });
}
