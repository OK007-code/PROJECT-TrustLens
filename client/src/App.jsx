import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, copy, useLanguage } from "./contexts/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import Demo from "./pages/Demo";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { Link, Route, Switch, useLocation } from "wouter";
import { ArrowRight, Eye, Globe2, Radar, ShieldCheck } from "lucide-react";
function SiteHeader() {
    const { language, setLanguage, isHindi } = useLanguage();
    const [location] = useLocation();
    const t = copy[language];
    const links = [
        { href: "/scan", label: t.navScan, icon: Radar },
        { href: "/demo", label: t.navDemo, icon: Eye },
        { href: "/reports", label: t.navReports, icon: ShieldCheck },
    ];
    return (_jsx("header", { className: "site-header", children: _jsxs("div", { className: "site-header-inner", children: [_jsxs(Link, { href: "/", className: "brand", "aria-label": "TrustLens home", children: [_jsx("span", { className: "brand-mark", children: _jsx(Eye, { size: 18, strokeWidth: 2.5 }) }), _jsxs("span", { children: ["Trust", _jsx("span", { children: "Lens" })] })] }), _jsx("nav", { className: "main-nav", "aria-label": "Main navigation", children: links.map(({ href, label, icon: Icon }) => _jsxs(Link, { href: href, className: `nav-link ${location === href ? "active" : ""}`, children: [_jsx(Icon, { size: 16 }), label] }, href)) }), _jsxs("button", { className: "language-toggle", onClick: () => setLanguage(isHindi ? "en" : "hi"), "aria-label": `Switch language to ${isHindi ? "English" : "Hindi"}`, children: [_jsx(Globe2, { size: 15 }), " ", t.language] })] }) }));
}
function Layout() {
    const { language } = useLanguage();
    const t = copy[language];
    return _jsxs("div", { className: "app-shell", children: [_jsx(SiteHeader, {}), _jsx("main", { children: _jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Home }), _jsx(Route, { path: "/scan", component: Scanner }), _jsx(Route, { path: "/demo", component: Demo }), _jsx(Route, { path: "/reports", component: Reports }), _jsx(Route, { path: "/404", component: NotFound }), _jsx(Route, { component: NotFound })] }) }), _jsxs("footer", { className: "site-footer", children: [_jsxs("div", { children: [_jsx("strong", { children: "TrustLens" }), _jsx("span", { children: "Tech for a Better Tomorrow" })] }), _jsxs("div", { className: "footer-note", children: [t.disclaimer, " ", _jsx("span", { className: "footer-dot", children: "\u00B7" }), " ", _jsx("span", { children: t.privacy })] }), _jsxs(Link, { href: "/scan", className: "footer-cta", children: [t.scan, " ", _jsx(ArrowRight, { size: 15 })] })] })] });
}
export default function App() {
    return _jsx(ErrorBoundary, { children: _jsx(ThemeProvider, { defaultTheme: "light", children: _jsx(LanguageProvider, { children: _jsxs(TooltipProvider, { children: [_jsx(Toaster, {}), _jsx(Layout, {})] }) }) }) });
}
