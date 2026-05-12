// Remove ads and promoted posts
document.querySelectorAll('.promoted, .promoted-hover, .ads-container').forEach(el => el.remove());

// Minimal sidebar with subreddit context and toggle
(function () {
  const NAV_KEY = 'bwreddit_nav_collapsed';
  const srMatch = location.pathname.match(/^\/r\/([^/]+)/i);
  const sr = srMatch ? srMatch[1] : null;

  const nav = document.createElement('div');
  nav.id = 'bw-nav';

  if (sr) {
    const base = '/r/' + sr;
    nav.innerHTML =
      '<div class="bw-sr-name"><a href="' + base + '">r/' + sr + '</a></div>' +
      '<ul class="bw-sort-links">' +
        '<li><a href="' + base + '/hot">hot</a></li>' +
        '<li><a href="' + base + '/new">new</a></li>' +
        '<li><a href="' + base + '/top">top</a></li>' +
        '<li><a href="' + base + '/rising">rising</a></li>' +
      '</ul>';
  } else {
    nav.innerHTML = '<div class="bw-sr-name"><a href="/">reddit</a></div>';
  }

  const btn = document.createElement('button');
  btn.id = 'bw-toggle';
  btn.textContent = '≡';
  btn.title = 'Toggle sidebar';

  document.body.insertBefore(nav, document.body.firstChild);
  document.body.insertBefore(btn, document.body.firstChild);

  if (localStorage.getItem(NAV_KEY) === '1') {
    document.documentElement.classList.add('bw-collapsed');
  }

  btn.addEventListener('click', function () {
    const collapsed = document.documentElement.classList.toggle('bw-collapsed');
    localStorage.setItem(NAV_KEY, collapsed ? '1' : '0');
  });
})();
