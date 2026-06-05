// Service worker — no persistent state needed; storage is handled by content/popup scripts.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["customAccounts", "disabledHandles"], data => {
    if (!data.customAccounts)  chrome.storage.sync.set({ customAccounts: [] });
    if (!data.disabledHandles) chrome.storage.sync.set({ disabledHandles: [] });
  });
});
