/* app.js — Raaz-o-Neyaz PWA */
'use strict';

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  categories: [],
  nav: {},        // { catId: [tree nodes] }
  search: [],
  deepSearch: null,
  bookmarks: new Set(JSON.parse(localStorage.getItem('bookmarks') || '[]').map(Number)),
  langs: JSON.parse(localStorage.getItem('langs') || '{"en":true,"rurdu":true,"urdu":true}'),
  fontSize: JSON.parse(localStorage.getItem('fontSize') || '{"arabic":1.75,"trans":0.9}'),
  theme: localStorage.getItem('theme') || 'dark',
  route: { view: 'home', catId: null, subId: null, breadcrumb: [] },
  lineCache: {},         // subindexId → payload
};

// ── DOM ───────────────────────────────────────────────────────────────────────
const $content = document.getElementById('content');
const $topbarTitle = document.getElementById('topbar-title');
const $backBtn = document.getElementById('back-btn');
const $settingsToggle = document.getElementById('settings-toggle');
const $settingsModal = document.getElementById('settings-modal');
const $settingsOverlay = document.getElementById('settings-overlay');
const $settingsClose = document.getElementById('settings-close');
const $navBtns = document.querySelectorAll('.nav-btn');
const $globalSearchBar = document.getElementById('global-search-bar');
const $globalSearchInput = document.getElementById('global-search-input');
const $deepSearchCheck = document.getElementById('deep-search-check');

// Appearance
const $themeLight = document.getElementById('theme-light');

// Language checkboxes
const $langEn = document.getElementById('lang-en');
const $langRurdu = document.getElementById('lang-rurdu');
const $langUrdu = document.getElementById('lang-urdu');

// Font size sliders
const $arabicSlider = document.getElementById('arabic-size-slider');
const $arabicVal = document.getElementById('arabic-size-val');
const $transSlider = document.getElementById('trans-size-slider');
const $transVal = document.getElementById('trans-size-val');

// ── Settings modal open/close ─────────────────────────────────────────────────
function openSettings() {
  $settingsModal.style.display = 'flex';
  $settingsOverlay.style.display = 'block';
  // Animate in
  requestAnimationFrame(() => {
    $settingsModal.classList.add('open');
    $settingsOverlay.classList.add('open');
  });
}

function closeSettings() {
  $settingsModal.classList.remove('open');
  $settingsOverlay.classList.remove('open');
  setTimeout(() => {
    $settingsModal.style.display = 'none';
    $settingsOverlay.style.display = 'none';
  }, 250);
}

$settingsToggle.addEventListener('click', openSettings);
$settingsClose.addEventListener('click', closeSettings);
$settingsOverlay.addEventListener('click', closeSettings);

// ── Language visibility ───────────────────────────────────────────────────────
function applyLangs() {
  document.body.classList.toggle('hide-en', !state.langs.en);
  document.body.classList.toggle('hide-rurdu', !state.langs.rurdu);
  document.body.classList.toggle('hide-urdu', !state.langs.urdu);
  localStorage.setItem('langs', JSON.stringify(state.langs));
}

function syncLangCheckboxes() {
  $langEn.checked = state.langs.en;
  $langRurdu.checked = state.langs.rurdu;
  $langUrdu.checked = state.langs.urdu;
}

$langEn.addEventListener('change', () => {
  state.langs.en = $langEn.checked;
  applyLangs();
});
$langRurdu.addEventListener('change', () => {
  state.langs.rurdu = $langRurdu.checked;
  applyLangs();
});
$langUrdu.addEventListener('change', () => {
  state.langs.urdu = $langUrdu.checked;
  applyLangs();
});

// ── Theming ───────────────────────────────────────────────────────────────────
function applyTheme() {
  const isLight = state.theme === 'light';
  document.body.classList.toggle('light-mode', isLight);
  if ($themeLight) $themeLight.checked = isLight;
  localStorage.setItem('theme', state.theme);
  
  // Update theme-color meta tag
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isLight ? '#ffffff' : '#0d1117');
  }
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
}

if ($themeLight) {
  $themeLight.addEventListener('change', toggleTheme);
}

