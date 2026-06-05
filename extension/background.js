const DEFAULT_SETTINGS = {
  showSidebarWidget:   true,
  showProfileBanner:   true,
  showTweetBadge:      true,
  showAvatarDot:       true,
  blockContent:        true,
  highlightTweets:     false
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(
    ["customAccounts", "disabledHandles", "blockedOverrides", "trustedHandles", "settings"],
    data => {
      if (!data.customAccounts)   chrome.storage.sync.set({ customAccounts: [] });
      if (!data.disabledHandles)  chrome.storage.sync.set({ disabledHandles: [] });
      if (!data.blockedOverrides) chrome.storage.sync.set({ blockedOverrides: {} });
      if (!data.trustedHandles)   chrome.storage.sync.set({ trustedHandles: [] });
      if (!data.settings)         chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    }
  );

  chrome.contextMenus.create({
    id: "pluto-flag",
    title: "Flag with Pluto…",
    contexts: ["link"],
    documentUrlPatterns: ["https://twitter.com/*", "https://x.com/*"]
  });

  chrome.contextMenus.create({
    id: "pluto-trust",
    title: "Mark as trusted in Pluto",
    contexts: ["link"],
    documentUrlPatterns: ["https://twitter.com/*", "https://x.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  const url = info.linkUrl || "";
  const m = url.match(/(?:twitter|x)\.com\/([A-Za-z0-9_]{1,50})(?:[/?#]|$)/);
  if (!m) return;

  if (info.menuItemId === "pluto-flag") {
    chrome.storage.local.set({ pendingAdd: m[1] });
  }
  if (info.menuItemId === "pluto-trust") {
    chrome.storage.sync.get("trustedHandles", d => {
      const list = d.trustedHandles || [];
      const h = m[1].toLowerCase();
      if (!list.includes(h)) {
        chrome.storage.sync.set({ trustedHandles: [...list, h] });
      }
    });
  }
});

// Per-tab warning counts — shown as extension badge
const tabCounts = {};

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "PLUTO_COUNT") return;
  const id = sender.tab?.id;
  if (!id) return;
  tabCounts[id] = (tabCounts[id] || 0) + msg.delta;
  const n = tabCounts[id];
  chrome.action.setBadgeText({ text: n > 0 ? (n > 99 ? "99+" : String(n)) : "", tabId: id });
  chrome.action.setBadgeBackgroundColor({ color: "#7c3aed", tabId: id });
});

chrome.tabs.onRemoved.addListener(id => delete tabCounts[id]);
chrome.tabs.onUpdated.addListener((id, info) => {
  if (info.status === "loading") {
    tabCounts[id] = 0;
    chrome.action.setBadgeText({ text: "", tabId: id });
  }
});
