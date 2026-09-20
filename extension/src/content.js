import { analyzeInput } from "../../client/src/lib/rules/engine.js";

const PANEL_ID = "trustlens-live-panel";
const STYLE_ID = "trustlens-live-style";
let lastSignature = "";
let scanTimer;

function pageText() {
  const snapshot = document.body?.cloneNode(true);
  snapshot?.querySelector(`#${PANEL_ID}`)?.remove();
  const bodyText = snapshot?.innerText || snapshot?.textContent || "";
  return `${window.location.href}\n${document.title}\n${bodyText}`.replace(/\s+/g, " ").trim().slice(0, 5000);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

function addStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `#${PANEL_ID}{all:initial;position:fixed;z-index:2147483647;right:20px;bottom:20px;width:310px;color:#102b42;font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#${PANEL_ID} *{box-sizing:border-box}#${PANEL_ID} .tl-card{border:1px solid #d6e3e5;border-radius:14px;background:rgba(255,255,255,.97);box-shadow:0 14px 45px rgba(11,27,43,.2);overflow:hidden}#${PANEL_ID} .tl-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;color:#fff;background:#102b42}#${PANEL_ID} .tl-brand{font-weight:800;letter-spacing:-.03em}#${PANEL_ID} .tl-brand span{color:#73dfd0}#${PANEL_ID} .tl-close{border:0;color:#cde3e6;background:transparent;cursor:pointer;font-size:18px;line-height:1}#${PANEL_ID} .tl-body{padding:14px}#${PANEL_ID} .tl-row{display:flex;align-items:center;justify-content:space-between;gap:10px}#${PANEL_ID} .tl-label{color:#78909b;font-size:10px;letter-spacing:.1em}#${PANEL_ID} .tl-verdict{margin-top:3px;font-size:17px;font-weight:800}#${PANEL_ID} .tl-score{display:grid;width:48px;height:48px;place-items:center;border:4px solid #0d9a91;border-radius:50%;font-size:17px;font-weight:800}#${PANEL_ID} .tl-score.medium{border-color:#f1a735}#${PANEL_ID} .tl-score.high{border-color:#df5a50}#${PANEL_ID} .tl-note{margin:12px 0 0;color:#5b7381;font-size:11px;line-height:1.45}#${PANEL_ID} .tl-reasons{display:grid;gap:6px;margin:12px 0 0;padding:0;list-style:none}#${PANEL_ID} li{padding:7px 8px;border-radius:7px;color:#4f6876;background:#f1f7f7;font-size:11px;line-height:1.35}#${PANEL_ID} li b{color:#102b42}#${PANEL_ID} .tl-foot{margin-top:11px;color:#94a6ad;font-size:10px}#${PANEL_ID} .tl-toggle{position:absolute;right:0;bottom:0;padding:9px 12px;border:0;border-radius:20px;color:#fff;background:#102b42;box-shadow:0 8px 25px rgba(11,27,43,.22);cursor:pointer;font-weight:750}`;
  document.documentElement.appendChild(style);
}

function verdict(result) {
  if (result.verdict === "scam") return ["Likely scam", "high"];
  if (result.verdict === "deceptive") return ["Deceptive content", "medium"];
  if (result.verdict === "pushy") return ["Pushy content", "medium"];
  return ["Looks safe", "low"];
}

function render(result) {
  addStyles();
  let panel = document.getElementById(PANEL_ID);
  if (!panel) {
    panel = document.createElement("aside");
    panel.id = PANEL_ID;
    document.documentElement.appendChild(panel);
  }
  const [label, tone] = verdict(result);
  const reasons = result.reasons.slice(0, 3).map((item) => `<li><b>${escapeHtml(item.tactic)}</b><br>${escapeHtml(item.explanation)}</li>`).join("");
  panel.innerHTML = `<div class="tl-card"><div class="tl-head"><div class="tl-brand">Trust<span>Lens</span> <small>LIVE</small></div><button class="tl-close" aria-label="Hide TrustLens">×</button></div><div class="tl-body"><div class="tl-row"><div><div class="tl-label">PAGE VERDICT</div><div class="tl-verdict">${label}</div></div><div class="tl-score ${tone}">${result.fraudScore}</div></div><p class="tl-note">${result.reasons.length ? `TrustLens found ${result.reasons.length} signal${result.reasons.length === 1 ? "" : "s"} on this page.` : "No strong scam or pressure signals found. Stay alert for unexpected requests."}</p>${reasons ? `<ul class="tl-reasons">${reasons}</ul>` : ""}<div class="tl-foot">Updates as page content changes · rules run locally</div></div></div>`;
  panel.querySelector(".tl-close").addEventListener("click", () => {
    panel.innerHTML = `<button class="tl-toggle">TrustLens · ${label}</button>`;
    panel.querySelector(".tl-toggle").addEventListener("click", () => render(result));
  });
}

function scanPage() {
  const input = pageText();
  if (!input || input === lastSignature) return;
  lastSignature = input;
  render(analyzeInput(input, "page"));
}

function scheduleScan() {
  clearTimeout(scanTimer);
  scanTimer = setTimeout(scanPage, 900);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "TRUSTLENS_GET_PAGE_TEXT") return undefined;
  sendResponse({ ok: true, text: pageText(), title: document.title, url: window.location.href });
  return false;
});

if (document.body) {
  scanPage();
  new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true, characterData: true });
}
