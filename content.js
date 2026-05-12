const STORAGE_KEY = 'reddimail_read';

function getReadSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function markRead(id) {
  const set = getReadSet();
  set.add(id);
  // cap at 2000 entries
  const arr = Array.from(set).slice(-2000);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 55%, 45%)`;
}

function formatTime(datetimeAttr) {
  if (!datetimeAttr) return '';
  try {
    const d = new Date(datetimeAttr);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function buildToggleButton() {
  const btn = document.createElement('button');
  btn.id = 'rm-nav-toggle';
  btn.setAttribute('aria-label', 'Toggle navigation');
  btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`;

  btn.addEventListener('click', () => {
    const collapsed = document.documentElement.classList.toggle('rm-nav-collapsed');
    localStorage.setItem('reddimail_nav_collapsed', collapsed ? '1' : '0');
  });

  const headerLeft = document.querySelector('#header-bottom-left');
  if (headerLeft) headerLeft.appendChild(btn);

  if (localStorage.getItem('reddimail_nav_collapsed') === '1') {
    document.documentElement.classList.add('rm-nav-collapsed');
  }
}

function buildLeftNav() {
  const nav = document.createElement('nav');
  nav.id = 'rm-leftnav';

  const submitHref = document.querySelector('a[href*="/submit"]')?.href || '/submit';

  // Detect current subreddit from URL
  const srMatch = location.pathname.match(/^\/r\/([^/]+)/i);
  const currentSr = srMatch ? srMatch[1] : null;
  const base = currentSr ? `/r/${currentSr}` : '';

  nav.innerHTML = `
    <a class="rm-compose" href="${submitHref}">
      <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.21a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      <span>Compose</span>
    </a>
    ${currentSr ? `
    <a class="rm-current-sr" href="/r/${currentSr}">
      <span class="rm-current-sr-dot" style="background:${stringToColor(currentSr)}"></span>
      <span class="rm-current-sr-name">r/${currentSr}</span>
    </a>
    ` : ''}
    <ul class="rm-nav-items">
      <li class="rm-nav-item" data-sort=""><a href="${base || '/'}">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3l5 5h-3v4h-4v-4H7l5-5z"/></svg>
        <span>Inbox</span>
      </a></li>
      <li class="rm-nav-item" data-sort="hot"><a href="${base}/hot">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M13.5 .67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>
        <span>Hot</span>
      </a></li>
      <li class="rm-nav-item" data-sort="new"><a href="${base}/new">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
        <span>New</span>
      </a></li>
      <li class="rm-nav-item" data-sort="rising"><a href="${base}/rising">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/></svg>
        <span>Rising</span>
      </a></li>
      <li class="rm-nav-item" data-sort="top"><a href="${base}/top">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>
        <span>Top</span>
      </a></li>
    </ul>
    <div class="rm-section-label">Labels</div>
    <ul class="rm-labels-list" id="rm-labels"></ul>
  `;

  // Populate subreddits as labels
  const srLinks = document.querySelectorAll('#sr-header-area a[href*="/r/"]');
  const labelsList = nav.querySelector('#rm-labels');
  const seen = new Set();
  srLinks.forEach(link => {
    const name = link.textContent.trim().replace(/\s+/g, '');
    if (!name || name.includes('+') || seen.has(name)) return;
    seen.add(name);
    const li = document.createElement('li');
    li.className = 'rm-label-item';
    const color = stringToColor(name);
    li.innerHTML = `
      <span class="rm-label-dot" style="background:${color}"></span>
      <a href="${link.href}" title="${name}">${name}</a>
    `;
    labelsList.appendChild(li);
  });

  document.body.insertBefore(nav, document.body.firstChild);

  // Highlight active sort
  const path = location.pathname;
  nav.querySelectorAll('.rm-nav-item').forEach(item => {
    const sort = item.dataset.sort;
    const isActive = sort === ''
      ? (!path.includes('/hot') && !path.includes('/new') && !path.includes('/rising') && !path.includes('/top'))
      : path.endsWith('/' + sort) || path.endsWith('/' + sort + '/');
    if (isActive) item.classList.add('rm-active');
  });
}

