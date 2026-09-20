import { analyzeForExtension } from "./localAnalysis.js";

const PANEL_ID = "trustlens-live-panel";
const STYLE_ID = "trustlens-live-style";
const HIGHLIGHT_CLASS = "trustlens-highlight";
const ALLOWED_WEBSITE_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "https://trustlens.app",
]);

let enabled = true;
let lastSignature = "";
let scanTimer;
let lastResult = null;

function isRestrictedPage() {
  return !["http:", "https:"].includes(window.location.protocol) || window.top !== window.self;
}

function pageText() {
  if (!document.body) return "";
  const snapshot = document.body.cloneNode(true);
  snapshot.querySelector(`#${PANEL_ID}`)?.remove();
  const visibleText = snapshot.innerText || snapshot.textContent || "";
  return `${window.location.href}\n${document.title}\n${visibleText}`.replace(/\s+/g, " ").trim().slice(0, 5000);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

function addStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID}{all:initial;position:fixed;z-index:2147483647;right:20px;bottom:20px;width:330px;color:#102b42;font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    #${PANEL_ID} *{box-sizing:border-box}
    #${PANEL_ID} .tl-card{border:1px solid #d6e3e5;border-radius:14px;background:rgba(255,255,255,.98);box-shadow:0 14px 45px rgba(11,27,43,.2);overflow:hidden}
    #${PANEL_ID} .tl-head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;color:#fff;background:#102b42}
    #${PANEL_ID} .tl-brand{font-weight:800;letter-spacing:-.03em}#${PANEL_ID} .tl-brand span{color:#73dfd0}#${PANEL_ID} .tl-live{margin-left:5px;color:#9fe8de;font-size:9px;letter-spacing:.1em}
    #${PANEL_ID} button{border:0;cursor:pointer}#${PANEL_ID} .tl-close{color:#cde3e6;background:transparent;font-size:18px;line-height:1}#${PANEL_ID} .tl-enable{padding:5px 8px;border-radius:999px;color:#087f78;background:#effbfa;font-size:10px;font-weight:750}
    #${PANEL_ID} .tl-body{padding:13px}#${PANEL_ID} .tl-row{display:flex;align-items:center;justify-content:space-between;gap:10px}#${PANEL_ID} .tl-label{color:#78909b;font-size:9px;letter-spacing:.1em}#${PANEL_ID} .tl-verdict{margin-top:3px;font-size:17px;font-weight:800}
    #${PANEL_ID} .tl-scores{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}#${PANEL_ID} .tl-score{padding:9px;border-radius:9px;background:#f1f7f7}#${PANEL_ID} .tl-score.amber{border-left:4px solid #f1a735}#${PANEL_ID} .tl-score.red{border-left:4px solid #df5a50}#${PANEL_ID} .tl-score b{display:block;margin-top:3px;font-size:20px}#${PANEL_ID} .tl-score small{color:#607b88;font-size:9px}
    #${PANEL_ID} .tl-note{margin:11px 0 0;color:#5b7381;font-size:11px;line-height:1.45}#${PANEL_ID} .tl-reasons{display:grid;gap:5px;margin:11px 0 0;padding:0;list-style:none}#${PANEL_ID} li{padding:7px 8px;border-radius:7px;color:#4f6876;background:#f1f7f7;font-size:10px;line-height:1.35}#${PANEL_ID} li.amber{border-left:3px solid #f1a735}#${PANEL_ID} li.red{border-left:3px solid #df5a50}#${PANEL_ID} li b{color:#102b42}#${PANEL_ID} .tl-foot{margin-top:10px;color:#94a6ad;font-size:9px}
    .${HIGHLIGHT_CLASS}{outline:2px solid #f1a735!important;outline-offset:2px!important;background-color:rgba(241,167,53,.12)!important}.${HIGHLIGHT_CLASS}[data-trustlens-risk="scam"]{outline-color:#df5a50!important;background-color:rgba(223,90,80,.12)!important}
  `;
  document.documentElement.appendChild(style);
}

function getVerdict(result) {
  if (result.verdict === "scam") return ["Likely Scam", "red"];
  if (result.verdict === "deceptive") return ["Deceptive", "amber"];
  if (result.verdict === "pushy") return ["Pushy", "amber"];
  return ["Safe", "green"];
}

function clearHighlights() {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((element) => {
    element.classList.remove(HIGHLIGHT_CLASS);
    element.removeAttribute("data-trustlens-risk");
  });
}

function highlightFindings(result) {
  clearHighlights();
  const elements = [...document.querySelectorAll("a,button,input,textarea,select,label,h1,h2,h3,p,li,span,div")].filter((element) => {
    if (element.closest(`#${PANEL_ID}`)) return false;
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && (element.innerText || element.value);
  });
  for (const finding of result.reasons) {
    const evidence = String(finding.evidence || "").toLocaleLowerCase();
    if (!evidence) continue;
    const target = elements.find((element) => String(element.innerText || element.value || "").toLocaleLowerCase().includes(evidence));
    if (target) {
      target.classList.add(HIGHLIGHT_CLASS);
      target.dataset.trustlensRisk = finding.category === "scam" ? "scam" : "manipulation";
    }
  }
}

