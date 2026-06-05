(() => {
  "use strict";

  // Merged map: handle (lowercase) → account info
  let accountMap = {};

  function buildAccountMap(accounts) {
    accountMap = {};
    for (const a of accounts) {
      accountMap[a.handle.toLowerCase()] = a;
    }
  }

  // Load accounts from storage (user overrides) merged with defaults
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

  // ── Badge creation ──────────────────────────────────────────────────────────

  function makeBadge(account) {
    const cat = MEDIACHECK_CATEGORIES[account.category] || {
      color: "#555", icon: "⚠", bgColor: "#f5f5f5"
    };
    const badge = document.createElement("span");
    badge.className = "mc-badge";
    badge.dataset.mcHandle = account.handle.toLowerCase();
    badge.setAttribute("aria-label", `Mediacheck: ${account.label}`);
    badge.style.cssText = `
      background:${cat.bgColor};
      color:${cat.color};
      border:1px solid ${cat.color};
    `;
    badge.textContent = `${cat.icon} ${account.label}`;

    // Tooltip
    const tip = document.createElement("span");
    tip.className = "mc-tooltip";
    tip.textContent = account.detail;
    badge.appendChild(tip);

    return badge;
  }

  // ── DOM helpers ─────────────────────────────────────────────────────────────

  // Extract a Twitter handle from an <a> href like "/UserName" or "/UserName/status/…"
  function handleFromHref(href) {
    if (!href) return null;
    const m = href.match(/^\/([A-Za-z0-9_]{1,50})(?:\/|$)/);
    return m ? m[1].toLowerCase() : null;
  }

  // Mark a container so we don't badge it twice
  const ATTR = "data-mc-done";

  // Inject a badge after `anchorEl` if the account is flagged and not already badged
  function tryInjectAfter(anchorEl, handle) {
    const account = accountMap[handle];
    if (!account) return;

    // Walk up to find a suitable parent that doesn't already have our badge
    const parent = anchorEl.parentElement;
    if (!parent) return;
    if (parent.querySelector(`.mc-badge[data-mc-handle="${handle}"]`)) return;

    const badge = makeBadge(account);
    anchorEl.insertAdjacentElement("afterend", badge);
  }

  // ── Scanning logic ──────────────────────────────────────────────────────────

  // Twitter renders several patterns; we cover the most common three:
  //  1. [data-testid="User-Name"]  — within a tweet, shows "@handle" links
  //  2. [data-testid="UserCell"]   — in sidebars / who-to-follow
  //  3. Profile header              — [data-testid="UserProfileHeader_Items"]

  function scanUserNameBlock(el) {
    // The User-Name block contains two <a> tags: display name and @handle.
    // We want the @handle link (href="/username").
    const links = el.querySelectorAll("a[href]");
    for (const link of links) {
      const handle = handleFromHref(link.getAttribute("href"));
      if (!handle || !accountMap[handle]) continue;
      if (el.getAttribute(ATTR) === handle) continue;
      el.setAttribute(ATTR, handle);
      tryInjectAfter(link, handle);
    }
  }

  function scanUserCell(el) {
    if (el.getAttribute(ATTR)) return;
    const link = el.querySelector("a[href]");
    if (!link) return;
    const handle = handleFromHref(link.getAttribute("href"));
    if (!handle || !accountMap[handle]) return;
    el.setAttribute(ATTR, handle);
    // Place badge after the display-name span inside the cell
    const nameSpan = el.querySelector("[dir='ltr'] > span") || link;
    tryInjectAfter(nameSpan, handle);
  }

  function scanProfileHeader(el) {
    if (el.getAttribute(ATTR)) return;
    // The page URL itself reveals the profile handle
    const handle = window.location.pathname.replace(/^\//, "").split("/")[0].toLowerCase();
    if (!handle || !accountMap[handle]) return;
    el.setAttribute(ATTR, handle);
    const inner = el.querySelector("span") || el;
    tryInjectAfter(inner, handle);
  }

  function scanRoot(root) {
    root.querySelectorAll("[data-testid='User-Name']").forEach(scanUserNameBlock);
    root.querySelectorAll("[data-testid='UserCell']").forEach(scanUserCell);
    root.querySelectorAll("[data-testid='UserProfileHeader_Items']").forEach(scanProfileHeader);
  }

  // ── MutationObserver ────────────────────────────────────────────────────────

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        scanRoot(node);
        // Also check the node itself
        const testId = node.dataset && node.dataset.testid;
        if (testId === "User-Name") scanUserNameBlock(node);
        else if (testId === "UserCell") scanUserCell(node);
        else if (testId === "UserProfileHeader_Items") scanProfileHeader(node);
      }
    }
  });

  // ── Navigation (SPA) ───────────────────────────────────────────────────────

  // Twitter is a SPA; re-scan on URL changes for profile pages
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(() => scanRoot(document.body), 600);
    }
  }).observe(document, { subtree: true, childList: true });

  // ── Listen for popup-driven account changes ─────────────────────────────────

  chrome.storage.onChanged.addListener(() => {
    loadAccounts(() => {
      // Remove stale badges and re-scan
      document.querySelectorAll(".mc-badge").forEach(b => b.remove());
      document.querySelectorAll(`[${ATTR}]`).forEach(el => el.removeAttribute(ATTR));
      scanRoot(document.body);
    });
  });

  // ── Init ────────────────────────────────────────────────────────────────────

  loadAccounts(() => {
    scanRoot(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