// ── Font sizing ───────────────────────────────────────────────────────────────
function applyFontSizes() {
  document.documentElement.style.setProperty('--arabic-size', state.fontSize.arabic + 'rem');
  document.documentElement.style.setProperty('--trans-size', state.fontSize.trans + 'rem');
  localStorage.setItem('fontSize', JSON.stringify(state.fontSize));
}

function syncFontSliders() {
  $arabicSlider.value = state.fontSize.arabic;
  $arabicVal.textContent = state.fontSize.arabic.toFixed(2);
  $transSlider.value = state.fontSize.trans;
  $transVal.textContent = state.fontSize.trans.toFixed(2);
}

$arabicSlider.addEventListener('input', () => {
  state.fontSize.arabic = parseFloat($arabicSlider.value);
  $arabicVal.textContent = state.fontSize.arabic.toFixed(2);
  applyFontSizes();
});

$transSlider.addEventListener('input', () => {
  state.fontSize.trans = parseFloat($transSlider.value);
  $transVal.textContent = state.fontSize.trans.toFixed(2);
  applyFontSizes();
});

// ── Bookmarks ─────────────────────────────────────────────────────────────────
function saveBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify([...state.bookmarks]));
}
function toggleBookmark(subId) {
  subId = Number(subId);
  if (state.bookmarks.has(subId)) {
    state.bookmarks.delete(subId);
  } else {
    state.bookmarks.add(subId);
  }
  saveBookmarks();
}
function isBookmarked(subId) { return state.bookmarks.has(Number(subId)); }

// ── Data fetching ─────────────────────────────────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url}`);
  return res.json();
}

async function loadCoreData() {
  const [cats, nav, search] = await Promise.all([
    fetchJSON('./categories.json'),
    fetchJSON('./nav.json'),
    fetchJSON('./search.json'),
  ]);
  state.categories = cats;
  state.nav = nav;
  state.search = search;
}

async function loadLines(subId) {
  if (state.lineCache[subId]) return state.lineCache[subId];
  const data = await fetchJSON(`./duas_data/lines/${subId}.json`);
  state.lineCache[subId] = data;
  return data;
}

// ── Routing ───────────────────────────────────────────────────────────────────
function navigate(view, opts = {}) {
  state.route = { view, ...opts };
  render();
}

function goHome() { navigate('home', { breadcrumb: [] }); setActiveNav('home'); }
function goSearch() { navigate('search'); setActiveNav('search'); }
function goBookmarks() { navigate('bookmarks'); setActiveNav('bookmarks'); }

function setActiveNav(tab) {
  $navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

// ── Render dispatcher ─────────────────────────────────────────────────────────
function render() {
  const { view } = state.route;

  // Show/hide global search bar (hidden only on reader)
  $globalSearchBar.classList.toggle('hidden', view === 'reader');

  if (view === 'home') renderHome();
  else if (view === 'nav') renderNav();
  else if (view === 'reader') renderReader();
  else if (view === 'search') renderSearch();
  else if (view === 'bookmarks') renderBookmarks();
}

// ── Home ──────────────────────────────────────────────────────────────────────
const CAT_ICONS = { 1: '📖', 2: '🕌', 3: '🤲', 4: '🌙', 5: '⭐', 6: '📿', 7: '✨' };

function renderHome() {
  $topbarTitle.style.display = 'none';
  document.querySelector('.logo').style.display = '';
  $backBtn.classList.remove('visible');

  const grid = state.categories.map(cat => `
    <button class="cat-card" data-catid="${cat.id}">
      <span class="cat-icon">${CAT_ICONS[cat.id] || '📖'}</span>
      <span class="cat-en">${cat.en || ''}</span>
      <span class="cat-urdu">${cat.urdu || cat.rurdu || ''}</span>
    </button>
  `).join('');

  $content.innerHTML = `
    <div class="page-home">
      <div class="home-header">
        <span class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
        <span class="subtitle">Raaz-o-Neyaz</span>
      </div>
      <div class="category-grid">${grid}</div>
    </div>
  `;

  $content.querySelectorAll('.cat-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = +btn.dataset.catid;
      const cat = state.categories.find(c => c.id === catId);
      navigate('nav', {
        catId,
        nodes: state.nav[catId] || [],
        breadcrumb: [{ label: cat?.en || '', catId }]
      });
      setActiveNav('home');
    });
  });
}

