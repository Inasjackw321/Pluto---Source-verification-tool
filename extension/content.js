(() => {
  "use strict";

  // ── State ────────────────────────────────────────────────────────────────────

  let accountMap   = {};
  let trustedSet   = new Set();
  let sessionCount = 0;

  let settings = {
    showSidebarWidget:   true,
    showProfileBanner:   true,
    showTweetBadge:      true,
    showAvatarDot:       true,
    blockContent:        true,
    highlightTweets:     false
  };

  // ── Load ─────────────────────────────────────────────────────────────────────

  function reload(cb) {
    chrome.storage.sync.get(
      ["customAccounts","disabledHandles","blockedOverrides","trustedHandles","settings"],
      data => {
        if (data.settings) Object.assign(settings, data.settings);

        trustedSet = new Set((data.trustedHandles || []).map(h => h.toLowerCase()));

        const disabled        = new Set((data.disabledHandles  || []).map(h => h.toLowerCase()));
        const blockedOverride = data.blockedOverrides || {};
        const custom          = data.customAccounts   || [];

        const merged = [...PLUTO_ACCOUNTS, ...custom].filter(
          a => !disabled.has(a.handle.toLowerCase())
        );

        accountMap = {};
        for (const a of merged) {
          const h = a.handle.toLowerCase();
          if (trustedSet.has(h)) continue;
          accountMap[h] = {
            ...a, handle: h,
            blocked: h in blockedOverride ? blockedOverride[h] : !!a.blocked
          };
        }

        if (cb) cb();
      }
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function handleFromHref(href) {
    if (!href) return null;
    const m = href.match(/^\/([A-Za-z0-9_]{1,50})(?:\/|$)/);
    return m ? m[1].toLowerCase() : null;
  }

  function cat(account) {
    return PLUTO_CATEGORIES[account.category] || {
      label:"Flagged", color:"#555", bgColor:"#f5f5f5",
      borderColor:"#999", dotColor:"#999", textIcon:"!"
    };
  }

  function flag(code) {
    return [...code.toUpperCase()].map(c =>
      String.fromCodePoint(c.codePointAt(0) + 127397)
    ).join("");
  }

  function bumpCount(n = 1) {
    sessionCount += n;
    try { chrome.runtime.sendMessage({ type: "PLUTO_COUNT", delta: n }); } catch (_) {}
    updateSidebarCount();
  }

  // ── Sidebar widget ────────────────────────────────────────────────────────────

  const SIDEBAR_ID = "pluto-sidebar-widget";

  function makeSidebarWidget() {
    const el = document.createElement("div");
    el.id = SIDEBAR_ID;
    el.innerHTML = `
      <div class="psw-inner">
        <div class="psw-logo">
          <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="18" cy="18" rx="17" ry="5.5" stroke="#a78bfa" stroke-width="2.2" fill="none"
              transform="rotate(-28 18 18)" opacity="0.65"/>
            <circle cx="18" cy="18" r="10.5" fill="#7c3aed"/>
            <circle cx="14" cy="13" r="4" fill="#a78bfa" opacity="0.38"/>
            <circle cx="20.5" cy="21.5" r="2.5" fill="#5b21b6" opacity="0.5"/>
            <path d="M27.5 11 Q31 18 27.5 25" stroke="#c4b5fd" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.7"/>
          </svg>
        </div>
        <div class="psw-text">
          <span class="psw-name">Pluto</span>
          <span class="psw-sub" id="pluto-sidebar-sub">Active</span>
        </div>
        <span class="psw-count" id="pluto-sidebar-count" style="display:none">0</span>
      </div>
    `;
    return el;
  }

  function updateSidebarCount() {
    const badge = document.getElementById("pluto-sidebar-count");
    const sub   = document.getElementById("pluto-sidebar-sub");
    if (!badge || !sub) return;
    if (sessionCount > 0) {
      badge.textContent = sessionCount;
      badge.style.display = "inline-flex";
      sub.textContent = sessionCount === 1 ? "1 flag" : `${sessionCount} flags`;
    } else {
      badge.style.display = "none";
      sub.textContent = "Active";
    }
  }

  function injectSidebarWidget() {
    if (!settings.showSidebarWidget) return;
    if (document.getElementById(SIDEBAR_ID)) return;

    // Try several selectors Twitter uses for the left sidebar
    const sideNav =
      document.querySelector('[data-testid="SideNav"]') ||
      document.querySelector('header[role="banner"]')   ||
      document.querySelector('nav[aria-label="Primary"]');

    if (!sideNav) return;

    // Find the X / Twitter logo link at the top of the sidebar
    const logoLink =
      sideNav.querySelector('a[href="/home"] svg')?.closest("a") ||
      sideNav.querySelector('a[aria-label="X"]')                 ||
      sideNav.querySelector('a[href="/"]');

    const widget = makeSidebarWidget();

    if (logoLink) {
      // Insert Pluto widget right after the logo link's containing block
      const block = logoLink.closest("li, div[class]") || logoLink.parentElement;
      block.insertAdjacentElement("afterend", widget);
    } else {
      sideNav.prepend(widget);
    }
  }

  // ── Badge ──────────────────────────────────────────────────────────────────────

  function makeBadge(account) {
    const c = cat(account);
    const el = document.createElement("span");
    el.className = `pluto-badge pluto-cat-${account.category}`;
    el.dataset.plutoHandle = account.handle;
    el.style.cssText = `--pc:${c.color};--pb:${c.bgColor};--pbd:${c.borderColor}`;
    el.setAttribute("aria-label", `Pluto: ${c.label}`);
    el.innerHTML = `<span class="pb-icon">${c.textIcon}</span><span class="pb-text">${account.label || c.label}</span>`;

    // Trust meter (for non-satire)
    const trustBar = account.category !== "satire" && typeof account.trust === "number"
      ? `<div class="pt-trust">
           <span class="pt-trust-label">Reliability</span>
           <div class="pt-trust-bar"><div class="pt-trust-fill" style="width:${account.trust}%;background:${account.trust < 30 ? "#ef4444" : account.trust < 55 ? "#f59e0b" : "#22c55e"}"></div></div>
           <span class="pt-trust-val">${account.trust}/100</span>
         </div>`
      : "";

    const tip = document.createElement("div");
    tip.className = "pluto-tip";
    tip.innerHTML = `
      <div class="pt-head">
        <div class="pt-head-icon">${c.textIcon}</div>
        <div>
          <div class="pt-head-title">${account.label || c.label}${account.country ? " " + flag(account.country) : ""}</div>
          <div class="pt-head-handle">@${account.handle}</div>
        </div>
      </div>
      ${trustBar}
      <div class="pt-body">${account.detail || ""}</div>
      ${account.source ? `<div class="pt-source">${account.source}</div>` : ""}
    `;
    el.appendChild(tip);
    return el;
  }

  // ── Avatar dot ────────────────────────────────────────────────────────────────

  function makeAvatarDot(account) {
    const c = cat(account);
    const dot = document.createElement("span");
    dot.className = "pluto-avatar-dot";
    dot.dataset.plutoHandle = account.handle;
    dot.style.background = c.dotColor;
    dot.title = `Pluto: ${c.label}`;
    return dot;
  }

  // ── Profile banner ─────────────────────────────────────────────────────────────

  function makeProfileBanner(account) {
    const c = cat(account);
    const banner = document.createElement("div");
    banner.id = "pluto-profile-banner";
    banner.className = `pluto-banner pluto-cat-${account.category}`;
    banner.style.cssText = `--pc:${c.color};--pb:${c.bgColor};--pbd:${c.borderColor}`;

    const trustBar = account.category !== "satire" && typeof account.trust === "number"
      ? `<div class="pluto-banner-trust">
           <span>Reliability score: ${account.trust}/100</span>
           <div class="pluto-banner-trust-track">
             <div class="pluto-banner-trust-fill" style="width:${account.trust}%;background:${account.trust < 30 ? "#ef4444" : account.trust < 55 ? "#f59e0b" : "#22c55e"}"></div>
           </div>
         </div>`
      : "";

    banner.innerHTML = `
      <div class="pluto-banner-bar"></div>
      <div class="pluto-banner-icon">${c.textIcon}</div>
      <div class="pluto-banner-body">
        <div class="pluto-banner-top">
          <span class="pluto-banner-name">${account.label || c.label}${account.country ? " " + flag(account.country) : ""}</span>
          <span class="pluto-banner-cat">${c.label}</span>
          ${account.blocked && settings.blockContent ? '<span class="pluto-banner-chip">Content hidden</span>' : ""}
        </div>
        ${trustBar}
        <div class="pluto-banner-detail">${account.detail || ""}</div>
        ${account.source ? `<div class="pluto-banner-source">Source: ${account.source}</div>` : ""}
      </div>
      <button class="pluto-banner-close" aria-label="Dismiss">✕</button>
    `;
    banner.querySelector(".pluto-banner-close").addEventListener("click", () => banner.remove());
    return banner;
  }

  // ── Block overlay ──────────────────────────────────────────────────────────────

  function makeBlockOverlay(account) {
    const c = cat(account);
    const ov = document.createElement("div");
    ov.className = "pluto-block-overlay";
    ov.style.cssText = `--pc:${c.color};--pb:${c.bgColor};--pbd:${c.borderColor}`;
    ov.innerHTML = `
      <div class="pbo-card">
        <div class="pbo-icon">${c.textIcon}</div>
        <div class="pbo-body">
          <div class="pbo-title">${account.label || c.label}</div>
          <div class="pbo-handle">@${account.handle}${account.country ? " " + flag(account.country) : ""}</div>
          <div class="pbo-detail">${(account.detail || "").slice(0, 130)}${(account.detail || "").length > 130 ? "…" : ""}</div>
        </div>
        <button class="pbo-reveal">View anyway</button>
      </div>
    `;
    ov.querySelector(".pbo-reveal").addEventListener("click", e => {
      e.stopPropagation();
      const art = ov.closest("article");
      if (art) { art.classList.remove("pluto-blocked"); art.dataset.plutoRevealed = "1"; }
      ov.remove();
    });
    return ov;
  }

  // ── Process tweet ──────────────────────────────────────────────────────────────

  function processTweet(article) {
    if (article.dataset.plutoTweet) return;

    const userBlock = article.querySelector('[data-testid="User-Name"]');
    if (!userBlock) return;

    let handle = null;
    const links = userBlock.querySelectorAll("a[href]");
    for (const a of links) {
      const h = handleFromHref(a.getAttribute("href"));
      if (h && accountMap[h]) { handle = h; break; }
    }
    if (!handle) return;

    article.dataset.plutoTweet = handle;
    const account = accountMap[handle];

    // Badge
    if (settings.showTweetBadge) {
      const link = [...links].find(a => handleFromHref(a.getAttribute("href")) === handle);
      if (link) {
        const row = link.closest("[dir]") || link.parentElement;
        if (row && !row.querySelector(`.pluto-badge[data-pluto-handle="${handle}"]`)) {
          link.insertAdjacentElement("afterend", makeBadge(account));
          bumpCount();
        }
      }
    }

    // Avatar dot
    if (settings.showAvatarDot) {
      const av = article.querySelector('[data-testid="Tweet-User-Avatar"]');
      if (av && !av.querySelector(".pluto-avatar-dot")) {
        av.style.position = "relative";
        av.appendChild(makeAvatarDot(account));
      }
    }

    // Highlight tweet row
    if (settings.highlightTweets && !account.blocked) {
      const c = cat(account);
      article.style.setProperty("--phc", c.bgColor);
      article.style.setProperty("--phb", c.borderColor);
      article.classList.add("pluto-highlighted");
    }

    // Block overlay
    if (settings.blockContent && account.blocked && !article.dataset.plutoRevealed) {
      article.classList.add("pluto-blocked");
      if (!article.querySelector(".pluto-block-overlay")) {
        article.appendChild(makeBlockOverlay(account));
      }
    }
  }

  // ── User cells (sidebar, who-to-follow) ───────────────────────────────────────

  function processUserCell(cell) {
    if (cell.dataset.plutoDone) return;
    const link = cell.querySelector("a[href]");
    if (!link) return;
    const handle = handleFromHref(link.getAttribute("href"));
    if (!handle || !accountMap[handle]) return;
    cell.dataset.plutoDone = handle;
    if (!settings.showTweetBadge) return;
    const nameEl = cell.querySelector('[dir="ltr"] span') || link;
    if (!nameEl.parentElement?.querySelector(`.pluto-badge[data-pluto-handle="${handle}"]`)) {
      nameEl.insertAdjacentElement("afterend", makeBadge(accountMap[handle]));
    }
  }

  // ── Profile banner ─────────────────────────────────────────────────────────────

  const NON_PROFILE = new Set([
    "home","explore","notifications","messages",
    "settings","i","search","compose","bookmarks","lists"
  ]);

  function tryProfileBanner() {
    if (!settings.showProfileBanner) return;
    if (document.getElementById("pluto-profile-banner")) return;

    const parts = window.location.pathname.split("/").filter(Boolean);
    if (!parts.length || NON_PROFILE.has(parts[0].toLowerCase())) return;

    const handle  = parts[0].toLowerCase();
    const account = accountMap[handle];
    if (!account) return;

    const banner  = makeProfileBanner(account);
    const tabList = document.querySelector('[role="tablist"]');

    if (tabList) {
      (tabList.closest("nav") || tabList.parentElement)
        ?.insertAdjacentElement("beforebegin", banner);
    } else {
      const anchor =
        document.querySelector('[data-testid="UserProfileHeader_Items"]') ||
        document.querySelector('[data-testid="UserDescription"]');
      if (anchor) anchor.insertAdjacentElement("afterend", banner);
      else document.querySelector('[data-testid="primaryColumn"]')?.prepend(banner);
    }

    bumpCount();
  }

  // ── Full scan ──────────────────────────────────────────────────────────────────

  function scan(root) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll('article[data-testid="tweet"]').forEach(processTweet);
    root.querySelectorAll('[data-testid="UserCell"]').forEach(processUserCell);
    tryProfileBanner();
    injectSidebarWidget();
  }

  // ── Observers ──────────────────────────────────────────────────────────────────

  let scanPending = false;
  function queueScan() {
    if (scanPending) return;
    scanPending = true;
    requestAnimationFrame(() => { scanPending = false; scan(document.body); });
  }

  const domObserver = new MutationObserver(queueScan);

  // SPA navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    document.getElementById("pluto-profile-banner")?.remove();
    setTimeout(() => scan(document.body), 900);
  }).observe(document, { subtree: true, childList: true });

  // Storage changes
  chrome.storage.onChanged.addListener(() => {
    reload(() => {
      document.querySelectorAll(
        ".pluto-badge, .pluto-block-overlay, .pluto-avatar-dot, #pluto-profile-banner, #pluto-sidebar-widget"
      ).forEach(el => el.remove());
      document.querySelectorAll("[data-pluto-tweet],[data-pluto-done]").forEach(el => {
        el.classList.remove("pluto-blocked","pluto-highlighted");
        delete el.dataset.plutoTweet;
        delete el.dataset.plutoDone;
        delete el.dataset.plutoRevealed;
        el.style.removeProperty("--phc");
        el.style.removeProperty("--phb");
      });
      sessionCount = 0;
      scan(document.body);
    });
  });

  // ── Init ───────────────────────────────────────────────────────────────────────

  reload(() => {
    scan(document.body);
    domObserver.observe(document.body, { childList: true, subtree: true });
  });
})();
