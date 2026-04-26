(function () {
  var pages = [
    { href: '/index.html', label: 'Zentsu LLC' },
    { href: '/bench.html', label: 'Bench' },
    { href: '/privacy.html', label: 'Privacy Policy' },
    { href: '/terms.html', label: 'Terms of Use' },
  ];

  var current = '/' + (window.location.pathname.split('/').pop() || 'index.html');

  var items = pages
    .map(function (p) {
      var active =
        current === p.href || (current === '/' && p.href === '/index.html')
          ? ' class="active"'
          : '';
      return '<li><a href="' + p.href + '"' + active + '>' + p.label + '</a></li>';
    })
    .join('');

  var nav = '<nav><ul>' + items + '</ul></nav>';

  var placeholder = document.getElementById('nav-placeholder');
  if (placeholder) placeholder.outerHTML = nav;
})();
