(() => {
  "use strict";

  let accountMap = {};

  function buildAccountMap(accounts) {
    accountMap = {};
    for (const a of accounts) {
      accountMap[a.handle.toLowerCase()] = a;
    }
  }

  function loadAccounts(cb) {
    chrome.storage.sync.get(["customAccounts", "disabledHandles"], (data) => {
      const custom = data.customAccounts || [];
      const disabled = new Set((data.disabledHandles || []).map(h => h.toLowerCase()));
      const merged = [...MEDIACHECK_DEFAULT_ACCOUNTS, ...custom].filter(
        a => !disabled.has(a.handle.toLowerCase())
      );
      buildAccountMap(merged);
      if (cb) cb();
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function handleFromHref(href) {
    if (!href) return null;
    const m = href.match(/^\/([A-Za-z0-9_]{1,50})(?:\/|$)/);
    return m ? m[1].toLowerCase() : null;
  }

  function getCat(account) {
    return MEDIACHECK_CATEGORIES[account.category] || {
      color: "#555", icon: "⚠", bgColor: "#f5f5f5", borderColor: "#999"
    };
  }

  // ── Inline badge (used in tweet headers and sidebars) ────────────────────────

  function makeBadge(account) {
    const cat = getCat(account);
    const badge = document.createElement("span");
    badge.className = `mc-badge mc-cat-${account.category}`;
    badge.dataset.mcHandle = account.handle.toLowerCase();
    badge.setAttribute("role", "img");
    badge.setAttribute("aria-label", `Mediacheck warning: ${account.label}`);

    badge.innerHTML = `
      <span class="mc-badge-icon">${cat.icon}</span>
      <span class="mc-badge-text">${account.label}</span>
      <span class="mc-badge-chevron">›</span>
    `;

    const tip = document.createElement("div");
    tip.className = "mc-tooltip";
    tip.innerHTML = `
      <div class="mc-tip-head">
        <span class="mc-tip-icon">${cat.icon}</span>
        <span class="mc-tip-label">${account.label}</span>
      </div>
      <div class="mc-tip-body">${account.detail}</div>
      ${account.source ? `<div class="mc-tip-source">— ${account.source}</div>` : ""}
    `;
    badge.appendChild(tip);

    return badge;
  }

  // ── Profile page banner ──────────────────────────────────────────────────────

  function makeProfileBanner(account) {
    const cat = getCat(account);
    const banner = document.createElement("div");
    banner.id = "mc-profile-banner";
    banner.className = `mc-profile-banner mc-cat-${account.category}`;
    banner.style.setProperty("--mc-accent", cat.borderColor);
    banner.style.setProperty("--mc-bg", cat.bgColor);
    banner.style.setProperty("--mc-color", cat.color);

    banner.innerHTML = `
      <div class="mc-banner-left">
        <span class="mc-banner-icon">${cat.icon}</span>
      </div>
      <div class="mc-banner-body">
        <div class="mc-banner-title">
          ${account.label}
          ${account.blocked ? '<span class="mc-banner-blocked-tag">Content hidden by default</span>' : ""}
        </div>
        <div class="mc-banner-detail">${account.detail}</div>
        ${account.source ? `<div class="mc-banner-source">${account.source}</div>` : ""}
      </div>
      <button class="mc-banner-close" title="Dismiss warning" aria-label="Dismiss">✕</button>
    `;

    banner.querySelector(".mc-banner-close").addEventListener("click", () => banner.remove());
    return banner;
  }

  // ── Tweet block overlay ──────────────────────────────────────────────────────

  function makeBlockOverlay(account) {
    const cat = getCat(account);
    const overlay = document.createElement("div");
    overlay.className = `mc-block-overlay mc-cat-${account.category}`;
    overlay.style.setProperty("--mc-accent", cat.borderColor);
    overlay.style.setProperty("--mc-bg", cat.bgColor);
    overlay.style.setProperty("--mc-color", cat.color);

    overlay.innerHTML = `
      <div class="mc-ov-icon">${cat.icon}</div>
      <div class="mc-ov-text">
        <strong>@${account.handle}</strong> — ${account.label}
        <div class="mc-ov-detail">${account.detail}</div>
      </div>
      <button class="mc-ov-btn">View anyway</button>
    `;

    overlay.querySelector(".mc-ov-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const article = overlay.closest("article");
      if (article) {
        article.classList.remove("mc-tweet-blocked");
        article.dataset.mcRevealed = "1";
      }
      overlay.remove();
    });

    return overlay;
  }

  // ── Process a single tweet article ──────────────────────────────────────────

  function processTweet(article) {
    if (article.dataset.mcTweet) return;

    const userNameBlock = article.querySelector('[data-testid="User-Name"]');
    if (!userNameBlock) return;

    let handle = null;
    const links = userNameBlock.querySelectorAll("a[href]");
    for (const link of links) {
      const h = handleFromHref(link.getAttribute("href"));
      if (h && accountMap[h]) { handle = h; break; }
    }
    if (!handle) return;

    article.dataset.mcTweet = handle;
    const account = accountMap[handle];

    // Badge next to @handle link
    const handleLink = [...links].find(l => handleFromHref(l.getAttribute("href")) === handle);
    if (handleLink) {
      const parent = handleLink.closest('[dir]') || handleLink.parentElement;
      if (parent && !parent.querySelector(`.mc-badge[data-mc-handle="${handle}"]`)) {
        handleLink.insertAdjacentElement("afterend", makeBadge(account));
      }
    }

    // Block overlay for flagged-as-blocked accounts
    if (account.blocked && !article.dataset.mcRevealed) {
      article.classList.add("mc-tweet-blocked");
      if (!article.querySelector(".mc-block-overlay")) {
        article.appendChild(makeBlockOverlay(account));
      }
    }
  }

  // ── Process UserCell (sidebar, who-to-follow) ────────────────────────────────

  function processUserCell(cell) {
    if (cell.dataset.mcDone) return;
    const link = cell.querySelector("a[href]");
    if (!link) return;
    const handle = handleFromHref(link.getAttribute("href"));
    if (!handle || !accountMap[handle]) return;
    cell.dataset.mcDone = handle;

    const nameEl = cell.querySelector('[dir="ltr"] > span') || link;
    if (!nameEl.parentElement.querySelector(`.mc-badge[data-mc-handle="${handle}"]`)) {
      nameEl.insertAdjacentElement("afterend", makeBadge(accountMap[handle]));
    }
  }

  // ── Profile page banner injection ────────────────────────────────────────────

  const NON_PROFILE_PATHS = new Set([
    "home", "explore", "notifications", "messages",
    "settings", "i", "search", "compose", "bookmarks"
  ]);

  function tryInjectProfileBanner() {
    if (document.getElementById("mc-profile-banner")) return;

    const parts = window.location.pathname.split("/").filter(Boolean);
    if (!parts.length || NON_PROFILE_PATHS.has(parts[0])) return;

    const handle = parts[0].toLowerCase();
    const account = accountMap[handle];
    if (!account) return;

    // Try several insertion points, from most to least specific
    const tabList   = document.querySelector('[role="tablist"]');
    const headerItems = document.querySelector('[data-testid="UserProfileHeader_Items"]');
    const description = document.querySelector('[data-testid="UserDescription"]');
    const primaryCol  = document.querySelector('[data-testid="primaryColumn"]');

    const banner = makeProfileBanner(account);

    if (tabList) {
      // Insert just above the Posts/Replies/Media tab row — most reliable
      tabList.closest("nav, div")?.insertAdjacentElement("beforebegin", banner) ??
        tabList.insertAdjacentElement("beforebegin", banner);
    } else if (headerItems) {
      headerItems.insertAdjacentElement("afterend", banner);
    } else if (description) {
      description.insertAdjacentElement("afterend", banner);
    } else if (primaryCol) {
      primaryCol.prepend(banner);
    }
  }

  // ── Full scan ────────────────────────────────────────────────────────────────

  function scanRoot(root) {
    if (root.querySelectorAll) {
      root.querySelectorAll('article[data-testid="tweet"]').forEach(processTweet);
      root.querySelectorAll('[data-testid="UserCell"]').forEach(processUserCell);
    }
    tryInjectProfileBanner();
  }

  // ── MutationObserver ─────────────────────────────────────────────────────────

  let scanQueued = false;
  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(() => { scanQueued = false; scanRoot(document.body); });
  }

  const observer = new MutationObserver(queueScan);

  // ── SPA navigation ────────────────────────────────────────────────────────────

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      document.getElementById("mc-profile-banner")?.remove();
      setTimeout(() => scanRoot(document.body), 900);
    }
  }).observe(document, { subtree: true, childList: true });

  // ── Storage changes (popup edits) ────────────────────────────────────────────

  chrome.storage.onChanged.addListener(() => {
    loadAccounts(() => {
      document.querySelectorAll(".mc-badge, .mc-block-overlay, #mc-profile-banner").forEach(e => e.remove());
      document.querySelectorAll("[data-mc-tweet], [data-mc-done]").forEach(el => {
        el.classList.remove("mc-tweet-blocked");
        delete el.dataset.mcTweet;
        delete el.dataset.mcDone;
      });
      scanRoot(document.body);
    });
  });

  // ── Init ─────────────────────────────────────────────────────────────────────

  loadAccounts(() => {
    scanRoot(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