// ── Nav (subindex tree) ───────────────────────────────────────────────────────
function renderNav() {
  const { nodes, breadcrumb } = state.route;

  document.querySelector('.logo').style.display = 'none';
  $topbarTitle.style.display = '';
  $topbarTitle.textContent = breadcrumb[breadcrumb.length - 1]?.label || '';
  $backBtn.classList.add('visible');

  const items = (nodes || []).map(node => renderNavItem(node, breadcrumb)).join('');

  $content.innerHTML = `<div class="page-nav"><ul class="nav-list">${items}</ul></div>`;
  $content.scrollTop = 0;

  $content.querySelectorAll('.nav-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.id;
      const hasKids = btn.dataset.hasKids === '1';
      const label = btn.dataset.label;

      if (hasKids) {
        // Find node's children
        const node = findNode(id, nodes);
        const children = node?.children || [];
        navigate('nav', {
          nodes: children,
          breadcrumb: [...breadcrumb, { label, id }],
        });
      } else {
        navigate('reader', { subId: id, breadcrumb: [...breadcrumb, { label, id }] });
      }
    });
  });
}

function renderNavItem(node, breadcrumb) {
  const arrow = node.hasKids ? '›' : '›';
  const sub = node.title?.urdu || node.title?.rurdu || '';
  return `
    <li class="nav-item" data-level="${node.level}">
      <button class="nav-item-btn"
        data-id="${node.id}"
        data-has-kids="${node.hasKids ? 1 : 0}"
        data-label="${escHtml(node.title?.en || '')}">
        <div class="nav-item-text">
          <span class="nav-item-en">${escHtml(node.title?.en || '—')}</span>
          ${sub ? `<span class="nav-item-sub">${escHtml(sub)}</span>` : ''}
        </div>
        <span class="nav-item-arrow">${arrow}</span>
      </button>
    </li>
  `;
}

function findNode(id, nodes) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(id, node.children);
      if (found) return found;
    }
  }
  return null;
}

// ── Back button ───────────────────────────────────────────────────────────────
$backBtn.addEventListener('click', () => {
  const { breadcrumb, view } = state.route;

  if (!breadcrumb || breadcrumb.length === 0) { goHome(); return; }

  if (view === 'reader' || (view === 'nav' && breadcrumb.length === 1)) {
    // Go back to nav at previous level
    const prev = breadcrumb[breadcrumb.length - 2];
    if (!prev) { goHome(); return; }
    // Re-navigate to parent nav
    const newBc = breadcrumb.slice(0, -1);
    // Find the parent nodes
    const parentCatId = newBc[0]?.catId;
    let nodes = state.nav[parentCatId] || [];
    for (let i = 1; i < newBc.length; i++) {
      const node = findNode(newBc[i].id, nodes);
      nodes = node?.children || [];
    }
    navigate('nav', { nodes, breadcrumb: newBc, catId: parentCatId });
  } else if (view === 'nav' && breadcrumb.length > 1) {
    const newBc = breadcrumb.slice(0, -1);
    const parentCatId = newBc[0]?.catId;
    let nodes = state.nav[parentCatId] || [];
    for (let i = 1; i < newBc.length; i++) {
      const node = findNode(newBc[i].id, nodes);
      nodes = node?.children || [];
    }
    navigate('nav', { nodes, breadcrumb: newBc, parentCatId });
  } else {
    goHome();
  }
});

