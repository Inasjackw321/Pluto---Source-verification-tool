const DEFAULT_SETTINGS = {
  showProfileBanner:   true,
  showTweetBadge:      true,
  showAvatarIndicator: true,
  blockContent:        true
};

// ── Install ──────────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(
    ["customAccounts", "disabledHandles", "blockedOverrides", "settings"],
    data => {
      if (!data.customAccounts)   chrome.storage.sync.set({ customAccounts: [] });
      if (!data.disabledHandles)  chrome.storage.sync.set({ disabledHandles: [] });
      if (!data.blockedOverrides) chrome.storage.sync.set({ blockedOverrides: {} });
      if (!data.settings)         chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    }
  );

  chrome.contextMenus.create({
    id: "mc-flag-account",
    title: "Flag this account in Mediacheck…",
    contexts: ["link"],
    documentUrlPatterns: ["https://twitter.com/*", "https://x.com/*"]
  });
});

// ── Context menu click ───────────────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "mc-flag-account") return;
  const url = info.linkUrl || "";
  const m = url.match(/(?:twitter|x)\.com\/([A-Za-z0-9_]{1,50})(?:[/?#]|$)/);
  if (!m) return;
  // Store the handle so the popup can pre-fill it
  chrome.storage.local.set({ pendingAdd: m[1] });
});

// ── Badge counter ────────────────────────────────────────────────────────────

// Per-tab warning counts
const tabCounts = {};

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "MC_COUNT") return;
  const tabId = sender.tab?.id;
  if (!tabId) return;
  tabCounts[tabId] = (tabCounts[tabId] || 0) + msg.delta;
  const n = tabCounts[tabId];
  chrome.action.setBadgeText({ text: n > 0 ? (n > 99 ? "99+" : String(n)) : "", tabId });
  chrome.action.setBadgeBackgroundColor({ color: "#b71c1c", tabId });
});

chrome.tabs.onRemoved.addListener(tabId => { delete tabCounts[tabId]; });
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === "loading") {
    tabCounts[tabId] = 0;
    chrome.action.setBadgeText({ text: "", tabId });
  }
});
