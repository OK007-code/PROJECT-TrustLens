import { CircleCheck, Download, ExternalLink, RefreshCw, ShieldCheck, ToggleRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Download,
    title: "Build the extension",
    body: "Open the project terminal and run the build command. It creates the browser-ready folder.",
    code: "pnpm extension:build",
  },
  {
    number: "02",
    icon: Download,
    title: "Load it in Chrome",
    body: "Open chrome://extensions, enable Developer mode, choose Load unpacked, and select the generated dist folder.",
    code: "PROJECT-TrustLens\\extension\\dist",
  },
  {
    number: "03",
    icon: RefreshCw,
    title: "Reload your website",
    body: "Pin TrustLens from the toolbar, open a normal HTTP or HTTPS site, and refresh once after installing the extension.",
    code: "Ctrl + Shift + R",
  },
];

export default function Extension() {
  return (
    <div className="page extension-page container">
      <div className="page-intro extension-intro">
        <div className="eyebrow"><span className="eyebrow-dot" /> BROWSER SHIELD</div>
        <h1>TrustLens, right where the risk appears.</h1>
        <p>Install the separate Chrome extension to scan live websites. It reads the current URL and visible page text locally, then shows a badge with the verdict, two scores, and highlighted warning signals.</p>
      </div>

      <section className="extension-hero-card">
        <div className="extension-hero-icon"><ShieldCheck size={26} /></div>
        <div className="extension-hero-copy">
          <div className="section-kicker">LIVE PROTECTION</div>
          <h2>See pressure before you click.</h2>
          <p>The extension works independently from this website. It automatically checks pages, rescans dynamic content, and keeps Shield settings per site.</p>
          <div className="extension-hero-actions">
            <a className="button button-primary" href="https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world" target="_blank" rel="noreferrer">Chrome extension guide <ExternalLink size={15} /></a>
            <a className="button button-secondary" href="#install-steps">See install steps <Download size={15} /></a>
          </div>
        </div>
        <div className="extension-preview">
          <div className="extension-preview-top"><span>Trust<span>Lens</span></span><small>LIVE</small></div>
          <div className="extension-preview-verdict">Likely Scam <strong>82</strong></div>
          <div className="extension-preview-scores"><span>Manipulation <b>64</b></span><span>Fraud risk <b>82</b></span></div>
          <div className="extension-preview-line amber">Urgency pressure</div>
          <div className="extension-preview-line red">Insecure connection</div>
        </div>
      </section>

      <section id="install-steps" className="extension-section">
        <div className="section-kicker">INSTALL IN THREE STEPS</div>
        <h2>Set up your browser shield</h2>
        <div className="extension-step-grid">
          {steps.map(({ number, icon: Icon, title, body, code }) => (
            <article className="extension-step" key={number}>
              <div className="extension-step-top"><span>{number}</span><Icon size={19} /></div>
              <h3>{title}</h3>
              <p>{body}</p>
              <code>{code}</code>
            </article>
          ))}
        </div>
      </section>

      <section className="extension-controls">
        <div>
          <div className="section-kicker">WHAT YOU GET</div>
          <h2>A small badge, useful context.</h2>
        </div>
        <div className="extension-control-list">
          <div><CircleCheck size={18} /><span><strong>Two scores</strong> Manipulation and Fraud Risk stay separate.</span></div>
          <div><ToggleRight size={18} /><span><strong>Shield ON/OFF</strong> Pause protection for one site and keep the choice after reload.</span></div>
          <div><ShieldCheck size={18} /><span><strong>Local and private</strong> No external API or page-text upload is used.</span></div>
        </div>
      </section>

      <section className="extension-help">
        <strong>Seeing a blank popup?</strong>
        <span>Reload the extension from chrome://extensions, then open it by clicking the pinned toolbar icon. Do not open popup.html directly.</span>
      </section>
    </div>
  );
}
