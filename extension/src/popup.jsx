import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { analyzeInput } from "../../client/src/lib/rules/engine.js";
import "../popup.css";

const verdictMeta = {
  safe: ["Looks safe", "low"],
  pushy: ["Pushy content", "medium"],
  deceptive: ["Deceptive content", "medium"],
  scam: ["Likely scam", "high"],
};

function App() {
  const [mode, setMode] = useState("page");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("Scan the current tab or paste suspicious content.");
  const [busy, setBusy] = useState(false);

  const scan = (value, kind) => {
    const clean = value.trim();
    if (!clean) {
      setStatus("Nothing to scan yet.");
      return;
    }
    setBusy(true);
    setStatus("Checking signals...");
    try {
      setResult(analyzeInput(clean, kind));
      setStatus("Scan complete.");
    } finally {
      setBusy(false);
    }
  };

  const scanCurrentPage = () => {
    setBusy(true);
    setStatus("Reading the current tab...");
    chrome.runtime.sendMessage({ type: "TRUSTLENS_SCAN_PAGE" }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        setBusy(false);
        setStatus(response?.error || "This page cannot be scanned.");
        return;
      }
      setInput(response.text || "");
      setMode("page");
      scan(response.text || "", "page");
    });
  };

  const meta = result ? (verdictMeta[result.verdict] || verdictMeta.safe) : null;
  return (
    <main className="app">
      <header className="header">
        <div className="brand"><span className="brand-mark">◉</span>Trust<span style={{ color: "#0d9a91" }}>Lens</span></div>
        <small>Browser shield</small>
      </header>
      <div className="tabs">
        <button className={`tab ${mode === "page" ? "active" : ""}`} onClick={() => setMode("page")}>Current page</button>
        <button className={`tab ${mode === "text" ? "active" : ""}`} onClick={() => setMode("text")}>Paste text</button>
      </div>
      {mode === "page" ? (
        <button className="primary" onClick={scanCurrentPage} disabled={busy}>Scan this page</button>
      ) : (
        <>
          <textarea value={input} onChange={(event) => setInput(event.target.value.slice(0, 5000))} placeholder="Paste a message, link, or offer here..." autoFocus />
          <div className="actions"><button className="primary" onClick={() => scan(input, "message")} disabled={busy}>Analyze text</button><button className="secondary" onClick={() => { setInput(""); setResult(null); }}>Clear</button></div>
        </>
      )}
      <div className="status" role="status">{status}</div>
      {result ? (
        <section className="result">
          <div className="verdict"><div><span>VERDICT</span><strong>{meta[0]}</strong></div><div className={`score ${meta[1]}`}>{result.fraudScore}</div></div>
          <ul className="reasons">{result.reasons.slice(0, 5).map((reason) => <li key={reason.id}><b>{reason.tactic}</b><br />{reason.explanation}</li>)}</ul>
        </section>
      ) : <div className="empty">TrustLens checks urgency, lookalike domains, payment pressure, credential requests, and dark patterns.</div>}
      <div className="footer">Pause. Verify through an official channel.</div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
