import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => localStorage.getItem("trustlens-language") || "en");
    useEffect(() => { localStorage.setItem("trustlens-language", language); }, [language]);
    const value = useMemo(() => ({ language, setLanguage, isHindi: language === "hi" }), [language]);
    return _jsx(LanguageContext.Provider, { value: value, children: children });
}
export function useLanguage() {
    const value = useContext(LanguageContext);
    if (!value)
        throw new Error("useLanguage must be used inside LanguageProvider");
    return value;
}
export const copy = {
    en: {
        navScan: "Scan something", navDemo: "Live Shield", navReports: "Community", language: "हिन्दी",
        scan: "Scan", analyze: "Analyze now", analyzing: "Checking signals…", paste: "Paste a message, link, or page text", privacy: "Your text is analyzed and not stored.", disclaimer: "TrustLens gives risk guidance, not legal or financial advice.",
        why: "Why flagged", advice: "What to do now", anatomy: "Scam anatomy", rules: "Rule engine", hybrid: "Hybrid analysis", alert: "Alert a family member", showAll: "Show all reasons", safe: "Looks safe", pushy: "Pushy", deceptive: "Deceptive", scam: "Likely scam", manipulation: "Manipulation score", fraud: "Fraud risk score", evidence: "Evidence", community: "Community reports", report: "Report a suspicious item", submit: "Add report", noReports: "No reports yet. Be the first to help someone else.",
    },
    hi: {
        navScan: "जाँच करें", navDemo: "Live Shield", navReports: "समुदाय", language: "English",
        scan: "जाँच", analyze: "अभी जाँचें", analyzing: "Signals जाँच रहे हैं…", paste: "Message, link या page text paste करें", privacy: "आपका text analyze होता है और save नहीं किया जाता।", disclaimer: "TrustLens risk guidance देता है, legal या financial advice नहीं।",
        why: "क्यों flag हुआ", advice: "अब क्या करें", anatomy: "Scam की चाल", rules: "Rule engine", hybrid: "Hybrid analysis", alert: "Family member को alert करें", showAll: "सभी कारण दिखाएँ", safe: "Safe लग रहा है", pushy: "Pushy", deceptive: "Deceptive", scam: "Likely scam", manipulation: "Manipulation score", fraud: "Fraud risk score", evidence: "Evidence", community: "Community reports", report: "Suspicious item report करें", submit: "Report जोड़ें", noReports: "अभी कोई report नहीं। पहली report करके किसी और की मदद करें।",
    },
};
