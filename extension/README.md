# TrustLens Chrome Extension

TrustLens is a local-only Manifest V3 extension. It scans the active HTTP(S) tab URL and visible text with the existing TrustLens rule engine. No external API, LLM, analytics request, or page-text upload is used.

## Build and install

From the project root:

```powershell
pnpm extension:build
```

Then in Chrome or Edge:

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this generated folder:

```text
PROJECT-TrustLens\extension\dist
```

5. Pin TrustLens in the toolbar.
6. Reload the website you want to scan.

After a normal HTTP(S) page loads, the TrustLens badge appears in the lower-right corner. The popup provides Scan, Rescan, Shield ON/OFF, both scores, verdict, and detected reasons.

## What it detects

The local TrustLens rules cover fake countdowns, scarcity claims, hidden fees, confirmshaming, lookalike domains, suspicious URL structure, fake KYC/account-blocked messages, job and registration-fee scams, and requests involving UPI, OTP, PIN, CVV, Aadhaar, PAN, or passwords.

Manipulation signals are highlighted amber. Scam-risk signals are highlighted red. The badge shows:

- Manipulation Score
- Fraud Risk Score
- Safe, Pushy, Deceptive, or Likely Scam verdict
- Hindi explanations when the rule provides them

## Per-site Shield setting

The page badge and popup store the setting in `chrome.storage.local` using an origin-specific key such as:

```text
enabled:http://localhost:3001
```

Turning Shield OFF removes the badge and highlights for the current site. The setting survives reloads and does not affect other origins.

## Website message bridge

The content script accepts website requests only when the message comes from the same window, uses an explicitly allowlisted origin, and includes the expected source marker. Allowed origins are defined in `src/content.js`; add your real deployed TrustLens origin there before building if needed.

```js
window.postMessage({
  source: "trustlens-website",
  type: "TRUSTLENS_SCAN",
}, window.location.origin);

window.postMessage({
  source: "trustlens-website",
  type: "TRUSTLENS_SET_ENABLED",
  enabled: false,
}, window.location.origin);
```

The bridge never accepts `*`, arbitrary origins, or messages without `source: "trustlens-website"`. Random websites cannot use it to disable the extension.

## Restricted pages

Chrome does not allow content scripts on `chrome://` pages, New Tab, PDF viewer pages, extension pages, or the Chrome Web Store. The popup detects non-HTTP(S) URLs and displays a safe message. These pages are ignored without throwing errors.

## Testing checklist

- [ ] `pnpm extension:build` completes.
- [ ] `extension/dist` loads from `chrome://extensions` without manifest errors.
- [ ] A real HTTP(S) website shows the TrustLens badge after reload.
- [ ] The badge shows two separate scores and one of the four requested verdicts.
- [ ] Fake countdown/scarcity/hidden-fee/confirmshaming text is highlighted amber when visible.
- [ ] KYC/account-blocked, job-fee, UPI, OTP, PIN, CVV, Aadhaar, PAN, and lookalike-domain evidence is highlighted red when matching text exists.
- [ ] Popup Scan and Rescan read the current tab URL and visible text.
- [ ] Popup shows hostname, Shield state, both scores, verdict, and reasons.
- [ ] Shield OFF from the badge removes the badge/highlights and persists after reload.
- [ ] Shield ON from the popup restores scanning for that origin.
- [ ] Dynamic DOM changes trigger a throttled rescan.
- [ ] `chrome://extensions`, New Tab, a PDF viewer, and an extension page show a safe restricted-page state.
- [ ] A non-allowlisted origin cannot use `postMessage` to request a scan or disable Shield.
- [ ] No network requests are made by the extension scanner.
