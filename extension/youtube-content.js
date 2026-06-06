// Pluto — Media Intelligence · YouTube content script
(function () {
  'use strict';
  if (window.__plutoYTLoaded) return;
  window.__plutoYTLoaded = true;

  /* ── Settings ─────────────────────────────────────────────────── */
  const settings = { showBadges: true, showBanners: true, showSidebarWidget: true };
  chrome.storage.sync.get(
    { showBadges: true, showBanners: true, showSidebarWidget: true },
    s => Object.assign(settings, s)
  );

  /* ── Trusted accounts ─────────────────────────────────────────── */
  let trustedSet = new Set();
  chrome.storage.sync.get({ trustedAccounts: [] }, d => {
    trustedSet = new Set(d.trustedAccounts.map(h => h.toLowerCase()));
  });
  function isTrusted(handle) {
    return trustedSet.has((handle || '').toLowerCase());
  }

  /* ── Handle normalization ─────────────────────────────────────── */
  function norm(h) {
    return (h || '').toLowerCase().replace(/[_\-\.@\s]/g, '');
  }

  // YouTube handle → Twitter handle overrides (where they differ significantly)
  const YT_OVERRIDES = {
    // Russian
    'rt':                 'RT_com',
    'rtnews':             'RT_com',
    'rtdoc':              'RT_Documentary',
    'rtdocumentary':      'RT_Documentary',
    'rtuk':               'RT_UK',
    'rtindia':            'RT_India',
    'sputniknews':        'SputnikInt',
    'sputniknewsofficial':'SputnikInt',
    'sputnik':            'SputnikInt',
    'ruptly':             'Ruptly',
    'redfishstream':      'Redfishstream',
    'redfishmedia':       'Redfishstream',
    'zvezda':             'ZvezdaTV_ru',
    'zvezdatv':           'ZvezdaTV_ru',
    // Chinese
    'cgtn':               'cgtnamerica',
    'cgtnofficial':       'cgtnamerica',
    'cgtnenglish':        'cgtnamerica',
    'cgtneurope':         'CGTNEurope',
    'cgtnafrica':         'CGTNAfrica',
    'cgtnfrancais':       'CGTNFrancais',
    'cgtnamerica':        'cgtnamerica',
    'chinadailynewspaper':'ChinaDaily',
    'criofficial':        'CRI_English',
    'crienglishtv':       'CRI_English',
    'xinhua':             'XHNews',
    'xinhuanewsagency':   'XHNews',
    'xinhuanews':         'XHNews',
    'xinhuanewsnetwork':  'XHNews',
    'peopledailychina':   'PDChina',
    'globaltimes':        'GlobalTimesOP',
    // Iranian
    'presstv':            'PressTV',
    'presstvofficial':    'PressTV',
    'hispantv':           'HispanTV',
    'almayadeen':         'AlMayadeen_en',
    'almanar':            'AlManarNews',
    'almanar':            'AlManarNews',
    // Venezuelan / Cuban
    'telesur':            'teleSURArabic',
    'teleSUR':            'teleSURArabic',
    'actualidadrt':       'ActualidadRT',
    // Tucker / Western pro-Russia
    'tuckercarlson':      'TuckerCarlson',
    'thegrayzone':        'GrayzoneNews',
    'grayzoneproject':    'GrayzoneNews',
  };

  /* ── Account map ──────────────────────────────────────────────── */
  const ytMap = new Map(); // normalized handle → account

  // Auto-register all visible accounts by their Twitter handle
  for (const acc of PLUTO_ACCOUNTS) {
    const c = PLUTO_CATEGORIES[acc.category];
    if (c?.hidden) continue;
    ytMap.set(acc.handle.toLowerCase(), acc);
    ytMap.set(norm(acc.handle), acc);
  }

  // Apply explicit YouTube overrides
  for (const [ytH, twitterH] of Object.entries(YT_OVERRIDES)) {
    const acc = PLUTO_ACCOUNTS.find(a => a.handle.toLowerCase() === twitterH.toLowerCase());
    if (acc) {
      ytMap.set(ytH.toLowerCase(), acc);
      ytMap.set(norm(ytH), acc);
    }
  }

  function lookup(handle) {
    if (!handle) return null;
    const h = handle.replace(/^@/, '');
    return ytMap.get(h.toLowerCase()) || ytMap.get(norm(h)) || null;
  }

  /* ── Category helper ──────────────────────────────────────────── */
  function cat(account) {
    const c = PLUTO_CATEGORIES[account?.category];
    if (!c || c.hidden) return null;
    return c;
  }

  /* ── Handle extraction from href ─────────────────────────────── */
  function handleFromHref(href) {
    if (!href) return null;
    let m = href.match(/\/@([^/?&#\s]+)/);
    if (m) return m[1];
    m = href.match(/\/c\/([^/?&#\s]+)/);
    if (m) return m[1];
    return null;
  }

  /* ── Page flag tracking ───────────────────────────────────────── */
  const pageFlags = new Set();

  /* ── Badge element ────────────────────────────────────────────── */
  function makeBadge(acc) {
    const c = cat(acc);
    if (!c) return null;
    const el = document.createElement('span');
    el.className = 'pluto-yt-badge';
    el.dataset.plutoCategory = acc.category;
    el.title = [c.label, acc.country, acc.detail].filter(Boolean).join(' · ');
    el.innerHTML = `<span class="pyb-icon">${c.textIcon}</span><span class="pyb-label">${c.label}</span>`;
    el.style.setProperty('--pc', c.color);
    el.style.setProperty('--pb', c.bgColor);
    el.style.setProperty('--pbd', c.borderColor);
    return el;
  }

  /* ── Watch / channel page banner ──────────────────────────────── */
  function makeYtBanner(acc, displayName) {
    const c = cat(acc);
    if (!c) return null;
    const el = document.createElement('div');
    el.id = 'pluto-yt-banner';
    el.className = `pluto-yt-banner pluto-yt-cat-${acc.category}`;
    el.style.setProperty('--pc', c.color);
    el.style.setProperty('--pb', c.bgColor);
    el.style.setProperty('--pbd', c.borderColor);

    const name = displayName || `@${acc.handle}`;
    const country = acc.country ? ` · ${acc.country}` : '';
    const blockedChip = acc.blocked
      ? `<span class="pyt-blocked-chip">⊘ Blocked by default</span>` : '';
    const sourceLine = acc.source
      ? `<div class="pyt-source">Sources: ${acc.source}</div>` : '';

    el.innerHTML = `
      <div class="pyt-content">
        <div class="pyt-row1">
          <span class="pyt-name">${name}${country}</span>
          <span class="pyt-cat-chip">${c.textIcon} ${c.label}</span>
          ${blockedChip}
        </div>
        <div class="pyt-detail">${acc.detail || ''}</div>
        ${sourceLine}
      </div>
      <div class="pyt-btns">
        <button class="pyt-trust" title="Hide warnings for this channel">✓ Trust</button>
        <button class="pyt-close" title="Close">✕</button>
      </div>`;

    el.querySelector('.pyt-trust').addEventListener('click', () => {
      chrome.storage.sync.get({ trustedAccounts: [] }, d => {
        const t = d.trustedAccounts;
        if (!t.includes(acc.handle)) t.push(acc.handle);
        chrome.storage.sync.set({ trustedAccounts: t });
      });
      el.remove();
    });
    el.querySelector('.pyt-close').addEventListener('click', () => el.remove());
    return el;
  }

  /* ── Video card processing ────────────────────────────────────── */
  function processVideoCard(card) {
    if (card.dataset.plutoYt) return;

    const channelLink =
      card.querySelector('ytd-channel-name a.yt-simple-endpoint[href]') ||
      card.querySelector('#channel-name a[href]') ||
      card.querySelector('a.yt-simple-endpoint[href*="/@"]');
    if (!channelLink) return;

    const handle = handleFromHref(channelLink.getAttribute('href'));
    if (!handle) return;

    card.dataset.plutoYt = handle;
    if (isTrusted(handle)) return;
    const acc = lookup(handle);
    if (!acc) return;

    if (!settings.showBadges) return;

    const badge = makeBadge(acc);
    if (!badge) return;

    const nameEl =
      channelLink.closest('ytd-channel-name') ||
      channelLink.closest('#channel-name') ||
      channelLink.parentElement;
    nameEl.insertAdjacentElement('afterend', badge);

    // Overlay on thumbnail for blocked accounts
    if (acc.blocked) {
      const thumb = card.querySelector('#thumbnail, ytd-thumbnail, a#thumbnail');
      if (thumb && !thumb.querySelector('.pluto-yt-block-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'pluto-yt-block-overlay';
        overlay.innerHTML = `<div class="pybo-inner"><span class="pybo-icon">${PLUTO_CATEGORIES[acc.category]?.textIcon || '★'}</span><span class="pybo-text">State Media</span></div>`;
        overlay.style.setProperty('--pb', PLUTO_CATEGORIES[acc.category]?.bgColor || '#fffbeb');
        overlay.style.setProperty('--pc', PLUTO_CATEGORIES[acc.category]?.color || '#b45309');
        thumb.style.position = 'relative';
        thumb.appendChild(overlay);
      }
    }

    pageFlags.add(handle.toLowerCase());
    updateSidebarCount();
  }

  /* ── Watch page banner ────────────────────────────────────────── */
  let watchBannerHandle = null;

  function processWatchPage() {
    if (!settings.showBanners) return;
    if (!location.pathname.startsWith('/watch')) return;

    const ownerLink =
      document.querySelector('#owner #channel-name a.yt-simple-endpoint[href]') ||
      document.querySelector('ytd-video-owner-renderer #channel-name a[href]') ||
      document.querySelector('#upload-info #channel-name a[href]') ||
      document.querySelector('#owner a.yt-simple-endpoint[href*="/@"]');
    if (!ownerLink) return;

    const handle = handleFromHref(ownerLink.getAttribute('href'));
    if (!handle || handle.toLowerCase() === watchBannerHandle) return;
    if (isTrusted(handle)) return;
    const acc = lookup(handle);
    if (!acc) return;

    watchBannerHandle = handle.toLowerCase();
    document.getElementById('pluto-yt-banner')?.remove();

    const displayName = ownerLink.textContent.trim();
    const banner = makeYtBanner(acc, displayName);
    if (!banner) return;

    const below =
      document.querySelector('#below') ||
      document.querySelector('ytd-watch-metadata') ||
      document.querySelector('#primary-inner');
    if (below) below.insertAdjacentElement('afterbegin', banner);

    pageFlags.add(handle.toLowerCase());
    updateSidebarCount();
  }

  /* ── Channel page banner ──────────────────────────────────────── */
  let channelBannerHandle = null;

  function processChannelPage() {
    if (!settings.showBanners) return;
    const m = location.pathname.match(/^\/@([^/?&#]+)/);
    if (!m) return;
    const handle = m[1];
    if (handle.toLowerCase() === channelBannerHandle) return;
    if (isTrusted(handle)) return;
    const acc = lookup(handle);
    if (!acc) return;

    channelBannerHandle = handle.toLowerCase();
    document.getElementById('pluto-yt-banner')?.remove();

    const displayName =
      document.querySelector('ytd-channel-header-renderer #channel-name yt-formatted-string')?.textContent.trim() ||
      document.querySelector('yt-page-header-renderer h1')?.textContent.trim() ||
      `@${handle}`;

    const banner = makeYtBanner(acc, displayName);
    if (!banner) return;

    const header =
      document.querySelector('ytd-c4-tabbed-header-renderer') ||
      document.querySelector('yt-page-header-renderer') ||
      document.querySelector('#channel-header');
    if (header) header.insertAdjacentElement('afterend', banner);

    pageFlags.add(handle.toLowerCase());
    updateSidebarCount();
  }

  /* ── Sidebar widget ───────────────────────────────────────────── */
  const YT_SIDEBAR_ID = 'pluto-yt-sidebar-widget';
  const YT_PANEL_ID   = 'pluto-yt-panel';

  function makeSidebarWidget() {
    const wrap = document.createElement('div');
    wrap.id = YT_SIDEBAR_ID;
    wrap.className = 'pluto-yt-sidebar';

    wrap.innerHTML = `
      <div class="pys-widget" id="${YT_SIDEBAR_ID}-btn">
        <span class="pys-glow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="7" stroke="#7c3aed" stroke-width="2"/>
            <path d="M17.5 17.5L21 21" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="11" cy="11" r="3" fill="#7c3aed" opacity="0.35"/>
          </svg>
        </span>
        <div class="pys-text">
          <span class="pys-name">Pluto</span>
          <span class="pys-sub" id="${YT_SIDEBAR_ID}-count">0 flagged</span>
        </div>
        <span class="pys-beta">BETA</span>
      </div>
      <div class="pluto-yt-panel" id="${YT_PANEL_ID}">
        <div class="pyp-header"><span>Flagged on this page</span><span class="pyp-shortcut">Alt+P</span></div>
        <div class="pyp-list" id="pluto-yt-panel-list"></div>
        <div class="pyp-footer" id="pluto-yt-panel-footer"></div>
      </div>`;

    wrap.querySelector(`#${YT_SIDEBAR_ID}-btn`).addEventListener('click', toggleYtPanel);
    return wrap;
  }

  function toggleYtPanel() {
    const panel = document.getElementById(YT_PANEL_ID);
    if (!panel) return;
    const opening = !panel.classList.contains('pyp-open');
    panel.classList.toggle('pyp-open', opening);
    if (opening) renderYtPanel();
  }

  function renderYtPanel() {
    const list   = document.getElementById('pluto-yt-panel-list');
    const footer = document.getElementById('pluto-yt-panel-footer');
    if (!list) return;
    list.innerHTML = '';

    const attachRescan = btn => btn?.addEventListener('click', () => {
      document.querySelectorAll('[data-pluto-yt]').forEach(el => delete el.dataset.plutoYt);
      document.querySelectorAll('.pluto-yt-badge').forEach(el => el.remove());
      pageFlags.clear();
      scan(document.body);
      setTimeout(renderYtPanel, 300);
    });

    if (pageFlags.size === 0) {
      list.innerHTML = `<div class="pyp-empty">No flagged channels visible yet.<br>Scroll to scan more videos.</div>`;
      if (footer) {
        footer.innerHTML = `<span></span><button class="pyp-rescan">↺ Rescan</button>`;
        attachRescan(footer.querySelector('.pyp-rescan'));
      }
      return;
    }

    for (const handle of pageFlags) {
      const acc = lookup(handle);
      if (!acc) continue;
      const c = cat(acc);
      if (!c) continue;
      const row = document.createElement('div');
      row.className = 'pyp-row';
      row.innerHTML = `
        <span class="pyp-chip" style="--pc:${c.color};--pb:${c.bgColor};--pbd:${c.borderColor}">${c.textIcon} ${c.label}</span>
        <span class="pyp-handle">@${acc.handle}</span>`;
      list.appendChild(row);
    }

    if (footer) {
      footer.innerHTML = `<span>${pageFlags.size} flagged</span><button class="pyp-rescan">↺ Rescan</button>`;
      attachRescan(footer.querySelector('.pyp-rescan'));
    }
  }

  function updateSidebarCount() {
    const el = document.getElementById(`${YT_SIDEBAR_ID}-count`);
    if (el) el.textContent = `${pageFlags.size} flagged`;
  }

  function injectSidebarWidget() {
    if (!settings.showSidebarWidget) return;
    if (document.getElementById(YT_SIDEBAR_ID)) return;

    const guide =
      document.querySelector('#guide-inner-content') ||
      document.querySelector('ytd-guide-renderer #items') ||
      document.querySelector('#guide-content #items') ||
      document.querySelector('#guide-content');
    if (!guide) return;

    guide.prepend(makeSidebarWidget());
  }

  /* ── Keyboard shortcut Alt+P ──────────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      toggleYtPanel();
    }
  }, true);

  /* ── Scanner ──────────────────────────────────────────────────── */
  const VIDEO_CARD_SELECTORS = [
    'ytd-rich-grid-media',
    'ytd-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-playlist-video-renderer',
    'ytd-reel-item-renderer',
  ].join(', ');

  function scan(root) {
    if (!settings.showBadges) return;
    root.querySelectorAll(VIDEO_CARD_SELECTORS).forEach(processVideoCard);
  }

  /* ── Page detection ───────────────────────────────────────────── */
  function detectPage() {
    if (location.pathname.startsWith('/watch')) {
      [0, 500, 1200, 2500].forEach(d => setTimeout(processWatchPage, d));
    } else if (location.pathname.match(/^\/@/)) {
      [0, 500, 1200, 2500].forEach(d => setTimeout(processChannelPage, d));
    }
  }

  /* ── MutationObserver ─────────────────────────────────────────── */
  let scanQueued = false;
  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(() => { scanQueued = false; scan(document.body); });
  }

  new MutationObserver(muts => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n.nodeType === 1) scan(n);
      }
    }
    queueScan();
  }).observe(document.body, { subtree: true, childList: true });

  // YouTube fires yt-navigate-finish on SPA navigations
  let lastPath = location.pathname + location.search;
  document.addEventListener('yt-navigate-finish', () => {
    const newPath = location.pathname + location.search;
    if (newPath === lastPath) return;
    lastPath = newPath;
    document.getElementById('pluto-yt-banner')?.remove();
    watchBannerHandle   = null;
    channelBannerHandle = null;
    pageFlags.clear();
    updateSidebarCount();
    detectPage();
    [200, 600, 1200].forEach(d => setTimeout(() => scan(document.body), d));
  });

  /* ── Init ─────────────────────────────────────────────────────── */
  scan(document.body);
  detectPage();
  setInterval(injectSidebarWidget, 700);
  setInterval(() => scan(document.body), 3000);

})();
