export const BRANDS = [
    "hdfc", "sbi", "icici", "axis", "kotak", "paytm", "phonepe", "googlepay", "gpay", "amazon", "flipkart", "myntra", "meesho", "irctc", "india post", "indiapost", "fedex", "dhl", "bluedart", "swiggy", "zomato", "jio", "airtel", "vi", "lic", "uidai", "income tax", "passport seva", "netflix", "whatsapp",
];
export const SUSPICIOUS_TLDS = [".xyz", ".top", ".click", ".icu", ".vip", ".live", ".buzz", ".work", ".fit"];
export const URL_SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy", "shorturl.at"];
export const KEYWORDS = {
    urgency: ["24 hours", "24 hrs", "immediately", "urgent", "last chance", "act now", "aaj hi", "abhi", "turant", "jaldi", "today only", "expire today"],
    authorityFear: ["account blocked", "account will be blocked", "kyc expired", "kyc suspend", "police", "cbi", "customs", "arrest", "digital arrest", "court case", "legal action", "income tax", "cyber cell", "parcel seized"],
    moneyAsk: ["registration fee", "processing fee", "verification fee", "pay to receive", "gift card", "crypto", "deposit", "refundable fee", "upi collect", "send money", "pay rs", "pay ₹"],
    tooGood: ["70% off", "80% off", "90% off", "earn rs 5000/day", "earn ₹5000/day", "work from home", "guaranteed returns", "double your money", "free iphone", "lucky winner", "congratulations you won", "cashback of rs"],
    credentials: ["otp", "one time password", "pin", "upi pin", "cvv", "card number", "aadhaar", "aadhar", "pan card", "bank details", "netbanking password", "login password"],
    tricks: ["enter your pin to receive", "receive money", "collect request", "task completion", "review and earn", "electricity will be disconnected", "bill overdue", "lottery", "prize", "job offer", "registration fee"],
};
export const SAMPLE_INPUTS = [
    {
        id: "kyc-sms",
        label: "KYC expiry SMS",
        kind: "message",
        preview: "Your SBI KYC has expired. Update within 24 hours to avoid account block.",
        value: "URGENT: Your SBI KYC has expired. Update within 24 hours or your account will be blocked. Share your OTP and PAN at https://sbi-kyc-update.xyz to avoid police action. - SBI Team",
    },
    {
        id: "digital-arrest",
        label: "Digital arrest call",
        kind: "message",
        preview: "CBI says your parcel is linked to a case. Stay on video call.",
        value: "This is CBI cyber cell. Your Aadhaar is linked to an illegal parcel. You are under digital arrest. Do not disconnect this call. Pay the verification fee immediately to avoid arrest.",
    },
    {
        id: "job-offer",
        label: "Fake job offer",
        kind: "message",
        preview: "Earn ₹5000/day from home after a small registration fee.",
        value: "Congratulations! You are selected for a work from home job. Earn Rs 5000/day guaranteed. Pay a refundable registration fee of Rs 499 today to start. Review 10 products and withdraw your salary.",
    },
    {
        id: "fake-shop",
        label: "Fake shop link",
        kind: "link",
        preview: "A lookalike Flipkart domain with a 90% off offer.",
        value: "https://flipkart-sale-90-off.top/checkout?gift=iphone",
    },
    {
        id: "pushy-checkout",
        label: "Pushy checkout",
        kind: "page",
        preview: "A countdown, tiny cancellation link, and preselected insurance.",
        value: "FLASH SALE — only 2 left! Offer ends in 09:47. 12 people are viewing this item. Add secure delivery insurance ₹199 (selected). No, I don't want to save money. Cancel subscription is in tiny grey text below the pay button. Final price: ₹1,299 + platform fee ₹249.",
    },
];
export const COMMUNITY_SEED = [
    { id: "seed-1", type: "Digital arrest", title: "Caller claimed to be from CBI and demanded a transfer", detail: "Reported by a TrustLens community member", severity: "scam", createdAt: "Today" },
    { id: "seed-2", type: "Fake KYC", title: "Message asked for OTP on an SBI lookalike link", detail: "Reported by a TrustLens community member", severity: "scam", createdAt: "Yesterday" },
    { id: "seed-3", type: "Job fraud", title: "Work-from-home offer required a registration fee", detail: "Reported by a TrustLens community member", severity: "deceptive", createdAt: "2 days ago" },
];
export const DEMO_SITES = [
    {
        id: "shop",
        name: "DealKart",
        url: "dealkart-flash.top",
        eyebrow: "Limited-time offer",
        title: "Save big before the timer runs out",
        body: "Wireless earbuds with free delivery and an exclusive member price.",
        price: "₹799",
        original: "₹3,999",
        elements: [
            { id: "timer", label: "Fake countdown timer", text: "Offer ends in 09:47", category: "dark_pattern", tactic: "False urgency", severity: "high" },
            { id: "scarcity", label: "Fake scarcity", text: "Only 2 left — 12 people are viewing", category: "dark_pattern", tactic: "Scarcity pressure", severity: "medium" },
            { id: "insurance", label: "Pre-ticked add-on", text: "✓ Add protection cover ₹199", category: "dark_pattern", tactic: "Sneaked cost", severity: "medium" },
        ],
    },
    {
        id: "bank",
        name: "SBI Secure",
        url: "sbi-kyc-verify.xyz",
        eyebrow: "Secure customer verification",
        title: "Update your KYC to keep banking",
        body: "Your account access may be restricted. Verify your details now to prevent interruption.",
        price: "",
        original: "",
        elements: [
            { id: "domain", label: "Lookalike domain", text: "sbi-kyc-verify.xyz", category: "scam", tactic: "Impersonation", severity: "high" },
            { id: "threat", label: "Authority threat", text: "Account access may be restricted", category: "scam", tactic: "Fear + authority", severity: "high" },
            { id: "otp", label: "Credential request", text: "Enter OTP to continue", category: "scam", tactic: "Credential theft", severity: "high" },
        ],
    },
    {
        id: "job",
        name: "QuickHire India",
        url: "quickhire-careers.work",
        eyebrow: "You have been shortlisted",
        title: "Earn from home with flexible tasks",
        body: "Complete simple reviews and unlock daily payouts after verification.",
        price: "₹499 registration",
        original: "",
        elements: [
            { id: "guarantee", label: "Guaranteed earnings", text: "Earn ₹5,000/day guaranteed", category: "scam", tactic: "Greed", severity: "high" },
            { id: "fee", label: "Upfront fee", text: "Pay ₹499 registration fee", category: "scam", tactic: "Advance-fee fraud", severity: "high" },
            { id: "task", label: "Task trap", text: "Review products to withdraw", category: "scam", tactic: "Task scam", severity: "medium" },
        ],
    },
];
