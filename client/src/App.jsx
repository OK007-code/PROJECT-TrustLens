import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, copy, useLanguage } from "./contexts/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import Demo from "./pages/Demo";
import Reports from "./pages/Reports";
import Extension from "./pages/Extension";
import NotFound from "./pages/NotFound";
import { Link, Route, Switch, useLocation } from "wouter";
import { ArrowRight, Download, Eye, Globe2, Radar, ShieldCheck } from "lucide-react";

function SiteHeader() {
  const { language, setLanguage, isHindi } = useLanguage();
  const [location] = useLocation();
  const t = copy[language];
  const links = [
    { href: "/scan", label: t.navScan, icon: Radar },
    { href: "/demo", label: t.navDemo, icon: Eye },
    { href: "/reports", label: t.navReports, icon: ShieldCheck },
    { href: "/extension", label: "Extension", icon: Download },
  ];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="TrustLens home">
          <span className="brand-mark"><Eye size={18} strokeWidth={2.5} /></span>
          <span>Trust<span>Lens</span></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${location === href ? "active" : ""}`}>
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <button className="language-toggle" onClick={() => setLanguage(isHindi ? "en" : "hi")} aria-label={`Switch language to ${isHindi ? "English" : "Hindi"}`}>
          <Globe2 size={15} /> {t.language}
        </button>
      </div>
    </header>
  );
}

function Layout() {
  const { language } = useLanguage();
  const t = copy[language];
  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/scan" component={Scanner} />
          <Route path="/demo" component={Demo} />
          <Route path="/reports" component={Reports} />
          <Route path="/extension" component={Extension} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="site-footer">
        <div><strong>TrustLens</strong><span>Tech for a Better Tomorrow</span></div>
        <div className="footer-note">{t.disclaimer} <span className="footer-dot">·</span> <span>{t.privacy}</span></div>
        <Link href="/scan" className="footer-cta">{t.scan} <ArrowRight size={15} /></Link>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Layout />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
