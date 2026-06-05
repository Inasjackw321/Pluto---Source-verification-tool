(() => {
  // ── Tab switching ──────────────────────────────────────────────────────────

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.tab;
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".pane").forEach(p => p.classList.toggle("active", p.id === `tab-${id}`));
    });
  });

  // ── State ──────────────────────────────────────────────────────────────────

  let customAccounts   = [];
  let disabledHandles  = [];
  let blockedOverrides = {};
  let currentFilter    = "";

  const DEFAULT_SETTINGS = {
    showProfileBanner:   true,
    showTweetBadge:      true,
    showAvatarIndicator: true,
    blockContent:        true
  };
  let settings = { ...DEFAULT_SETTINGS };

  // ── Helpers ────────────────────────────────────────────────────────────────

  function save(cb) {
    chrome.storage.sync.set({ customAccounts, disabledHandles, blockedOverrides, settings }, cb);
  }

  function isDefault(handle) {
    return MEDIACHECK_DEFAULT_ACCOUNTS.some(a => a.handle.toLowerCase() === handle);
  }

  function effectiveBlocked(acc) {
    const h = acc.handle.toLowerCase();
    return h in blockedOverrides ? blockedOverrides[h] : !!acc.blocked;
  }

  function catClass(category) {
    return `cat-${category}`;
  }

  function catShortLabel(cat) {
    const map = {
      "state-propaganda": "State Prop.",
      "state-funded":     "State-Funded",
      "misinformation":   "Unverified",
      "conspiracy":       "Conspiracy",
      "satire":           "Satire"
    };
    return map[cat] || cat;
  }

  function catDotColor(cat) {
    const c = MEDIACHECK_CATEGORIES[cat];
    return c ? c.borderColor : "#888";
  }

  // ── Render account list ────────────────────────────────────────────────────

  function render() {
    const listEl = document.getElementById("accountList");
    const countEl = document.getElementById("accCount");

    const disabled  = new Set(disabledHandles.map(h => h.toLowerCase()));
    const customSet = new Set(customAccounts.map(a => a.handle.toLowerCase()));

    const all = [
      ...MEDIACHECK_DEFAULT_ACCOUNTS,
      ...customAccounts.filter(c => !isDefault(c.handle.toLowerCase()))
    ];

    const q = currentFilter.toLowerCase().replace(/^@/, "");
    const visible = q
      ? all.filter(a =>
          a.handle.toLowerCase().includes(q) ||
          (a.label || "").toLowerCase().includes(q) ||
          (a.category || "").toLowerCase().includes(q)
        )
      : all;

    countEl.textContent = `${visible.length} / ${all.length}`;
    listEl.innerHTML = "";

    if (!visible.length) {
      listEl.innerHTML = `<div class="no-results">${q ? "No matches" : "No accounts flagged."}</div>`;
      return;
    }

    visible.forEach(acc => {
      const handle  = acc.handle.toLowerCase();
      const off     = disabled.has(handle);
      const blocked = effectiveBlocked(acc);
      const custom  = customSet.has(handle);

      const row = document.createElement("div");
      row.className = "acc-item" + (off ? " disabled" : "");

      row.innerHTML = `
        <span class="acc-dot" style="background:${off ? "#ccc" : catDotColor(acc.category)}"></span>
        <span class="acc-handle">@${acc.handle}${acc.country ? " " + flag(acc.country) : ""}</span>
        <span class="acc-badge ${catClass(acc.category)}">${catShortLabel(acc.category)}</span>
        ${blocked && !off ? '<span class="blocked-indicator">BLOCKED</span>' : ""}
        <div class="acc-actions">
          <button class="btn-sm${blocked ? " orange" : ""} btn-block" data-handle="${handle}" data-blocked="${blocked}">
            ${blocked ? "Unblock" : "Block"}
          </button>
          <button class="btn-sm btn-toggle" data-handle="${handle}" data-off="${off}">
            ${off ? "Enable" : "Disable"}
          </button>
          ${custom ? `<button class="btn-sm red btn-remove" data-handle="${handle}">✕</button>` : ""}
        </div>
      `;

      listEl.appendChild(row);
    });

    // Events
    listEl.querySelectorAll(".btn-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const h = btn.dataset.handle;
        if (btn.dataset.off === "true") {
          disabledHandles = disabledHandles.filter(x => x !== h);
        } else {
          if (!disabledHandles.includes(h)) disabledHandles.push(h);
        }
        save(render);
      });
    });

    listEl.querySelectorAll(".btn-block").forEach(btn => {
      btn.addEventListener("click", () => {
        const h = btn.dataset.handle;
        blockedOverrides[h] = btn.dataset.blocked !== "true";
        save(render);
      });
    });

    listEl.querySelectorAll(".btn-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const h = btn.dataset.handle;
        customAccounts = customAccounts.filter(a => a.handle.toLowerCase() !== h);
        delete blockedOverrides[h];
        save(render);
      });
    });
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  document.getElementById("searchInput").addEventListener("input", e => {
    currentFilter = e.target.value;
    render();
  });

  // ── Add account ────────────────────────────────────────────────────────────

  const handleInput = document.getElementById("handleInput");
  const catSelect   = document.getElementById("catSelect");
  const addBtn      = document.getElementById("addBtn");
  const errEl       = document.getElementById("addError");

  addBtn.addEventListener("click", () => {
    errEl.textContent = "";
    const handle = handleInput.value.trim().replace(/^@/, "").toLowerCase();
    if (!handle) { errEl.textContent = "Enter a username."; return; }
    if (!/^[a-z0-9_]{1,50}$/.test(handle)) { errEl.textContent = "Invalid username."; return; }

    const exists = [...MEDIACHECK_DEFAULT_ACCOUNTS, ...customAccounts]
      .some(a => a.handle.toLowerCase() === handle);
    if (exists) { errEl.textContent = "Already in list."; return; }

    const cat = catSelect.value;
    customAccounts.push({
      handle,
      label: catShortLabel(cat),
      category: cat,
      blocked: cat === "state-propaganda",
      detail: `Manually flagged as: ${catShortLabel(cat)}.`
    });
    save(() => {
      handleInput.value = "";
      document.getElementById("pendingHint").style.display = "none";
      render();
    });
  });

  handleInput.addEventListener("keydown", e => { if (e.key === "Enter") addBtn.click(); });

  // ── Pending handle from context menu ──────────────────────────────────────

  chrome.storage.local.get("pendingAdd", data => {
    if (data.pendingAdd) {
      handleInput.value = data.pendingAdd;
      const hint = document.getElementById("pendingHint");
      hint.textContent = `Right-clicked: @${data.pendingAdd} — pick a category and click Add.`;
      hint.style.display = "block";
      chrome.storage.local.remove("pendingAdd");
      // Switch to accounts tab
      document.querySelector('[data-tab="accounts"]').click();
    }
  });

  // ── Export ─────────────────────────────────────────────────────────────────

  document.getElementById("exportBtn").addEventListener("click", () => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      customAccounts,
      disabledHandles,
      blockedOverrides
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "mediacheck-accounts.json";
    a.click(); URL.revokeObjectURL(url);
  });

  // ── Import ─────────────────────────────────────────────────────────────────

  document.getElementById("importFile").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.customAccounts)  customAccounts  = data.customAccounts;
        if (data.disabledHandles) disabledHandles = data.disabledHandles;
        if (data.blockedOverrides) blockedOverrides = data.blockedOverrides;
        save(render);
      } catch { errEl.textContent = "Invalid JSON file."; }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  // ── Settings ───────────────────────────────────────────────────────────────

  const settingIds = {
    "s-banner": "showProfileBanner",
    "s-badge":  "showTweetBadge",
    "s-avatar": "showAvatarIndicator",
    "s-block":  "blockContent"
  };

  function applySettingsToUI() {
    for (const [id, key] of Object.entries(settingIds)) {
      const el = document.getElementById(id);
      if (el) el.checked = !!settings[key];
    }
  }

  Object.entries(settingIds).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", () => {
      settings[key] = el.checked;
      save(() => {});
    });
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all custom accounts and settings to defaults?")) return;
    customAccounts   = [];
    disabledHandles  = [];
    blockedOverrides = {};
    settings         = { ...DEFAULT_SETTINGS };
    save(() => { applySettingsToUI(); render(); });
  });

  // ── Country flag helper ────────────────────────────────────────────────────

  function flag(code) {
    return [...code.toUpperCase()].map(c => String.fromCodePoint(c.codePointAt(0) + 127397)).join("");
  }

  // ── Load ───────────────────────────────────────────────────────────────────

  chrome.storage.sync.get(
    ["customAccounts", "disabledHandles", "blockedOverrides", "settings"],
    data => {
      customAccounts   = data.customAccounts   || [];
      disabledHandles  = data.disabledHandles  || [];
      blockedOverrides = data.blockedOverrides || {};
      if (data.settings) Object.assign(settings, data.settings);
      applySettingsToUI();
      render();
    }
  );
})();
