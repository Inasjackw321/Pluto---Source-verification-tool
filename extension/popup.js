(() => {
  const listEl   = document.getElementById("accountList");
  const input    = document.getElementById("handleInput");
  const catSel   = document.getElementById("catSelect");
  const addBtn   = document.getElementById("addBtn");
  const errEl    = document.getElementById("addError");

  const CAT_CLASS = {
    "state-affiliated": "state",
    "misinformation":   "misinfo",
    "satire":           "satire"
  };
  const CAT_LABEL = {
    "state-affiliated": "State Media",
    "misinformation":   "Unverified",
    "satire":           "Satire"
  };

  let customAccounts  = [];
  let disabledHandles = [];
  let blockedOverrides = {}; // handle → true/false (override default blocked setting)

  function save(cb) {
    chrome.storage.sync.set({ customAccounts, disabledHandles, blockedOverrides }, cb);
  }

  function isDefault(handle) {
    return MEDIACHECK_DEFAULT_ACCOUNTS.some(a => a.handle.toLowerCase() === handle);
  }

  function isBlocked(acc) {
    const h = acc.handle.toLowerCase();
    if (h in blockedOverrides) return blockedOverrides[h];
    return !!acc.blocked;
  }

  function render() {
    const disabled = new Set(disabledHandles.map(h => h.toLowerCase()));
    const customHandles = new Set(customAccounts.map(a => a.handle.toLowerCase()));
    const all = [
      ...MEDIACHECK_DEFAULT_ACCOUNTS,
      ...customAccounts.filter(c => !isDefault(c.handle.toLowerCase()))
    ];

    listEl.innerHTML = "";
    if (!all.length) {
      listEl.innerHTML = '<div style="padding:12px 14px;color:#aaa;font-size:12px">No accounts flagged.</div>';
      return;
    }

    all.forEach(acc => {
      const handle = acc.handle.toLowerCase();
      const off     = disabled.has(handle);
      const blocked = isBlocked(acc);
      const cls     = CAT_CLASS[acc.category] || "state";
      const label   = CAT_LABEL[acc.category] || acc.label;
      const isCustom = customHandles.has(handle);

      const row = document.createElement("div");
      row.className = "acc-item" + (off ? " disabled" : "");

      const blockDot = blocked && !off
        ? `<span class="blocked-dot" title="Content hidden by default"></span>`
        : "";

      row.innerHTML = `
        ${blockDot}
        <span class="acc-handle">@${acc.handle}</span>
        <span class="acc-badge ${cls}">${label}</span>
        <div class="acc-actions">
          <button class="btn-sm btn-block" data-handle="${handle}" data-blocked="${blocked}" title="${blocked ? "Unblock content" : "Block content"}">
            ${blocked ? "Unblock" : "Block"}
          </button>
          <button class="btn-sm btn-toggle" data-handle="${handle}" data-off="${off}">
            ${off ? "Enable" : "Disable"}
          </button>
          ${isCustom ? `<button class="btn-sm danger btn-remove" data-handle="${handle}">✕</button>` : ""}
        </div>
      `;
      listEl.appendChild(row);
    });

    // Toggle disable/enable
    listEl.querySelectorAll(".btn-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const h = btn.dataset.handle;
        if (btn.dataset.off === "true") {
          disabledHandles = disabledHandles.filter(x => x.toLowerCase() !== h);
        } else {
          if (!disabledHandles.includes(h)) disabledHandles.push(h);
        }
        save(render);
      });
    });

    // Toggle block/unblock
    listEl.querySelectorAll(".btn-block").forEach(btn => {
      btn.addEventListener("click", () => {
        const h = btn.dataset.handle;
        const wasBlocked = btn.dataset.blocked === "true";
        blockedOverrides[h] = !wasBlocked;
        save(render);
      });
    });

    // Remove custom account
    listEl.querySelectorAll(".btn-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const h = btn.dataset.handle;
        customAccounts = customAccounts.filter(a => a.handle.toLowerCase() !== h);
        delete blockedOverrides[h];
        save(render);
      });
    });
  }

  function load() {
    chrome.storage.sync.get(["customAccounts", "disabledHandles", "blockedOverrides"], data => {
      customAccounts   = data.customAccounts   || [];
      disabledHandles  = data.disabledHandles  || [];
      blockedOverrides = data.blockedOverrides || {};
      render();
    });
  }

  addBtn.addEventListener("click", () => {
    errEl.textContent = "";
    const handle = input.value.trim().replace(/^@/, "").toLowerCase();
    if (!handle) { errEl.textContent = "Enter a username."; return; }
    if (!/^[a-z0-9_]{1,50}$/.test(handle)) { errEl.textContent = "Invalid username."; return; }

    const exists = [...MEDIACHECK_DEFAULT_ACCOUNTS, ...customAccounts]
      .some(a => a.handle.toLowerCase() === handle);
    if (exists) { errEl.textContent = "Already in list."; return; }

    const cat = catSel.value;
    customAccounts.push({
      handle,
      label: CAT_LABEL[cat] || cat,
      category: cat,
      blocked: false,
      detail: `Manually flagged as: ${CAT_LABEL[cat] || cat}.`
    });
    save(() => { input.value = ""; render(); });
  });

  input.addEventListener("keydown", e => { if (e.key === "Enter") addBtn.click(); });

  load();
})();