// ── Reader ────────────────────────────────────────────────────────────────────
async function renderReader() {
  const { subId, breadcrumb } = state.route;

  document.querySelector('.logo').style.display = 'none';
  $topbarTitle.style.display = '';
  $backBtn.classList.add('visible');

  // Show spinner while loading
  $content.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';

  let data;
  try {
    data = await loadLines(subId);
  } catch (e) {
    $content.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>Could not load content.<br>Please check your connection.</p></div>`;
    return;
  }

  const title = data.title || {};
  $topbarTitle.textContent = title.en || title.rurdu || 'Dua';

  const bmed = isBookmarked(subId);
  const bmIcon = bmed ? '⭐' : '☆';
  const bmClass = bmed ? 'bm-btn bookmarked' : 'bm-btn';

  const linesHtml = data.lines.map(line => renderLineBlock(line)).join('');

  $content.innerHTML = `
    <div class="page-reader">
      <div class="reader-header">
        ${title.urdu ? `<span class="dua-title-ar">${escHtml(title.urdu)}</span>` : ''}
        ${title.en ? `<span class="dua-title-en">${escHtml(title.en)}</span>` : ''}
      </div>
      <div class="reader-search-wrap">
        <span class="reader-search-icon">🔍</span>
        <input type="search" id="reader-search" placeholder="Search in this dua…" autocomplete="off" />
        <button id="reader-search-clear" class="search-clear-btn reader-search-clear" aria-label="Clear search">✕</button>
        <button id="reader-search-dismiss" class="search-dismiss-btn" aria-label="Dismiss search">Done</button>
        <span id="reader-match-count" class="reader-match-count"></span>
        <button id="reader-search-prev" class="reader-search-nav" aria-label="Previous match">▲</button>
        <button id="reader-search-next" class="reader-search-nav" aria-label="Next match">▼</button>
      </div>
      ${linesHtml}
    </div>
  `;
  $content.scrollTop = 0;

  // ── Wire up in-page search ────────────────────────────────────────────
  const readerInput = document.getElementById('reader-search');
  const readerClear = document.getElementById('reader-search-clear');
  const readerDismiss = document.getElementById('reader-search-dismiss');
  const matchCountEl = document.getElementById('reader-match-count');
  const readerWrap = readerInput.closest('.reader-search-wrap');
  const prevBtn = document.getElementById('reader-search-prev');
  const nextBtn = document.getElementById('reader-search-next');
  let readerDebounce;

  const triggerReaderSearch = () => {
    const hasText = !!readerInput.value;
    readerClear.classList.toggle('visible', hasText);
    readerDismiss.classList.toggle('visible', hasText);
    readerWrap.classList.toggle('floating', hasText);
    highlightReaderMatches(readerInput.value, matchCountEl);
  };

  readerInput.addEventListener('input', () => {
    clearTimeout(readerDebounce);
    readerDebounce = setTimeout(triggerReaderSearch, 200);
  });

  readerInput.addEventListener('focus', () => {
    readerWrap.classList.add('floating');
    readerDismiss.classList.add('visible');
  });

  readerDismiss.addEventListener('click', () => {
    readerInput.value = '';
    triggerReaderSearch();
    readerWrap.classList.remove('floating');
    readerDismiss.classList.remove('visible');
    readerInput.blur();
  });
  prevBtn.addEventListener('click', () => jumpToMatch(-1, matchCountEl));
  nextBtn.addEventListener('click', () => jumpToMatch(1, matchCountEl));

  // Auto-highlight if coming from search
  const { highlight } = state.route;
  if (highlight) {
    readerInput.value = highlight;
    highlightReaderMatches(highlight, matchCountEl);
  }

  // Inject bookmark button into topbar
  let bmBtn = document.getElementById('bm-btn');
  if (!bmBtn) {
    bmBtn = document.createElement('button');
    bmBtn.id = 'bm-btn';
    document.getElementById('topbar').appendChild(bmBtn);
  }
  bmBtn.className = bmClass;
  bmBtn.textContent = bmIcon;
  bmBtn.onclick = () => {
    toggleBookmark(subId);
    const now = isBookmarked(subId);
    bmBtn.textContent = now ? '⭐' : '☆';
    bmBtn.className = now ? 'bm-btn bookmarked' : 'bm-btn';
  };
}

// ── In-page search (Find-in-Page style: highlight + navigate) ─────────────────
let currentMatchIndex = -1;
let allMatches = [];

function clearHighlights() {
  document.querySelectorAll('mark.find-highlight').forEach(mark => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();  // merge adjacent text nodes
  });
  allMatches = [];
  currentMatchIndex = -1;
}

function highlightReaderMatches(query, countEl) {
  clearHighlights();
  query = query.trim();

  if (!query) {
    countEl.textContent = '';
    return;
  }

  const reader = document.querySelector('.page-reader');
  if (!reader) return;

  // Walk all text nodes inside .line-block elements
  const blocks = reader.querySelectorAll('.line-block');
  const lowerQuery = query.toLowerCase();

  blocks.forEach(block => {
    highlightTextNodes(block, query, lowerQuery);
  });

  allMatches = [...document.querySelectorAll('mark.find-highlight')];

  if (allMatches.length > 0) {
    currentMatchIndex = 0;
    setActiveMatch(countEl);
  } else {
    countEl.textContent = '0 / 0';
  }
}

function highlightTextNodes(el, query, lowerQuery) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const nodesToProcess = [];
  while (walker.nextNode()) {
    nodesToProcess.push(walker.currentNode);
  }

  nodesToProcess.forEach(textNode => {
    const text = textNode.textContent;
    const lowerText = text.toLowerCase();
    let idx = lowerText.indexOf(lowerQuery);
    if (idx === -1) return;

    const frag = document.createDocumentFragment();
    let lastIdx = 0;

    while (idx !== -1) {
      // Text before match
      if (idx > lastIdx) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx, idx)));
      }
      // The match
      const mark = document.createElement('mark');
      mark.className = 'find-highlight';
      mark.textContent = text.slice(idx, idx + query.length);
      frag.appendChild(mark);
      lastIdx = idx + query.length;
      idx = lowerText.indexOf(lowerQuery, lastIdx);
    }
    // Remaining text
    if (lastIdx < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIdx)));
    }

    textNode.parentNode.replaceChild(frag, textNode);
  });
}

function setActiveMatch(countEl) {
  // Remove previous active
  document.querySelectorAll('mark.find-active').forEach(m => m.classList.remove('find-active'));

  if (allMatches.length === 0) {
    countEl.textContent = '0 / 0';
    return;
  }

  const active = allMatches[currentMatchIndex];
  active.classList.add('find-active');
  active.scrollIntoView({ behavior: 'smooth', block: 'center' });
  countEl.textContent = `${currentMatchIndex + 1} / ${allMatches.length}`;
}

function jumpToMatch(direction, countEl) {
  if (allMatches.length === 0) return;
  currentMatchIndex = (currentMatchIndex + direction + allMatches.length) % allMatches.length;
  setActiveMatch(countEl);
}

function renderLineBlock(line) {
  if (line.type === 'image') {
    const imgSrc = line.images?.en || line.images?.rurdu || line.images?.urdu;
    if (!imgSrc) return '';
    return `<div class="line-block line-image"><img src="${imgSrc}" alt=""/></div>`;
  }

  const cls = line.isRed ? 'line-block is-red' : 'line-block';
  let html = `<div class="${cls}">`;

  // Title
  const titleText = line.title?.en || line.title?.rurdu;
  if (titleText) html += `<div class="line-title">${escHtml(titleText)}</div>`;

  // Description
  const descText = line.desc?.en || line.desc?.rurdu;
  if (descText) {
    const minimized = line.minimizeDesc ? ' minimized' : '';
    html += `<div class="line-desc${minimized}">${escHtml(descText)}</div>`;
  }

  // Arabic segments with tajweed colours
  if (line.arabic?.length) {
    const segs = line.arabic.map(seg => {
      const cls = seg.green ? 'tj-green' : seg.red ? 'tj-red' : seg.blue ? 'tj-blue' : '';
      const sign = seg.green || seg.red || seg.blue || '';
      const signHtml = sign ? `<sup style="font-size:0.5em;margin-left:2px">${escHtml(sign)}</sup>` : '';
      return cls
        ? `<span class="${cls}">${escHtml(seg.text)}${signHtml}</span>`
        : escHtml(seg.text);
    }).join(' ');
    html += `<div class="arabic-block">${segs}</div>`;
  }

  // Romanised Arabic
  if (line.rarabic) {
    html += `<div class="rarabic-block">${escHtml(line.rarabic)}</div>`;
  }

  // Translations
  if (line.trans) {
    html += '<div class="trans-block">';
    if (line.trans.en) html += `<div class="trans-en">${escHtml(line.trans.en)}</div>`;
    if (line.trans.rurdu) html += `<div class="trans-rurdu">${escHtml(line.trans.rurdu)}</div>`;
    if (line.trans.urdu) html += `<span class="trans-urdu">${escHtml(line.trans.urdu)}</span>`;
    html += '</div>';
  }

  html += '</div>';
  return html;
}

// ── Search ────────────────────────────────────────────────────────────────────
let searchDebounce;

function renderSearch() {
  document.querySelector('.logo').style.display = 'none';
  $topbarTitle.style.display = '';
  $topbarTitle.textContent = 'Search';
  $backBtn.classList.remove('visible');
  removeBmBtn();

  $content.innerHTML = `
    <div class="page-search">
      <div id="search-results" class="search-results"></div>
    </div>
  `;

  // Focus the global search bar and trigger search if it already has text
  $globalSearchInput.focus();
  const existing = $globalSearchInput.value.trim();
  if (existing) {
    doSearch(existing, document.getElementById('search-results'));
  }
}

function doSearch(query, container) {
  query = query.trim().toLowerCase();
  if (!query) { container.innerHTML = ''; return; }

  const hits = state.search.filter(entry => {
    return (
      (entry.t?.en || '').toLowerCase().includes(query) ||
      (entry.t?.rurdu || '').toLowerCase().includes(query) ||
      (entry.t?.urdu || '').includes(query) ||
      (entry.preview?.en || '').toLowerCase().includes(query)
    );
  }).slice(0, 40);

  if (hits.length > 0) {
    container.innerHTML = hits.map(h => `
      <div class="search-result-item" data-id="${h.id}">
        <div class="sri-en">${escHtml(h.t?.en || '—')}</div>
        ${h.t?.rurdu ? `<div class="sri-rurdu">${escHtml(h.t.rurdu)}</div>` : ''}
        ${h.preview?.arabic ? `<span class="sri-preview">${escHtml(h.preview.arabic)}</span>` : ''}
      </div>
    `).join('');
  } else {
    container.innerHTML = '';
  }

  // Deep search logic — auto-trigger when no index hits, or when checkbox is on
  if ($deepSearchCheck.checked || hits.length === 0) {
    if (hits.length === 0) {
      // Show a placeholder so the user knows something is happening
      container.innerHTML = `<div class="search-empty">No quick results — scanning all content…</div>`;
    }
    performDeepSearch(query, container);
  }

  container.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      navigate('reader', { subId: +el.dataset.id, breadcrumb: [], highlight: query });
    });
  });
}

// ── Deep Search ───────────────────────────────────────────────────────────────
async function performDeepSearch(query, container) {
  // 1. Load data once if needed
  if (!state.deepSearch) {
    try {
      state.deepSearch = await fetchJSON('./deep_search.json');
    } catch (e) {
      console.error('Failed to load deep search index', e);
      return;
    }
  }

  const q = query.toLowerCase();
  let matchesCount = 0;

  // Create UI containers
  const deepWrap = document.createElement('div');
  deepWrap.className = 'deep-search-wrap';
  deepWrap.innerHTML = `
    <div class="deep-search-status">Deep searching...</div>
    <div class="deep-search-results-list"></div>
  `;
  container.appendChild(deepWrap);

  const statusEl = deepWrap.querySelector('.deep-search-status');
  const resultsEl = deepWrap.querySelector('.deep-search-results-list');

  // Search in-memory
  for (const entry of state.deepSearch) {
    if (entry.c.includes(q)) {
      const searchEntry = state.search.find(s => s.id === entry.id);
      if (searchEntry) {
        appendDeepResult(resultsEl, searchEntry, query);
        matchesCount++;
      }
    }
  }

  statusEl.textContent = matchesCount > 0
    ? `Deep search complete: ${matchesCount} result(s) found.`
    : 'Deep search complete: No additional results found.';
  statusEl.classList.add('complete');
}

function appendDeepResult(container, entry, query) {
  // Avoid duplicate if already in top hits
  const mainResults = container.closest('.search-results');
  if (mainResults && mainResults.querySelector(`.search-result-item[data-id="${entry.id}"]:not(.deep-match)`)) {
    return;
  }

  const div = document.createElement('div');
  div.className = 'search-result-item deep-match';
  div.dataset.id = entry.id;
  div.innerHTML = `
    <div class="sri-en">${escHtml(entry.t?.en || '—')}</div>
    ${entry.t?.rurdu ? `<div class="sri-rurdu">${escHtml(entry.t.rurdu)}</div>` : ''}
    <div class="sri-tag">Deep Match</div>
  `;
  div.addEventListener('click', () => {
    navigate('reader', { subId: +entry.id, breadcrumb: [], highlight: query });
  });
  container.appendChild(div);
}

function renderBookmarks() {
  document.querySelector('.logo').style.display = 'none';
  $topbarTitle.style.display = '';
  $topbarTitle.textContent = 'Bookmarks';
  $backBtn.classList.remove('visible');
  removeBmBtn();

  if (state.bookmarks.size === 0) {
    $content.innerHTML = `
      <div class="empty-state">
        <div class="icon">☆</div>
        <p>No bookmarks yet.<br>Tap ☆ while reading a dua to save it here.</p>
      </div>`;
    return;
  }

  const items = [...state.bookmarks].map(id => {
    const entry = state.search.find(e => e.id === id);
    if (!entry) return '';
    return `
      <div class="bookmark-item" data-id="${id}">
        <div class="bookmark-text">
          <div class="bookmark-en">${escHtml(entry.t?.en || '—')}</div>
          ${entry.t?.urdu ? `<div class="bookmark-urdu">${escHtml(entry.t.urdu)}</div>` : ''}
        </div>
        <button class="bookmark-del" data-id="${id}" title="Remove">✕</button>
      </div>`;
  }).join('');

  $content.innerHTML = `<div class="page-bookmarks">${items}</div>`;

  $content.querySelectorAll('.bookmark-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.classList.contains('bookmark-del')) return;
      navigate('reader', { subId: +el.dataset.id, breadcrumb: [] });
    });
  });

  $content.querySelectorAll('.bookmark-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.id;
      state.bookmarks.delete(id);
      saveBookmarks();
      renderBookmarks();
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function removeBmBtn() {
  const b = document.getElementById('bm-btn');
  if (b) b.remove();
}

// ── Bottom nav wiring ─────────────────────────────────────────────────────────
$navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    removeBmBtn();
    if (tab === 'home') goHome();
    if (tab === 'search') goSearch();
    if (tab === 'bookmarks') goBookmarks();
  });
});

// ── Global search bar wiring ──────────────────────────────────────────────────
const $globalSearchClear = document.getElementById('global-search-clear');
const $globalSearchDismiss = document.getElementById('global-search-dismiss');

$globalSearchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  const hasText = !!$globalSearchInput.value;
  $globalSearchClear.classList.toggle('visible', hasText);
  $globalSearchDismiss.classList.toggle('visible', hasText);
  $globalSearchBar.classList.toggle('floating', hasText);

  // If not already on search view, switch to it
  if (state.route.view !== 'search') {
    setActiveNav('search');
    state.route = { view: 'search' };
    document.querySelector('.logo').style.display = 'none';
    $topbarTitle.style.display = '';
    $topbarTitle.textContent = 'Search';
    $backBtn.classList.remove('visible');
    removeBmBtn();
    $content.innerHTML = `<div class="page-search"><div id="search-results" class="search-results"></div></div>`;
  }

  const results = document.getElementById('search-results');
  searchDebounce = setTimeout(() => doSearch($globalSearchInput.value, results), 280);
});

$globalSearchInput.addEventListener('focus', () => {
  $globalSearchBar.classList.add('floating');
  $globalSearchDismiss.classList.add('visible');
});

$globalSearchDismiss.addEventListener('click', () => {
  $globalSearchInput.value = '';
  $globalSearchClear.classList.remove('visible');
  $globalSearchDismiss.classList.remove('visible');
  $globalSearchBar.classList.remove('floating');
  if (state.route.view === 'search') {
    const results = document.getElementById('search-results');
    if (results) results.innerHTML = '';
  }
  $globalSearchInput.blur();
});

$globalSearchClear.addEventListener('click', () => {
  $globalSearchInput.value = '';
  $globalSearchClear.classList.remove('visible');
  if (state.route.view === 'search') {
    const results = document.getElementById('search-results');
    if (results) results.innerHTML = '';
  }
  $globalSearchInput.focus();
});

// Clear global search when navigating away via explicit action
$globalSearchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    $globalSearchInput.value = '';
    $globalSearchInput.blur();
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  // Apply saved language visibility
  syncLangCheckboxes();
  applyLangs();

  // Apply theme
  applyTheme();

  // Apply saved font sizes
  syncFontSliders();
  applyFontSizes();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => { });
  }

  // Show loading state
  $content.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';

  try {
    await loadCoreData();
  } catch (e) {
    $content.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <p>Could not load data.<br>Please check your connection and reload.</p>
      </div>`;
    return;
  }

  goHome();
}

boot();