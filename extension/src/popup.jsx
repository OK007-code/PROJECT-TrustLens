import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { analyzeForExtension } from "./localAnalysis.js";
import "../popup.css";

const verdictMeta = {
  safe: ["Safe", "low"],
  pushy: ["Pushy", "medium"],
  deceptive: ["Deceptive", "medium"],
  scam: ["Likely Scam", "high"],
};

function restrictedUrl(url) {
  return !/^https?:/i.test(url || "");
}

function App() {
  const [tab, setTab] = useState(null);
  const [result, setResult] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const [status, setStatus] = useState("Ready to scan the current tab.");
  const [busy, setBusy] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [input, setInput] = useState("");

  const loadTab = () => {
    if (!globalThis.chrome?.tabs?.query || !globalThis.chrome?.storage?.local) {
      setStatus("Open TrustLens from the browser toolbar after loading it as an extension.");
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      setTab(currentTab);
      if (!currentTab?.url || restrictedUrl(currentTab.url)) {
        setEnabled(false);
        setStatus("This browser page cannot be scanned.");
        return;
      }
      const key = `enabled:${new URL(currentTab.url).origin}`;
      chrome.storage.local.get({ [key]: true }, (settings) => setEnabled(settings[key] !== false));
    });
  };

  useEffect(() => loadTab(), []);

  const scan = () => {
    if (!tab?.id || restrictedUrl(tab.url)) {
      setStatus("Restricted browser pages cannot be scanned.");
      return;
    }
    setBusy(true);
    setStatus("Reading visible page text...");
    chrome.tabs.sendMessage(tab.id, { type: "TRUSTLENS_GET_PAGE_TEXT" }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        setBusy(false);
        setStatus(response?.error || "Reload the page after installing the extension.");
        return;
      }
      setEnabled(response.enabled !== false);
      setResult(response.result || analyzeForExtension(response.text || "", "page", new URL(tab.url)));
      setStatus("Scan complete. Results run locally.");
      setBusy(false);
    });
  };

  const toggleShield = () => {
    if (!tab?.id || restrictedUrl(tab.url)) return;
    const nextEnabled = !enabled;
    const key = `enabled:${new URL(tab.url).origin}`;
    setEnabled(nextEnabled);
    chrome.storage.local.set({ [key]: nextEnabled });
    chrome.tabs.sendMessage(tab.id, { type: "TRUSTLENS_SET_ENABLED", enabled: nextEnabled }, () => {
      setStatus(nextEnabled ? "Shield enabled for this site." : "Shield paused for this site.");
    });
  };

  const analyzePaste = () => {
    if (!input.trim()) return setStatus("Paste a message or link first.");
    setResult(analyzeForExtension(input, "message", tab?.url ? new URL(tab.url) : globalThis.location));
    setStatus("Paste scan complete. Results run locally.");
  };

  const meta = result ? (verdictMeta[result.verdict] || verdictMeta.safe) : null;
  const host = tab?.url && !restrictedUrl(tab.url) ? new URL(tab.url).hostname : "Restricted page";

  return (
    <main className="app">
      <header className="header">
        <div className="brand"><span className="brand-mark">◉</span>Trust<span style={{ color: "#0d9a91" }}>Lens</span></div>
        <button className={`shield-toggle ${enabled ? "on" : "off"}`} onClick={toggleShield} disabled={!tab?.id || restrictedUrl(tab?.url)}><span /> Shield {enabled ? "ON" : "OFF"}</button>
      </header>
      <div className="site-line" title={tab?.url}>{host}</div>
      <div className="actions"><button className="primary" onClick={scan} disabled={busy || !enabled}>Scan</button><button className="secondary" onClick={scan} disabled={busy || !enabled}>Rescan</button><button className="secondary" onClick={() => setPasteMode(!pasteMode)}>Paste</button></div>
      {pasteMode && <div className="paste-box"><textarea value={input} onChange={(event) => setInput(event.target.value.slice(0, 5000))} placeholder="Paste a suspicious message or link..." /><button className="primary" onClick={analyzePaste}>Analyze paste</button></div>}
      <div className="status" role="status">{status}</div>
      {result && <section className="result"><div className="verdict"><div><span>VERDICT</span><strong>{meta[0]}</strong></div><div className={`score ${meta[1]}`}>{Math.max(result.manipulationScore, result.fraudScore)}</div></div><div className="score-grid"><div><small>MANIPULATION</small><b>{result.manipulationScore}/100</b></div><div><small>FRAUD RISK</small><b>{result.fraudScore}/100</b></div></div><ul className="reasons">{result.reasons.slice(0, 6).map((reason) => <li className={reason.category === "scam" ? "red" : "amber"} key={reason.id}><b>{reason.tactic}</b><br />{reason.explanation_hi || reason.explanation}</li>)}</ul></section>}
      {!result && <div className="empty">Scan the real current tab to see two local risk scores and highlighted suspicious elements.</div>}
      <div className="footer">Local only · no APIs · no page text stored</div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
