(() => {
  "use strict";

  // ── State ────────────────────────────────────────────────────────────────────

  let accountMap = {};
  let trustedSet = new Set();
  let sessionCount = 0;
  let pendingMenuHandle = null;

  let settings = {
    showSidebarWidget: true,
    showProfileBanner: true,
    showTweetBadge:    true,
    showAvatarDot:     true,
    blockContent:      true,
    highlightTweets:   false
  };

  // ── SVG icon set ──────────────────────────────────────────────────────────────

  const ICONS = {
    "state-propaganda": `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="2" y1="1" x2="2" y2="10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M2 1.5L9.5 4.25L2 7Z" fill="currentColor"/></svg>`,
    "state-funded":     `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="5" width="9" height="5" rx="0.6" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M0.5 5L5.5 1.5L10.5 5" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/><rect x="4" y="6.5" width="3" height="3.5" rx="0.4" fill="currentColor" opacity="0.75"/></svg>`,
    "misinformation":   `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1L10.5 10H0.5L5.5 1Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/><line x1="5.5" y1="4.2" x2="5.5" y2="7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="5.5" cy="8.4" r="0.65" fill="currentColor"/></svg>`,
    "conspiracy":       `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4.2" stroke="currentColor" stroke-width="1.3"/><line x1="3.5" y1="3.5" x2="7.5" y2="7.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="7.5" y1="3.5" x2="3.5" y2="7.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    "satire":           `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2h7a.8.8 0 01.8.8V7a.8.8 0 01-.8.8H6.5L4.5 9.5V7.8H2A.8.8 0 011.2 7V2.8A.8.8 0 012 2Z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linejoin="round"/><path d="M3.5 5.5c.3-.6.9-.6 1.4 0 .4.6 1.1.6 1.4 0" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" fill="none"/></svg>`
  };

  // Magnifying-glass logo — identical paths, 3 rendered sizes
  const PLUTO_LOGO_SM = `<svg width="16" height="16" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="9" stroke="#a78bfa" stroke-width="2.2" fill="rgba(124,58,237,0.12)"/><line x1="14" y1="9.5" x2="14" y2="18.5" stroke="#c4b5fd" stroke-width="1.8" stroke-linecap="round"/><line x1="9.5" y1="14" x2="18.5" y2="14" stroke="#c4b5fd" stroke-width="1.8" stroke-linecap="round"/><line x1="21" y1="21" x2="29.5" y2="29.5" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/></svg>`;
  const PLUTO_LOGO_MD = `<svg width="26" height="26" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="9" stroke="#a78bfa" stroke-width="2.2" fill="rgba(124,58,237,0.12)"/><line x1="14" y1="9.5" x2="14" y2="18.5" stroke="#c4b5fd" stroke-width="1.8" stroke-linecap="round"/><line x1="9.5" y1="14" x2="18.5" y2="14" stroke="#c4b5fd" stroke-width="1.8" stroke-linecap="round"/><line x1="21" y1="21" x2="29.5" y2="29.5" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/></svg>`;
  const PLUTO_LOGO_LG = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="9" stroke="#a78bfa" stroke-width="2.2" fill="rgba(124,58,237,0.12)"/><line x1="14" y1="9.5" x2="14" y2="18.5" stroke="#c4b5fd" stroke-width="1.8" stroke-linecap="round"/><line x1="9.5" y1="14" x2="18.5" y2="14" stroke="#c4b5fd" stroke-width="1.8" stroke-linecap="round"/><line x1="21" y1="21" x2="29.5" y2="29.5" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/></svg>`;

  // ── Load ──────────────────────────────────────────────────────────────────────

  function reload(cb) {
    chrome.storage.sync.get(
      ["customAccounts","disabledHandles","blockedOverrides","trustedHandles","settings"],
      data => {
        if (data.settings) Object.assign(settings, data.settings);
        trustedSet = new Set((data.trustedHandles || []).map(h => h.toLowerCase()));

        const disabled        = new Set((data.disabledHandles || []).map(h => h.toLowerCase()));
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
      borderColor:"#999", dotColor:"#999"
    };
  }

  function flagEmoji(code) {
    return [...code.toUpperCase()].map(c =>
      String.fromCodePoint(c.codePointAt(0) + 127397)
    ).join("");
  }

  const pageFlags = new Map(); // handle → account (tracks flags seen this page/session)

  function bumpCount(n = 1, account = null) {
    sessionCount += n;
    if (account) pageFlags.set(account.handle, account);
    try { chrome.runtime.sendMessage({ type: "PLUTO_COUNT", delta: n }); } catch (_) {}
    updateSidebarCount();
  }

  // ── Toast ─────────────────────────────────────────────────────────────────────

  function showToast(msg, sub = "") {
    document.querySelectorAll(".pluto-toast").forEach(t => t.remove());
    const toast = document.createElement("div");
    toast.className = "pluto-toast";
    toast.innerHTML = `
      <span class="pluto-toast-icon">${PLUTO_LOGO_SM}</span>
      <div class="pluto-toast-text">
        <span class="pluto-toast-main">${msg}</span>
        ${sub ? `<span class="pluto-toast-sub">${sub}</span>` : ""}
      </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add("pluto-toast-show"));
    });
    setTimeout(() => {
      toast.classList.remove("pluto-toast-show");
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, 3200);
  }

  // ── Quick-flag from menu ───────────────────────────────────────────────────────

  function quickFlag(handle) {
    const h = handle.toLowerCase();
    chrome.storage.sync.get(["customAccounts", "disabledHandles"], data => {
      const all = [...PLUTO_ACCOUNTS, ...(data.customAccounts || [])];
      const disabled = new Set((data.disabledHandles || []).map(x => x.toLowerCase()));

      if (disabled.has(h)) {
        // Re-enable if disabled
        chrome.storage.sync.set({
          disabledHandles: (data.disabledHandles || []).filter(x => x.toLowerCase() !== h)
        }, () => showToast(`@${handle} re-enabled`, "Warning restored in Pluto"));
        return;
      }

      if (all.some(a => a.handle.toLowerCase() === h)) {
        showToast(`@${handle} is already flagged`, "Open Pluto popup to edit");
        return;
      }

      const custom = data.customAccounts || [];
      custom.push({
        handle: h,
        label: "Unverified Claims",
        category: "misinformation",
        blocked: false,
        detail: `Flagged via Pluto quick-add on Twitter.`
      });
      chrome.storage.sync.set({ customAccounts: custom }, () => {
        showToast(`@${handle} flagged`, "Tap popup to change category");
      });
    });
  }

  // ── Tweet "···" menu injection ─────────────────────────────────────────────────

  function makePlutoMenuItem(handle) {
    const item = document.createElement("div");
    item.className = "pluto-menu-item";
    item.setAttribute("role", "menuitem");
    item.setAttribute("tabindex", "0");
    item.innerHTML = `
      <span class="pluto-menu-icon">${PLUTO_LOGO_SM}</span>
      <span class="pluto-menu-text">Flag @${handle} with Pluto…</span>
    `;
    item.addEventListener("click", e => {
      e.stopPropagation();
      // Close the dropdown
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      quickFlag(handle);
    });
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") item.click();
    });
    return item;
  }

  // Track which handle the pending caret click belongs to
  document.addEventListener("click", e => {
    const caret = e.target.closest('[data-testid="caret"]');
    if (caret) {
      const article = caret.closest('article');
      if (article) {
        const links = article.querySelectorAll('[data-testid="User-Name"] a[href]');
        for (const a of links) {
          const h = handleFromHref(a.getAttribute("href"));
          if (h) { pendingMenuHandle = h; break; }
        }
      }
      return;
    }

    // User cell more button (Relevant people / Who to follow)
    const moreBtn = e.target.closest('[data-testid="UserCell"] button[aria-label]');
    if (moreBtn) {
      const cell = moreBtn.closest('[data-testid="UserCell"]');
      if (cell) {
        const link = cell.querySelector("a[href]");
        if (link) {
          const h = handleFromHref(link.getAttribute("href"));
          if (h) pendingMenuHandle = h;
        }
      }
    }
  }, true);

  // Watch for the dropdown menu to appear
  new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        const dropdown =
          (node.dataset?.testid === "Dropdown" ? node : null) ||
          node.querySelector?.('[data-testid="Dropdown"]');
        if (dropdown && pendingMenuHandle && !dropdown.querySelector(".pluto-menu-item")) {
          // Insert as first item with a divider beneath
          const divider = document.createElement("div");
          divider.className = "pluto-menu-divider";
          const item = makePlutoMenuItem(pendingMenuHandle);
          dropdown.insertBefore(divider, dropdown.firstChild);
          dropdown.insertBefore(item, dropdown.firstChild);
          const h = pendingMenuHandle;
          pendingMenuHandle = null;
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  // ── Sidebar widget ─────────────────────────────────────────────────────────────

  const SIDEBAR_ID = "pluto-sidebar-widget";
  const PANEL_ID   = "pluto-sidebar-panel";

  function renderPanel() {
    const list   = document.getElementById("pluto-panel-list");
    const footer = document.getElementById("pluto-panel-footer");
    if (!list) return;
    list.innerHTML = "";
    if (pageFlags.size === 0) {
      list.innerHTML = `<div class="pp-empty">No flagged accounts seen yet</div>`;
      if (footer) footer.textContent = "";
      return;
    }
    if (footer) footer.textContent = `${pageFlags.size} flagged account${pageFlags.size !== 1 ? "s" : ""} on this page`;
    for (const [, account] of pageFlags) {
      const c   = cat(account);
      const row = document.createElement("div");
      row.className = "pp-row";
      row.innerHTML = `
        <span class="pp-dot" style="background:${c.dotColor}"></span>
        <span class="pp-handle">@${account.handle}${account.country ? " " + flagEmoji(account.country) : ""}</span>
        <span class="pp-chip" style="color:${c.color};background:${c.bgColor};border-color:${c.borderColor}">${c.label}</span>
      `;
      list.appendChild(row);
    }
  }

  function makeSidebarWidget() {
    const el = document.createElement("div");
    el.id = SIDEBAR_ID;
    el.innerHTML = `
      <div class="psw-wrap" id="pluto-wrap">
        <div class="psw-icon psw-glow">${PLUTO_LOGO_MD}</div>
        <div class="psw-body">
          <div class="psw-name-row">
            <span class="psw-name">Pluto</span>
            <span class="psw-beta">BETA</span>
          </div>
          <span class="psw-sub" id="pluto-sub">Media Intelligence</span>
        </div>
        <span class="psw-pill pluto-pill-hide" id="pluto-pill"></span>
      </div>
      <div class="pluto-panel" id="${PANEL_ID}">
        <div class="pp-header">Flagged on this page</div>
        <div class="pp-list" id="pluto-panel-list"></div>
        <div class="pp-footer" id="pluto-panel-footer"></div>
      </div>
    `;

    el.querySelector("#pluto-wrap").addEventListener("click", () => {
      const panel = document.getElementById(PANEL_ID);
      if (!panel) return;
      const opening = !panel.classList.contains("pp-open");
      panel.classList.toggle("pp-open", opening);
      if (opening) renderPanel();
    });

    return el;
  }

  function updateSidebarCount() {
    const pill = document.getElementById("pluto-pill");
    const sub  = document.getElementById("pluto-sub");
    if (!pill || !sub) return;
    if (sessionCount > 0) {
      const prev = parseInt(pill.dataset.n || "0");
      pill.textContent = sessionCount;
      pill.dataset.n = sessionCount;
      pill.classList.remove("pluto-pill-hide");
      if (sessionCount !== prev) {
        pill.classList.remove("pluto-bump");
        void pill.offsetWidth;
        pill.classList.add("pluto-bump");
      }
      sub.textContent = sessionCount === 1 ? "1 flag this page" : `${sessionCount} flags this page`;
      // Refresh open panel
      const p = document.getElementById(PANEL_ID);
      if (p?.classList.contains("pp-open")) renderPanel();
    } else {
      pill.classList.add("pluto-pill-hide");
      sub.textContent = "Media Intelligence";
    }
  }

  function injectSidebarWidget() {
    if (!settings.showSidebarWidget) return;
    if (document.getElementById(SIDEBAR_ID)) return;

    const sideNav =
      document.querySelector('[data-testid="SideNav"]') ||
      document.querySelector("header[role=banner]")     ||
      document.querySelector('nav[aria-label="Primary"]');
    if (!sideNav) return;

    const logoLink =
      sideNav.querySelector('a[href="/home"] svg')?.closest("a") ||
      sideNav.querySelector('a[aria-label="X"]')                 ||
      sideNav.querySelector('a[href="/"]');

    const widget = makeSidebarWidget();
    if (logoLink) {
      const block = logoLink.closest("li, div[class]") || logoLink.parentElement;
      block.insertAdjacentElement("afterend", widget);
    } else {
      sideNav.prepend(widget);
    }
    updateSidebarCount();
  }

  // Keep widget alive across Twitter's SPA re-renders
  setInterval(injectSidebarWidget, 1500);

  // ── Badge ──────────────────────────────────────────────────────────────────────

  function makeBadge(account) {
    const c = cat(account);
    const el = document.createElement("span");
    el.className = `pluto-badge pluto-cat-${account.category}`;
    el.dataset.plutoHandle = account.handle;
    el.style.cssText = `--pc:${c.color};--pb:${c.bgColor};--pbd:${c.borderColor}`;
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", `Pluto: ${c.label}`);
    el.innerHTML = `
      <span class="pb-icon">${ICONS[account.category] || ""}</span>
      <span class="pb-text">${account.label || c.label}</span>
    `;

    const tip = document.createElement("div");
    tip.className = "pluto-tip";
    tip.innerHTML = `
      <div class="pt-head">
        <div class="pt-head-icon">${ICONS[account.category] || ""}</div>
        <div class="pt-head-meta">
          <div class="pt-head-title">${account.label || c.label}${account.country ? " " + flagEmoji(account.country) : ""}</div>
          <div class="pt-head-handle">@${account.handle} · ${c.label}</div>
        </div>
      </div>
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

    banner.innerHTML = `
      <div class="pluto-banner-content">
        <div class="pluto-banner-row1">
          <span class="pluto-banner-cat-icon">${ICONS[account.category] || ""}</span>
          <span class="pluto-banner-name">${account.label || c.label}${account.country ? " " + flagEmoji(account.country) : ""}</span>
          <span class="pluto-banner-cat-chip">${c.label}</span>
          ${account.blocked && settings.blockContent ? '<span class="pluto-banner-blocked-chip">Content hidden</span>' : ""}
        </div>
        ${account.detail ? `<div class="pluto-banner-detail">${account.detail}</div>` : ""}
        ${account.source ? `<div class="pluto-banner-source">${account.source}</div>` : ""}
      </div>
      <div class="pluto-banner-btns">
        <button class="pluto-banner-trust" title="Mark as trusted">
          <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5L4 8.5L9.5 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Trust
        </button>
        <button class="pluto-banner-close" aria-label="Dismiss">
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
      </div>
    `;
    banner.querySelector(".pluto-banner-trust").addEventListener("click", () => {
      chrome.storage.sync.get("trustedHandles", data => {
        const trusted = data.trustedHandles || [];
        if (!trusted.includes(account.handle)) trusted.push(account.handle);
        chrome.storage.sync.set({ trustedHandles: trusted }, () => {
          showToast(`@${account.handle} marked as trusted`, "Pluto warnings removed for this account");
          banner.remove();
        });
      });
    });
    banner.querySelector(".pluto-banner-close").addEventListener("click", () => {
      banner.classList.add("pluto-banner-out");
      banner.addEventListener("transitionend", () => banner.remove(), { once: true });
    });
    return banner;
  }

  // ── Block overlay ──────────────────────────────────────────────────────────────

  function makeBlockOverlay(account) {
    const c = cat(account);
    const ov = document.createElement("div");
    ov.className = "pluto-block-overlay";
    ov.style.cssText = `--pc:${c.color};--pb:${c.bgColor};--pbd:${c.borderColor}`;
    ov.innerHTML = `
      <div class="pbo-inner">
        <div class="pbo-icon-ring">${ICONS[account.category] || ""}</div>
        <div class="pbo-body">
          <div class="pbo-label">${account.label || c.label}</div>
          <div class="pbo-handle">@${account.handle}${account.country ? " " + flagEmoji(account.country) : ""}</div>
          <div class="pbo-detail">${(account.detail || "").slice(0, 110)}${(account.detail || "").length > 110 ? "…" : ""}</div>
        </div>
        <button class="pbo-btn">View anyway</button>
      </div>
    `;
    ov.querySelector(".pbo-btn").addEventListener("click", e => {
      e.stopPropagation();
      const art = ov.closest("article");
      if (art) { art.classList.remove("pluto-blocked"); art.dataset.plutoRevealed = "1"; }
      ov.classList.add("pbo-out");
      ov.addEventListener("transitionend", () => ov.remove(), { once: true });
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

    if (settings.showTweetBadge) {
      const link = [...links].find(a => handleFromHref(a.getAttribute("href")) === handle);
      if (link) {
        const row = link.closest("[dir]") || link.parentElement;
        if (row && !row.querySelector(`.pluto-badge[data-pluto-handle="${handle}"]`)) {
          link.insertAdjacentElement("afterend", makeBadge(account));
          bumpCount(1, account);
        }
      }
    }

    if (settings.showAvatarDot) {
      const av = article.querySelector('[data-testid="Tweet-User-Avatar"]');
      if (av && !av.querySelector(".pluto-avatar-dot")) {
        av.style.position = "relative";
        av.appendChild(makeAvatarDot(account));
      }
    }

    if (settings.highlightTweets && !account.blocked) {
      const c = cat(account);
      article.style.setProperty("--phc", c.bgColor);
      article.style.setProperty("--phb", c.borderColor);
      article.classList.add("pluto-highlighted");
    }

    if (settings.blockContent && account.blocked && !article.dataset.plutoRevealed) {
      article.classList.add("pluto-blocked");
      if (!article.querySelector(".pluto-block-overlay")) {
        article.appendChild(makeBlockOverlay(account));
      }
    }
  }

  // ── User cells ────────────────────────────────────────────────────────────────

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

  // ── Profile banner ────────────────────────────────────────────────────────────

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

    bumpCount(1, account);
  }

  // ── Scan ──────────────────────────────────────────────────────────────────────

  function scan(root) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll('article[data-testid="tweet"]').forEach(processTweet);
    root.querySelectorAll('[data-testid="UserCell"]').forEach(processUserCell);
    tryProfileBanner();
    injectSidebarWidget();
  }

  let scanPending = false;
  function queueScan() {
    if (scanPending) return;
    scanPending = true;
    requestAnimationFrame(() => { scanPending = false; scan(document.body); });
  }

  const domObserver = new MutationObserver(queueScan);

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    document.getElementById("pluto-profile-banner")?.remove();
    pageFlags.clear();
    sessionCount = 0;
    updateSidebarCount();
    setTimeout(() => scan(document.body), 900);
  }).observe(document, { subtree: true, childList: true });

  chrome.storage.onChanged.addListener(() => {
    reload(() => {
      document.querySelectorAll(
        ".pluto-badge,.pluto-block-overlay,.pluto-avatar-dot,#pluto-profile-banner,#pluto-sidebar-widget"
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
      pageFlags.clear();
      scan(document.body);
    });
  });

  reload(() => {
    scan(document.body);
    domObserver.observe(document.body, { childList: true, subtree: true });
  });
})();
