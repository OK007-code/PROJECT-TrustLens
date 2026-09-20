import { BRANDS, KEYWORDS, SUSPICIOUS_TLDS, URL_SHORTENERS } from "../../data/trustlensData.js";
const clean = (value) => value.replace(/\s+/g, " ").trim();
const lower = (value) => value.toLocaleLowerCase("en-IN");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function findEvidence(input, terms) {
    const normalized = lower(input);
    for (const term of terms) {
        const index = normalized.indexOf(lower(term));
        if (index >= 0)
            return input.slice(index, index + term.length);
    }
    return undefined;
}
function addFinding(findings, id, category, tactic, evidence, severity, weight, explanation, explanation_hi) {
    if (!evidence || findings.some((finding) => finding.id === id))
        return;
    findings.push({ id, category, tactic, evidence: clean(evidence), severity, weight, explanation, explanation_hi });
}
function extractUrl(input) {
    const match = input.match(/(?:https?:\/\/)?(?:www\.)?[^\s]+\.[a-z]{2,}(?:\/[^\s]*)?/i);
    return match?.[0]?.replace(/[),.;]+$/, "") ?? (input.includes(".") ? input.trim() : "");
}
function analyzeUrl(input, findings) {
    const rawUrl = extractUrl(input);
    if (!rawUrl)
        return;
    const candidate = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    let url;
    try {
        url = new URL(candidate);
    }
    catch { /* message may only contain a fragment */ }
    const hostname = lower(url?.hostname ?? rawUrl.split("/")[0]);
    const full = lower(rawUrl);
    if (hostname.includes("xn--") || full.includes("%")) {
        addFinding(findings, "punycode", "scam", "Punycode / encoded domain", rawUrl, "high", 20, "This address uses an encoded domain that can visually imitate a trusted website.", "यह पता encoded domain का उपयोग करता है जो भरोसेमंद वेबसाइट जैसा दिख सकता है।");
    }
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        addFinding(findings, "ip-url", "scam", "IP address link", hostname, "high", 24, "Real customer-service sites normally use a recognisable domain, not a bare IP address.", "असली customer-service वेबसाइट आम तौर पर IP address के बजाय पहचाने जाने वाला domain इस्तेमाल करती है।");
    }
    if (!url || url.protocol !== "https:") {
        addFinding(findings, "no-https", "scam", "No secure connection", rawUrl, "medium", 12, "The link does not clearly use a secure HTTPS connection.", "यह लिंक सुरक्षित HTTPS connection का उपयोग नहीं कर रहा है।");
    }
    const hyphens = (hostname.match(/-/g) ?? []).length;
    const subdomains = hostname.split(".").length - 2;
    if (hyphens >= 2 || subdomains >= 3) {
        addFinding(findings, "weird-host", "scam", "Unusual domain structure", hostname, "medium", 16, "Extra hyphens or subdomains can be used to make an impersonation link look official.", "अतिरिक्त hyphens या subdomains impersonation link को official जैसा दिखाने के लिए इस्तेमाल हो सकते हैं।");
    }
    const tld = hostname.match(/\.[a-z]{2,}$/)?.[0] ?? "";
    if (SUSPICIOUS_TLDS.includes(tld)) {
        addFinding(findings, "suspicious-tld", "scam", "Suspicious domain ending", tld, "medium", 18, "This domain ending is common in disposable or low-trust sites. The ending alone is not proof, but it raises the risk.", "यह domain ending अस्थायी या कम-भरोसे वाली sites में आम है। अकेले इससे scam साबित नहीं होता, लेकिन risk बढ़ता है।");
    }
    const shortener = URL_SHORTENERS.find((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    if (shortener) {
        addFinding(findings, "shortener", "scam", "Shortened URL", shortener, "medium", 14, "A shortened link hides the destination, so verify it before opening or paying.", "Shortened link destination छुपाता है, इसलिए इसे खोलने या payment से पहले verify करें।");
    }
    for (const brand of BRANDS) {
        const compact = brand.replace(/\s/g, "");
        if (!hostname.includes(compact))
            continue;
        const officialish = hostname === `${compact}.com` || hostname.endsWith(`.${compact}.com`) || hostname.endsWith(`.${compact}.in`);
        const strange = !officialish && (hostname.includes("-") || !hostname.endsWith(".com") && !hostname.endsWith(".in"));
        if (strange) {
            addFinding(findings, `brand-${compact}`, "scam", "Lookalike brand domain", hostname, "critical", 32, `The address uses “${brand}” in a domain that does not look like the brand’s official website.`, `इस address में “${brand}” का नाम है, लेकिन domain उस brand की official website जैसा नहीं दिखता।`);
            break;
        }
    }
}
function analyzeText(input, findings) {
    const urgency = findEvidence(input, KEYWORDS.urgency);
    const authority = findEvidence(input, KEYWORDS.authorityFear);
    const money = findEvidence(input, KEYWORDS.moneyAsk);
    const tooGood = findEvidence(input, KEYWORDS.tooGood);
    const credentials = findEvidence(input, KEYWORDS.credentials);
    const tricks = findEvidence(input, KEYWORDS.tricks);
    addFinding(findings, "urgency", "dark_pattern", "Urgency pressure", urgency ?? "", "medium", 13, "Urgent wording rushes you so you have less time to verify the request.", "जल्दी करने वाला wording आपको verify करने के लिए कम समय देता है।");
    addFinding(findings, "authority", "scam", "Authority + fear", authority ?? "", "high", 22, "The sender uses fear or authority to make you obey before thinking.", "भेजने वाला डर या authority का इस्तेमाल करके आपको सोचने से पहले मानने पर मजबूर करता है।");
    addFinding(findings, "money", "scam", "Unexpected money request", money ?? "", "high", 24, "Upfront fees, gift cards, crypto, or collect requests are common scam payment paths.", "पहले पैसे, gift cards, crypto या collect request scam में आम payment रास्ते हैं।");
    addFinding(findings, "too-good", "scam", "Too-good-to-be-true promise", tooGood ?? "", "high", 20, "Guaranteed profit or unusually large rewards are a classic lure. Real opportunities explain risk and conditions.", "Guaranteed profit या बहुत बड़ा reward अक्सर लालच का जाल होता है। असली अवसर risk और conditions समझाते हैं।");
    addFinding(findings, "credentials", "scam", "Sensitive detail request", credentials ?? "", "critical", 30, "Never share OTP, PIN, CVV, Aadhaar, PAN, or passwords to receive money or fix an account.", "पैसे पाने या account ठीक करने के लिए OTP, PIN, CVV, Aadhaar, PAN या password कभी share न करें।");
    addFinding(findings, "trick", "scam", "Known scam script", tricks ?? "", "high", 22, "This phrase matches a script often used in task, courier, electricity, lottery, or UPI scams.", "यह phrase task, courier, electricity, lottery या UPI scam में अक्सर इस्तेमाल होने वाली script से मिलता है।");
}
function analyzeDarkPatterns(input, findings) {
    const patterns = [
        ["countdown", ["ends in", "offer ends", "timer", "minutes left", "seconds left"], "Fake countdown", "high", 18, "A countdown can manufacture pressure even when the offer may not really expire.", "Countdown ऐसा pressure बना सकता है जो असली expiry न होने पर भी आपको जल्दी कराए।"],
        ["scarcity", ["only 2 left", "only 1 left", "people are viewing", "left in stock", "limited stock"], "Fake scarcity", "medium", 13, "Scarcity claims can push you to buy before comparing or checking the seller.", "Scarcity claims आपको seller check या comparison किए बिना खरीदने के लिए push कर सकते हैं।"],
        ["confirmshaming", ["no, i don't want to save money", "no thanks, i hate saving", "i don't want"], "Confirmshaming", "medium", 12, "The page frames a normal refusal as foolish or wasteful to wear down your choice.", "Page सामान्य मना करने को मूर्खता जैसा दिखाकर आपका decision बदलने की कोशिश करता है।"],
        ["preticked", ["selected", "pre-selected", "add protection", "insurance", "secure delivery"], "Pre-ticked add-on", "medium", 14, "An extra product or fee should never be added by default without your clear choice.", "कोई extra product या fee आपकी साफ़ choice के बिना default में add नहीं होना चाहिए।"],
        ["drip-pricing", ["platform fee", "handling fee", "convenience fee", "extra fee", "+ ₹", "final price"], "Drip pricing", "high", 18, "Fees revealed late make the true price harder to compare.", "बाद में दिखने वाली fees असली price को compare करना मुश्किल बनाती हैं।"],
        ["cancel", ["tiny", "unsubscribe", "cancel subscription", "hidden", "grey text"], "Hidden cancellation", "medium", 15, "A tiny or hidden cancel path makes it harder to leave than to sign up.", "छोटा या छुपा cancel रास्ता sign up को आसान और छोड़ना मुश्किल बनाता है।"],
    ];
    const normalized = lower(input);
    for (const [id, terms, tactic, severity, weight, explanation, explanation_hi] of patterns) {
        const evidence = findEvidence(input, terms);
        if (evidence || (id === "preticked" && /selected|insurance/i.test(normalized))) {
            addFinding(findings, id, "dark_pattern", tactic, evidence ?? "selected", severity, weight, explanation, explanation_hi);
        }
    }
}
export function verdictFor(manipulationScore, fraudScore) {
    if (fraudScore >= 72 || manipulationScore >= 82)
        return "scam";
    if (fraudScore >= 45 || manipulationScore >= 58)
        return "deceptive";
    if (manipulationScore >= 25 || fraudScore >= 20)
        return "pushy";
    return "safe";
}
export function adviceFor(verdict, findings) {
    const advice = [
        "Pause. Do not click, pay, or share personal details while you verify.",
        "Open the official app or type the organisation’s website yourself instead of using this link.",
        "If money or credentials were shared, contact your bank immediately and report at 1930 (India’s cyber-fraud helpline).",
    ];
    if (verdict === "safe")
        return ["No strong manipulation signals were found. Still verify unexpected requests through an official channel.", "Keep software and browser warnings enabled."];
    if (findings.some((finding) => finding.id === "credentials"))
        advice.unshift("Never share OTP, UPI PIN, CVV, Aadhaar, PAN, or passwords. Banks and payment apps do not ask for them over calls or messages.");
    if (findings.some((finding) => finding.id === "money"))
        advice.unshift("Do not pay a registration, processing, verification, or release fee to receive money, a job, a parcel, or a prize.");
    return advice.slice(0, 4);
}
export function analyzeInput(input, kind = "message") {
    const safeInput = clean(input).slice(0, 5000);
    const findings = [];
    if (kind === "link" || /https?:\/\/|\b[a-z0-9-]+\.(?:com|in|org|xyz|top|click|icu)\b/i.test(safeInput))
        analyzeUrl(safeInput, findings);
    analyzeText(safeInput, findings);
    if (kind === "page" || findings.some((finding) => finding.category === "dark_pattern"))
        analyzeDarkPatterns(safeInput, findings);
    const manipulationScore = Math.min(100, Math.round(findings.filter((finding) => finding.category === "dark_pattern").reduce((total, finding) => total + finding.weight, 0) * 1.8));
    const fraudScore = Math.min(100, Math.round(findings.filter((finding) => finding.category === "scam").reduce((total, finding) => total + finding.weight, 0) * 1.55));
    const verdict = verdictFor(manipulationScore, fraudScore);
    return { manipulationScore, fraudScore, verdict, reasons: findings, advice: adviceFor(verdict, findings), input: safeInput, kind, source: "rules", analyzedAt: new Date().toISOString() };
}
export function mergeLlmResult(base, llm) {
    const normalizedReasons = Array.isArray(llm.reasons) ? llm.reasons.filter((reason) => reason && typeof reason.evidence === "string" && lower(base.input).includes(lower(reason.evidence))) : [];
    const reasons = normalizedReasons.length ? normalizedReasons.map((reason, index) => ({
        id: reason.id ?? `llm-${index}`,
        category: (reason.category === "dark_pattern" ? "dark_pattern" : "scam"),
        tactic: reason.tactic ?? "Suspicious tactic",
        evidence: reason.evidence,
        severity: (reason.severity ?? "medium"),
        explanation: reason.explanation ?? "This signal deserves a closer look.",
        explanation_hi: reason.explanation_hi ?? "इस signal को ध्यान से देखना चाहिए।",
        weight: Number(reason.weight ?? 10),
    })) : base.reasons;
    const manipulationScore = Math.max(0, Math.min(100, Number(llm.manipulationScore ?? base.manipulationScore)));
    const fraudScore = Math.max(0, Math.min(100, Number(llm.fraudScore ?? base.fraudScore)));
    const verdict = verdictFor(manipulationScore, fraudScore);
    return { ...base, manipulationScore, fraudScore, verdict, reasons, advice: Array.isArray(llm.advice) && llm.advice.length ? llm.advice.slice(0, 5) : base.advice, source: "hybrid" };
}
export function highlightEvidence(input, evidence) {
    if (!evidence)
        return [{ text: input, match: false }];
    const match = new RegExp(escapeRegExp(evidence), "ig").exec(input);
    if (!match || match.index === undefined)
        return [{ text: input, match: false }];
    return [
        { text: input.slice(0, match.index), match: false },
        { text: input.slice(match.index, match.index + match[0].length), match: true },
        { text: input.slice(match.index + match[0].length), match: false },
    ].filter((part) => part.text);
}
