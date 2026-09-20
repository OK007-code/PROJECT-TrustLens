chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "TRUSTLENS_SCAN_PAGE") return undefined;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) {
      sendResponse({ ok: false, error: "No active tab is available." });
      return;
    }

    chrome.tabs.sendMessage(tabId, { type: "TRUSTLENS_GET_PAGE_TEXT" }, (response) => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: "This page cannot be scanned by a browser extension." });
        return;
      }
      sendResponse(response || { ok: false, error: "Could not read this page." });
    });
  });

  return true;
});
