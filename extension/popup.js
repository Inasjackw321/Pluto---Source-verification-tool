(() => {
  const listEl   = document.getElementById("accountList");
  const input    = document.getElementById("handleInput");
  const catSel   = document.getElementById("catSelect");
  const addBtn   = document.getElementById("addBtn");
  const errEl    = document.getElementById("addError");

  const LABEL_MAP = {
    "state-affiliated": "State Media",
    "misinformation":   "Unverified Claims",
    "satire":           "Satire"
  };

  let customAccounts = [];
  let disabledHandles = [];

  function save(cb) {
    chrome.storage.sync.set({ customAccounts, disabledHandles }, cb);
  }

  function isDefault(handle) {
    return MEDIACHECK_DEFAULT_ACCOUNTS.some(a => a.handle.toLowerCase() === handle);
  }

  function render() {
    const disabled = new Set(disabledHandles.map(h => h.toLowerCase()));
    const all = [
      ...MEDIACHECK_DEFAULT_ACCOUNTS,
      ...customAccounts.filter(c => !isDefault(c.handle.toLowerCase()))
    ];

    if (!all.length) { listEl.textContent = "No accounts flagged."; return; }

    listEl.innerHTML = "";
    all.forEach(acc => {
      const handle = acc.handle.toLowerCase();
      const off = disabled.has(handle);
      const cat = MEDIACHECK_CATEGORIES[acc.category] || { color: "#555", bgColor: "#eee" };
      const label = LABEL_MAP[acc.category] || acc.label || acc.category;

      const row = document.createElement("div");
      row.className = "acc-item" + (off ? " acc-disabled" : "");

      row.innerHTML = `
        <span class="acc-handle">@${acc.handle}</span>
        <span class="acc-label" style="background:${cat.bgColor};color:${cat.color}">${label}</span>
        <button class="acc-toggle" data-handle="${handle}" data-off="${off}">
          ${off ? "Enable" : "Disable"}
        </button>
      `;
      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".acc-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const h = btn.dataset.handle;
        const wasOff = btn.dataset.off === "true";
        if (wasOff) {
          disabledHandles = disabledHandles.filter(x => x.toLowerCase() !== h);
        } else {
          if (!disabledHandles.includes(h)) disabledHandles.push(h);
        }
        save(render);
      });
    });
  }

  function load() {
    chrome.storage.sync.get(["customAccounts", "disabledHandles"], data => {
      customAccounts  = data.customAccounts  || [];
      disabledHandles = data.disabledHandles || [];
      render();
    });
  }

  addBtn.addEventListener("click", () => {
    errEl.textContent = "";
    let handle = input.value.trim().replace(/^@/, "").toLowerCase();
    if (!handle) { errEl.textContent = "Enter a username."; return; }
    if (!/^[a-z0-9_]{1,50}$/.test(handle)) {
      errEl.textContent = "Invalid username."; return;
    }
    const exists = [
      ...MEDIACHECK_DEFAULT_ACCOUNTS,
      ...customAccounts
    ].some(a => a.handle.toLowerCase() === handle);
    if (exists) { errEl.textContent = "Account already in list."; return; }

    const cat = catSel.value;
    customAccounts.push({
      handle,
      label: LABEL_MAP[cat] || cat,
      category: cat,
      detail: `Manually flagged as: ${LABEL_MAP[cat] || cat}.`
    });
    save(() => { input.value = ""; render(); });
  });

  input.addEventListener("keydown", e => { if (e.key === "Enter") addBtn.click(); });

  load();
})();