function transformPostList() {
  const readSet = getReadSet();
  const things = document.querySelectorAll('#siteTable .thing.link:not(.promoted)');

  things.forEach(thing => {
    const id = thing.id; // e.g. "thing_t3_abc123"

    const titleEl = thing.querySelector('a.title');
    const authorEl = thing.querySelector('a.author');
    const subredditEl = thing.querySelector('a.subreddit');
    const scoreEl = thing.querySelector('.score');
    const commentsEl = thing.querySelector('a.comments');
    const timeEl = thing.querySelector('time');
    const flairEl = thing.querySelector('.linkflairlabel');
    const domainEl = thing.querySelector('.domain a');
    const nsfwEl = thing.querySelector('.nsfw-stamp');

    const isRead = readSet.has(id);
    if (!isRead) thing.classList.add('rm-unread');

    const sender = subredditEl?.textContent?.trim() || authorEl?.textContent?.trim() || '[deleted]';
    const author = authorEl?.textContent?.trim() || '';
    const title = titleEl?.textContent?.trim() || '(untitled)';
    const domain = domainEl?.textContent?.trim() || '';
    const scoreText = scoreEl?.textContent?.trim() || '•';
    const commentsHref = commentsEl?.href || '#';
    const commentsCount = commentsEl?.textContent?.replace(/\s*(comments?|comment)\s*/i, '').trim() || '0';
    const timeAttr = timeEl?.getAttribute('datetime') || '';
    const flair = flairEl?.textContent?.trim() || '';
    const isNSFW = !!nsfwEl;
    const postHref = titleEl?.href || '#';

    const row = document.createElement('div');
    row.className = 'rm-row';
    row.innerHTML = `
      <label class="rm-col-check" title="Select">
        <input type="checkbox" class="rm-checkbox">
      </label>
      <button class="rm-col-star rm-star" title="Star" aria-label="Star">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
      </button>
      <div class="rm-col-sender">
        <span class="rm-sender-name">${sender}</span>
      </div>
      <div class="rm-col-body">
        <span class="rm-title">${title}</span>
        ${domain ? `<span class="rm-snippet"> — ${domain}</span>` : ''}
        ${author && subredditEl ? `<span class="rm-snippet rm-author"> — u/${author}</span>` : ''}
      </div>
      <div class="rm-col-tags">
        ${flair ? `<span class="rm-tag">${flair}</span>` : ''}
        ${isNSFW ? `<span class="rm-tag rm-tag-nsfw">NSFW</span>` : ''}
      </div>
      <div class="rm-col-score" title="${scoreText} points">
        <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M12 2L8 8H3l4.5 4.5L6 18l6-3 6 3-1.5-5.5L21 8h-5z"/></svg>
        ${scoreText}
      </div>
      <a class="rm-col-comments" href="${commentsHref}" title="${commentsCount} comments">
        <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        ${commentsCount}
      </a>
      <div class="rm-col-time">${formatTime(timeAttr)}</div>
    `;

    // Click row → navigate to post
    row.addEventListener('click', e => {
      if (e.target.closest('.rm-col-check') || e.target.closest('.rm-col-star') || e.target.closest('.rm-col-comments')) return;
      markRead(id);
      thing.classList.remove('rm-unread');
      window.location.href = postHref;
    });

    // Star toggle
    row.querySelector('.rm-star').addEventListener('click', e => {
      e.stopPropagation();
      e.currentTarget.classList.toggle('rm-starred');
    });

    // Hide original Reddit elements, inject row
    Array.from(thing.children).forEach(child => child.style.display = 'none');
    thing.style.display = 'block';
    thing.appendChild(row);
  });
}

function transformCommentPage() {
  document.documentElement.setAttribute('data-reddimail-comments', 'true');

  const thing = document.querySelector('#siteTable .thing.link');
  if (!thing) return;

  const titleEl  = thing.querySelector('a.title');
  const authorEl = thing.querySelector('a.author');
  const srEl     = thing.querySelector('a.subreddit');
  const timeEl   = thing.querySelector('time');
  const scoreEl  = thing.querySelector('.score');
  const bodyEl   = thing.querySelector('.usertext-body');
  const domainEl = thing.querySelector('.domain a');

  const header = document.createElement('div');
  header.className = 'rm-email-header';
  header.innerHTML = `
    <div class="rm-email-subject">${titleEl?.textContent?.trim() || '(untitled)'}</div>
    <div class="rm-email-meta">
      ${authorEl ? `<span class="rm-email-chip">u/${authorEl.textContent.trim()}</span>` : ''}
      ${srEl     ? `<a  class="rm-email-chip rm-email-chip-sr" href="${srEl.href}">${srEl.textContent.trim()}</a>` : ''}
      ${scoreEl  ? `<span class="rm-email-chip">▲ ${scoreEl.textContent.trim()}</span>` : ''}
      ${timeEl   ? `<span class="rm-email-chip">${formatTime(timeEl.getAttribute('datetime'))}</span>` : ''}
      ${domainEl ? `<a class="rm-email-chip" href="${titleEl?.href || '#'}" target="_blank">${domainEl.textContent.trim()} ↗</a>` : ''}
    </div>
    ${bodyEl ? `<div class="rm-email-body">${bodyEl.innerHTML}</div>` : ''}
  `;

  // Hide all original children, then append the styled header
  Array.from(thing.children).forEach(child => { child.style.display = 'none'; });
  thing.appendChild(header);
}

function init() {
  document.documentElement.setAttribute('data-reddimail', 'true');
  buildToggleButton();
  buildLeftNav();

  const isComments = document.body.classList.contains('comments-page');
  if (isComments) {
    transformCommentPage();
  } else {
    transformPostList();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
