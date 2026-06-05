(() => {
  "use strict";

  // ── State ───────────────────────────────────────────────────────────────────

  let accountMap = {};
  let settings = {
    showProfileBanner:   true,
    showTweetBadge:      true,
    showAvatarIndicator: true,
    blockContent:        true
  };

  // ── Load ────────────────────────────────────────────────────────────────────

  function reload(cb) {
    chrome.storage.sync.get(
      ["customAccounts", "disabledHandles", "blockedOverrides", "settings"],
      data => {
        if (data.settings) Object.assign(settings, data.settings);

        const disabled        = new Set((data.disabledHandles || []).map(h => h.toLowerCase()));
        const blockedOverride = data.blockedOverrides || {};
        const custom          = data.customAccounts   || [];

        const merged = [...MEDIACHECK_DEFAULT_ACCOUNTS, ...custom].filter(
          a => !disabled.has(a.handle.toLowerCase())
        );

        accountMap = {};
        for (const a of merged) {
          const h = a.handle.toLowerCase();
          const blocked = h in blockedOverride ? blockedOverride[h] : !!a.blocked;
          accountMap[h] = { ...a, handle: h, blocked };
        }

        if (cb) cb();
      }
    );
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function handleFromHref(href) {
    if (!href) return null;
    const m = href.match(/^\/([A-Za-z0-9_]{1,50})(?:\/|$)/);
    return m ? m[1].toLowerCase() : null;
  }

  function getCat(account) {
    return MEDIACHECK_CATEGORIES[account.category] || {
      label: "Flagged", color: "#555", bgColor: "#f5f5f5",
      borderColor: "#999", icon: "⚠"
    };
  }

  function countDelta(n) {
    try { chrome.runtime.sendMessage({ type: "MC_COUNT", delta: n }); } catch (_) {}
  }

  // ── Elements ─────────────────────────────────────────────────────────────────

  function makeBadge(account) {
    const cat = getCat(account);
    const badge = document.createElement("span");
    badge.className = `mc-badge mc-cat-${account.category}`;
    badge.dataset.mcHandle = account.handle;
    badge.setAttribute("role", "img");
    badge.setAttribute("aria-label", `Mediacheck: ${cat.label}`);
    badge.style.setProperty("--mc-color", cat.color);
    badge.style.setProperty("--mc-bg", cat.bgColor);
    badge.style.setProperty("--mc-border", cat.borderColor);

    badge.innerHTML = `
      <span class="mc-badge-icon">${cat.icon}</span>
      <span class="mc-badge-text">${account.label || cat.label}</span>
    `;

    const tip = document.createElement("div");
    tip.className = "mc-tooltip";
    tip.innerHTML = `
      <div class="mc-tip-head">
        <span class="mc-tip-icon">${cat.icon}</span>
        <div>
          <div class="mc-tip-title">${account.label || cat.label}</div>
          <div class="mc-tip-handle">@${account.handle}${account.country ? ` · ${flag(account.country)}` : ""}</div>
        </div>
      </div>
      <div class="mc-tip-body">${account.detail || ""}</div>
      ${account.source ? `<div class="mc-tip-source">${account.source}</div>` : ""}
    `;
    badge.appendChild(tip);
    return badge;
  }

  function flag(code) {
    // Convert ISO 3166-1 alpha-2 to regional indicator emoji
    return [...code.toUpperCase()].map(c => String.fromCodePoint(c.codePointAt(0) + 127397)).join("");
  }

  function makeAvatarDot(account) {
    const cat = getCat(account);
    const dot = document.createElement("span");
    dot.className = `mc-avatar-dot mc-cat-${account.category}`;
    dot.dataset.mcHandle = account.handle;
    dot.style.setProperty("--mc-border", cat.borderColor);
    dot.style.background = cat.borderColor;
    dot.title = `Mediacheck: ${cat.label}`;
    return dot;
  }

  function makeProfileBanner(account) {
    const cat = getCat(account);
    const banner = document.createElement("div");
    banner.id = "mc-profile-banner";
    banner.className = `mc-profile-banner mc-cat-${account.category}`;
    banner.style.setProperty("--mc-color",  cat.color);
    banner.style.setProperty("--mc-bg",     cat.bgColor);
    banner.style.setProperty("--mc-border", cat.borderColor);

    const countryStr = account.country ? ` ${flag(account.country)}` : "";

    banner.innerHTML = `
      <div class="mc-banner-stripe"></div>
      <div class="mc-banner-icon-wrap"><span class="mc-banner-icon">${cat.icon}</span></div>
      <div class="mc-banner-body">
        <div class="mc-banner-row">
          <span class="mc-banner-title">${account.label || cat.label}${countryStr}</span>
          ${account.blocked && settings.blockContent ? '<span class="mc-banner-chip">Content hidden by default</span>' : ""}
          <span class="mc-banner-cat-tag">${cat.label}</span>
        </div>
        <div class="mc-banner-detail">${account.detail || ""}</div>
        ${account.source ? `<div class="mc-banner-source">Source: ${account.source}</div>` : ""}
      </div>
      <button class="mc-banner-close" aria-label="Dismiss">✕</button>
    `;

    banner.querySelector(".mc-banner-close").addEventListener("click", () => banner.remove());
    return banner;
  }

  function makeBlockOverlay(account) {
    const cat = getCat(account);
    const ov = document.createElement("div");
    ov.className = `mc-block-overlay mc-cat-${account.category}`;
    ov.style.setProperty("--mc-color",  cat.color);
    ov.style.setProperty("--mc-bg",     cat.bgColor);
    ov.style.setProperty("--mc-border", cat.borderColor);

    ov.innerHTML = `
      <div class="mc-ov-pill">
        <span class="mc-ov-icon">${cat.icon}</span>
        <div class="mc-ov-info">
          <span class="mc-ov-title">${account.label || cat.label} · @${account.handle}</span>
          <span class="mc-ov-sub">${account.detail ? account.detail.slice(0, 120) + (account.detail.length > 120 ? "…" : "") : ""}</span>
        </div>
        <button class="mc-ov-reveal">View anyway</button>
      </div>
    `;

    ov.querySelector(".mc-ov-reveal").addEventListener("click", e => {
      e.stopPropagation();
      const art = ov.closest("article");
      if (art) { art.classList.remove("mc-tweet-blocked"); art.dataset.mcRevealed = "1"; }
      ov.remove();
    });

    return ov;
  }

  // ── Tweet processing ─────────────────────────────────────────────────────────

  function processTweet(article) {
    if (article.dataset.mcTweet) return;

    const userBlock = article.querySelector('[data-testid="User-Name"]');
    if (!userBlock) return;

    let handle = null;
    const links = userBlock.querySelectorAll("a[href]");
    for (const link of links) {
      const h = handleFromHref(link.getAttribute("href"));
      if (h && accountMap[h]) { handle = h; break; }
    }
    if (!handle) return;

    article.dataset.mcTweet = handle;
    const account = accountMap[handle];

    // Badge next to handle link
    if (settings.showTweetBadge) {
      const handleLink = [...links].find(l => handleFromHref(l.getAttribute("href")) === handle);
      if (handleLink) {
        const container = handleLink.closest("[dir]") || handleLink.parentElement;
        if (container && !container.querySelector(`.mc-badge[data-mc-handle="${handle}"]`)) {
          handleLink.insertAdjacentElement("afterend", makeBadge(account));
          countDelta(1);
        }
      }
    }

    // Avatar dot
    if (settings.showAvatarIndicator) {
      const avatarWrap = article.querySelector('[data-testid="Tweet-User-Avatar"]');
      if (avatarWrap && !avatarWrap.querySelector(".mc-avatar-dot")) {
        avatarWrap.style.position = "relative";
        avatarWrap.appendChild(makeAvatarDot(account));
      }
    }

    // Content blocking
    if (settings.blockContent && account.blocked && !article.dataset.mcRevealed) {
      article.classList.add("mc-tweet-blocked");
      if (!article.querySelector(".mc-block-overlay")) {
        article.appendChild(makeBlockOverlay(account));
      }
    }
  }

  // ── Sidebar user cells ───────────────────────────────────────────────────────

  function processUserCell(cell) {
    if (cell.dataset.mcDone) return;
    const link = cell.querySelector("a[href]");
    if (!link) return;
    const handle = handleFromHref(link.getAttribute("href"));
    if (!handle || !accountMap[handle]) return;
    cell.dataset.mcDone = handle;

    if (settings.showTweetBadge) {
      const nameEl = cell.querySelector('[dir="ltr"] span') || link;
      if (!nameEl.parentElement?.querySelector(`.mc-badge[data-mc-handle="${handle}"]`)) {
        nameEl.insertAdjacentElement("afterend", makeBadge(accountMap[handle]));
      }
    }
  }

  // ── Profile banner ───────────────────────────────────────────────────────────

  const NON_PROFILE = new Set([
    "home", "explore", "notifications", "messages",
    "settings", "i", "search", "compose", "bookmarks", "lists"
  ]);

  function tryProfileBanner() {
    if (!settings.showProfileBanner) return;
    if (document.getElementById("mc-profile-banner")) return;

    const parts = window.location.pathname.split("/").filter(Boolean);
    if (!parts.length || NON_PROFILE.has(parts[0].toLowerCase())) return;

    const handle = parts[0].toLowerCase();
    const account = accountMap[handle];
    if (!account) return;

    const banner = makeProfileBanner(account);

    // Insert before the Posts/Replies/Media tab row — most stable landmark
    const tabList = document.querySelector('[role="tablist"]');
    if (tabList) {
      const nav = tabList.closest("nav") || tabList.parentElement;
      nav?.insertAdjacentElement("beforebegin", banner);
    } else {
      // Fallback: after bio/header items
      const anchor =
        document.querySelector('[data-testid="UserProfileHeader_Items"]') ||
        document.querySelector('[data-testid="UserDescription"]');
      if (anchor) anchor.insertAdjacentElement("afterend", banner);
      else document.querySelector('[data-testid="primaryColumn"]')?.prepend(banner);
    }

    countDelta(1);
  }

  // ── Scan ─────────────────────────────────────────────────────────────────────

  function scanRoot(root) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll('article[data-testid="tweet"]').forEach(processTweet);
    root.querySelectorAll('[data-testid="UserCell"]').forEach(processUserCell);
    tryProfileBanner();
  }

  // ── Observer + SPA nav ───────────────────────────────────────────────────────

  let scanPending = false;
  function queueScan() {
    if (scanPending) return;
    scanPending = true;
    requestAnimationFrame(() => { scanPending = false; scanRoot(document.body); });
  }

  const domObserver = new MutationObserver(queueScan);

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    document.getElementById("mc-profile-banner")?.remove();
    setTimeout(() => scanRoot(document.body), 900);
  }).observe(document, { subtree: true, childList: true });

  // ── Storage changes ──────────────────────────────────────────────────────────

  chrome.storage.onChanged.addListener(() => {
    reload(() => {
      // Tear down everything and re-scan
      document.querySelectorAll(".mc-badge, .mc-block-overlay, .mc-avatar-dot, #mc-profile-banner")
        .forEach(el => el.remove());
      document.querySelectorAll("[data-mc-tweet], [data-mc-done]").forEach(el => {
        el.classList.remove("mc-tweet-blocked");
        delete el.dataset.mcTweet;
        delete el.dataset.mcDone;
        delete el.dataset.mcRevealed;
      });
      scanRoot(document.body);
    });
  });

  // ── Init ─────────────────────────────────────────────────────────────────────

  reload(() => {
    scanRoot(document.body);
    domObserver.observe(document.body, { childList: true, subtree: true });
  });
})();
