(() => {
  // ── Tab switching ──────────────────────────────────────────────────────────

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".pane").forEach(p => p.classList.toggle("active", p.id === `tab-${t}`));
    });
  });

  // ── State ──────────────────────────────────────────────────────────────────

  let customAccounts   = [];
  let disabledHandles  = [];
  let blockedOverrides = {};
  let trustedHandles   = [];
  let filter           = "";
  let trustedOpen      = false;

  const DEFAULT_SETTINGS = {
    showSidebarWidget: true,
    showProfileBanner: true,
    showTweetBadge:    true,
    showAvatarDot:     true,
    blockContent:      true,
    highlightTweets:   false
  };
  let settings = { ...DEFAULT_SETTINGS };

  // ── Helpers ────────────────────────────────────────────────────────────────

  function save(cb) {
    chrome.storage.sync.set(
      { customAccounts, disabledHandles, blockedOverrides, trustedHandles, settings },
      cb
    );
  }

  function isDefault(handle) {
    return PLUTO_ACCOUNTS.some(a => a.handle.toLowerCase() === handle.toLowerCase());
  }

  function effectiveBlocked(acc) {
    const h = acc.handle.toLowerCase();
    return h in blockedOverrides ? blockedOverrides[h] : !!acc.blocked;
  }

  const CAT_SHORT = {
    "state-propaganda": "State-Affiliated",
    "state-funded":     "State-Funded",
    "misinformation":   "Bad Source",
    "conspiracy":       "Bad Source",
    "satire":           "Satire"
  };

  const CAT_STYLE = {
    "state-propaganda": { color: "#b45309", bg: "#fffbeb", dot: "#d97706" },
    "state-funded":     { color: "#92400e", bg: "#fef3c7", dot: "#b45309" },
    "misinformation":   { color: "#991b1b", bg: "#fef2f2", dot: "#ef4444" },
    "conspiracy":       { color: "#6d28d9", bg: "#f5f3ff", dot: "#8b5cf6" },
    "satire":           { color: "#1d4ed8", bg: "#eff6ff", dot: "#3b82f6" }
  };

  function flag(code) {
    return [...code.toUpperCase()].map(c =>
      String.fromCodePoint(c.codePointAt(0) + 127397)
    ).join("");
  }

  // ── Render account list ────────────────────────────────────────────────────

  function render() {
    const listEl   = document.getElementById("accList");
    const countEl  = document.getElementById("accCount");
    const headerC  = document.getElementById("headerCount");

    const disabled = new Set(disabledHandles.map(h => h.toLowerCase()));
    const trusted  = new Set(trustedHandles.map(h => h.toLowerCase()));
    const customSet = new Set(customAccounts.map(a => a.handle.toLowerCase()));

    const all = [
      ...PLUTO_ACCOUNTS,
      ...customAccounts.filter(c => !isDefault(c.handle.toLowerCase()))
    ];

    const q = filter.toLowerCase().replace(/^@/, "");
    const visible = q
      ? all.filter(a =>
          a.handle.toLowerCase().includes(q) ||
          (a.label || "").toLowerCase().includes(q) ||
          (a.category || "").toLowerCase().includes(q)
        )
      : all;

    countEl.textContent = visible.length === all.length
      ? `${all.length} accounts`
      : `${visible.length} of ${all.length}`;

    // Header session count
    chrome.action.getBadgeText({}, text => {
      if (text && text !== "0") {
        headerC.textContent = text + " flags this page";
        headerC.classList.add("visible");
      }
    });

    listEl.innerHTML = "";
    if (!visible.length) {
      listEl.innerHTML = `<div class="no-results">${q ? `No results for "@${q}"` : "No accounts flagged."}</div>`;
    } else {
      visible.forEach(acc => {
        const h       = acc.handle.toLowerCase();
        const off     = disabled.has(h);
        const blocked = effectiveBlocked(acc);
        const style   = CAT_STYLE[acc.category] || { color: "#555", bg: "#f5f5f5", dot: "#999" };
        const shortL  = CAT_SHORT[acc.category] || acc.category;
        const custom  = customSet.has(h);

        const row = document.createElement("div");
        row.className = "acc-item" + (off ? " disabled" : "");

        row.innerHTML = `
          <span class="acc-dot" style="background:${off ? "#d1d5db" : style.dot}"></span>
          <span class="acc-handle">@${acc.handle}${acc.country ? " " + flag(acc.country) : ""}</span>
          <span class="acc-cat-chip" style="color:${style.color};background:${style.bg};border-color:${style.color}">${shortL}</span>
          ${blocked && !off ? '<span class="blocked-dot" title="Content blocked by default"></span>' : ""}
          <div class="acc-actions">
            <button class="btn-ghost${blocked ? " active-flag" : ""} btn-block"
              data-h="${h}" data-blocked="${blocked}"
              title="${blocked ? "Content is blocked — click to unblock" : "Click to block this account\'s content"}">
              ${blocked ? "Unblock" : "Block"}
            </button>
            <button class="btn-ghost btn-toggle" data-h="${h}" data-off="${off}">
              ${off ? "Enable" : "Disable"}
            </button>
            ${custom ? `<button class="btn-ghost danger btn-remove" data-h="${h}">✕</button>` : ""}
          </div>
        `;
        listEl.appendChild(row);
      });

      listEl.querySelectorAll(".btn-block").forEach(btn => {
        btn.addEventListener("click", () => {
          const h = btn.dataset.h;
          blockedOverrides[h] = btn.dataset.blocked !== "true";
          save(render);
        });
      });
      listEl.querySelectorAll(".btn-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
          const h = btn.dataset.h;
          if (btn.dataset.off === "true") {
            disabledHandles = disabledHandles.filter(x => x !== h);
          } else {
            if (!disabledHandles.includes(h)) disabledHandles.push(h);
          }
          save(render);
        });
      });
      listEl.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener("click", () => {
          const h = btn.dataset.h;
          customAccounts = customAccounts.filter(a => a.handle.toLowerCase() !== h);
          delete blockedOverrides[h];
          save(render);
        });
      });
    }

    // Render trusted list
    renderTrusted();
  }

  // ── Trusted accounts ───────────────────────────────────────────────────────

  function renderTrusted() {
    const listEl = document.getElementById("trustedList");
    listEl.innerHTML = "";
    if (!trustedHandles.length) {
      listEl.innerHTML = `<div style="padding:10px 14px;font-size:11.5px;color:var(--text3)">
        No trusted accounts. Right-click any profile link on Twitter to mark it as trusted.
      </div>`;
      return;
    }
    trustedHandles.forEach(h => {
      const row = document.createElement("div");
      row.className = "trusted-item";
      row.innerHTML = `
        <span class="trusted-handle">@${h}</span>
        <span class="trusted-tag">Trusted</span>
        <button class="btn-ghost danger" style="font-size:10px;padding:2px 7px" data-h="${h}">Remove</button>
      `;
      row.querySelector("[data-h]").addEventListener("click", () => {
        trustedHandles = trustedHandles.filter(x => x !== h);
        save(renderTrusted);
      });
      listEl.appendChild(row);
    });
  }

  // Trusted accordion
  document.getElementById("trustedToggle").addEventListener("click", () => {
    trustedOpen = !trustedOpen;
    document.getElementById("trustedToggle").classList.toggle("open", trustedOpen);
    document.getElementById("trustedList").classList.toggle("open", trustedOpen);
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  document.getElementById("searchInput").addEventListener("input", e => {
    filter = e.target.value;
    render();
  });

  // ── Add account ────────────────────────────────────────────────────────────

  const handleInput = document.getElementById("handleInput");
  const catSelect   = document.getElementById("catSelect");
  const addBtn      = document.getElementById("addBtn");
  const errEl       = document.getElementById("addErr");

  addBtn.addEventListener("click", () => {
    errEl.textContent = "";
    const handle = handleInput.value.trim().replace(/^@/, "").toLowerCase();
    if (!handle) { errEl.textContent = "Enter a username."; return; }
    if (!/^[a-z0-9_]{1,50}$/.test(handle)) { errEl.textContent = "Invalid username."; return; }
    if ([...PLUTO_ACCOUNTS, ...customAccounts].some(a => a.handle.toLowerCase() === handle)) {
      errEl.textContent = "Already in list."; return;
    }
    const cat = catSelect.value;
    customAccounts.push({
      handle, label: CAT_SHORT[cat] || cat,
      category: cat,
      blocked: cat === "state-propaganda",
      detail: `Manually flagged as: ${CAT_SHORT[cat] || cat}.`
    });
    save(() => {
      handleInput.value = "";
      document.getElementById("pendingPill").style.display = "none";
      render();
    });
  });

  handleInput.addEventListener("keydown", e => { if (e.key === "Enter") addBtn.click(); });

  // ── Context-menu pending handle ────────────────────────────────────────────

  chrome.storage.local.get("pendingAdd", data => {
    if (!data.pendingAdd) return;
    handleInput.value = "@" + data.pendingAdd;
    const pill = document.getElementById("pendingPill");
    document.getElementById("pendingText").innerHTML =
      `<strong>@${data.pendingAdd}</strong> — right-click flagged. Choose a category and add.`;
    pill.style.display = "flex";
    chrome.storage.local.remove("pendingAdd");
    document.querySelector("[data-tab='accounts']").click();
  });

  document.getElementById("pendingClear").addEventListener("click", () => {
    document.getElementById("pendingPill").style.display = "none";
    handleInput.value = "";
  });

  // ── Export / Import ────────────────────────────────────────────────────────

  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(
      { version:3, exportedAt: new Date().toISOString(), customAccounts, disabledHandles, blockedOverrides, trustedHandles },
      null, 2
    )], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: "pluto-accounts.json"
    });
    a.click(); URL.revokeObjectURL(a.href);
  });

  document.getElementById("importFile").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.customAccounts)   customAccounts   = d.customAccounts;
        if (d.disabledHandles)  disabledHandles  = d.disabledHandles;
        if (d.blockedOverrides) blockedOverrides = d.blockedOverrides;
        if (d.trustedHandles)   trustedHandles   = d.trustedHandles;
        save(render);
      } catch { errEl.textContent = "Invalid JSON file."; }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  // ── Settings ───────────────────────────────────────────────────────────────

  const SETTING_MAP = {
    "s-sidebar":   "showSidebarWidget",
    "s-banner":    "showProfileBanner",
    "s-badge":     "showTweetBadge",
    "s-avatar":    "showAvatarDot",
    "s-block":     "blockContent",
    "s-highlight": "highlightTweets"
  };

  function syncSettingsUI() {
    for (const [id, key] of Object.entries(SETTING_MAP)) {
      const el = document.getElementById(id);
      if (el) el.checked = !!settings[key];
    }
  }

  for (const [id, key] of Object.entries(SETTING_MAP)) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener("change", () => {
      settings[key] = el.checked;
      save(() => {});
    });
  }

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all custom accounts, trusted handles, and settings to defaults?")) return;
    customAccounts   = [];
    disabledHandles  = [];
    blockedOverrides = {};
    trustedHandles   = [];
    settings         = { ...DEFAULT_SETTINGS };
    save(() => { syncSettingsUI(); render(); });
  });

  // ── Load ───────────────────────────────────────────────────────────────────

  chrome.storage.sync.get(
    ["customAccounts","disabledHandles","blockedOverrides","trustedHandles","settings"],
    data => {
      customAccounts   = data.customAccounts   || [];
      disabledHandles  = data.disabledHandles  || [];
      blockedOverrides = data.blockedOverrides || {};
      trustedHandles   = data.trustedHandles   || [];
      if (data.settings) Object.assign(settings, data.settings);
      syncSettingsUI();
      render();
    }
  );
})();
