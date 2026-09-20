function getPageText() {
  const root = document.body;
  if (!root) return "";
  const text = root.innerText || root.textContent || "";
  return text.replace(/\s+/g, " ").trim().slice(0, 5000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "TRUSTLENS_GET_PAGE_TEXT") return undefined;
  sendResponse({ ok: true, text: getPageText(), title: document.title, url: window.location.href });
  return false;
});