function render(result) {
  if (isRestrictedPage() || !enabled) return;
  addStyles();
  lastResult = result;
  let panel = document.getElementById(PANEL_ID);
  if (!panel) {
    panel = document.createElement("aside");
    panel.id = PANEL_ID;
    document.documentElement.appendChild(panel);
  }
  const [label] = getVerdict(result);
  const reasons = result.reasons.slice(0, 4).map((item) => `<li class="${item.category === "scam" ? "red" : "amber"}"><b>${escapeHtml(item.tactic)}</b><br>${escapeHtml(item.explanation_hi || item.explanation)}</li>`).join("");
  panel.innerHTML = `<div class="tl-card"><div class="tl-head"><div class="tl-brand">Trust<span>Lens</span><small class="tl-live">LIVE</small></div><button class="tl-close" aria-label="Turn off TrustLens on this site">×</button></div><div class="tl-body"><div class="tl-row"><div><div class="tl-label">PAGE VERDICT</div><div class="tl-verdict">${label}</div></div><button class="tl-enable" type="button">Shield ON</button></div><div class="tl-scores"><div class="tl-score amber"><small>MANIPULATION SCORE</small><b>${result.manipulationScore}/100</b></div><div class="tl-score red"><small>FRAUD RISK SCORE</small><b>${result.fraudScore}/100</b></div></div><p class="tl-note">${result.reasons.length ? `Detected ${result.reasons.length} local signal${result.reasons.length === 1 ? "" : "s"}. Highlighted elements are marked amber or red.` : "No strong scam or pressure signals found on this page."}</p>${reasons ? `<ul class="tl-reasons">${reasons}</ul>` : ""}<div class="tl-foot">Local scan · ${escapeHtml(new URL(window.location.href).hostname)}</div></div></div>`;
  panel.querySelector(".tl-close").addEventListener("click", () => setEnabled(false));
  panel.querySelector(".tl-enable").addEventListener("click", () => setEnabled(false));
  highlightFindings(result);
}

function setEnabled(nextEnabled) {
  enabled = nextEnabled;
  const key = `enabled:${window.location.origin}`;
  chrome.storage.local.set({ [key]: enabled });
  if (enabled) {
    lastSignature = "";
    scanPage();
  } else {
    clearHighlights();
    document.getElementById(PANEL_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
  }
}

function scanPage() {
  if (!enabled || isRestrictedPage()) return;
  const input = pageText();
  if (!input || input === lastSignature) return;
  lastSignature = input;
  render(analyzeForExtension(input, "page", window.location));
}

function scheduleScan() {
  clearTimeout(scanTimer);
  scanTimer = setTimeout(scanPage, 1000);
}

function handleWebsiteMessage(event) {
  if (event.source !== window || !ALLOWED_WEBSITE_ORIGINS.has(event.origin)) return;
  const message = event.data;
  if (!message || message.source !== "trustlens-website") return;
  if (message.type === "TRUSTLENS_SCAN") {
    scanPage();
    window.postMessage({ source: "trustlens-extension", type: "TRUSTLENS_RESULT", result: lastResult }, event.origin);
  } else if (message.type === "TRUSTLENS_SET_ENABLED" && typeof message.enabled === "boolean") {
    setEnabled(message.enabled);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "TRUSTLENS_GET_PAGE_TEXT") return undefined;
  if (isRestrictedPage()) {
    sendResponse({ ok: false, restricted: true, error: "This browser page cannot be scanned by an extension." });
    return false;
  }
  sendResponse({ ok: true, enabled, text: pageText(), title: document.title, url: window.location.href, result: lastResult });
  return false;
});

window.addEventListener("message", handleWebsiteMessage);

if (!isRestrictedPage() && document.body) {
  const key = `enabled:${window.location.origin}`;
  chrome.storage.local.get({ [key]: true }, (settings) => {
    enabled = settings[key] !== false;
    if (enabled) scanPage();
  });
  new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true, characterData: true });
}
