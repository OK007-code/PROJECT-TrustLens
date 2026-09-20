#🛡️ TrustLens
> Detect manipulation before the user clicks pay.

TrustLens is a browser-based safety assistant that helps users identify online manipulation, dark patterns, phishing attempts, scam websites, suspicious messages, and risky payment requests before they result in financial loss or privacy compromise.

Unlike traditional security tools that focus primarily on malware and malicious URLs, TrustLens focuses on the **human manipulation layer** of cybercrime. It detects deceptive design techniques, fraudulent content, and scam indicators in real time and explains risks in clear, understandable language.

---

## 🚀 Overview
Online scams rarely begin with malicious code. Most begin with manipulation.
Websites and messages often create:

* False urgency
* Fake scarcity
* Emotional pressure
* Hidden costs
* Deceptive subscription flows
* Fake banking alerts
* Payment scams
* Credential theft attempts

TrustLens identifies these signals and warns users before they make risky decisions.
The platform combines:

* Dark Pattern Detection
* Scam Website Analysis
* Suspicious Message Classification
* Payment Risk Assessment
* Explainable AI-based Risk Alerts

into a single browser extension.

---

## 🎯 Problem Statement
Modern scams exploit human psychology rather than technical vulnerabilities.
Common examples include:

* Fake countdown timers
* "Only 2 left" scarcity tactics
* Confirmshaming
* Hidden cancellation options
* Fake KYC verification pages
* Courier and electricity bill scams
* Digital arrest scams
* UPI collect-request fraud
* Job scams requiring registration fees

Most existing tools focus on malware and malicious links, leaving users vulnerable to manipulation techniques that influence decision-making.

---

## 💡 Proposed Solution
TrustLens is a Chrome Extension that evaluates web pages and messages in real time and provides users with clear, actionable explanations.

### Risk Scores

| Score              | Description                                                                         
| ------------------ | ------------------------------------------------------------------------------
| Manipulation Score | Measures pressure, deception, urgency, and coercive design techniques              | Fraud Risk Score   | Measures the likelihood of credential theft, financial fraud, or personal data      abuse |

### Verdict Categories
Safe → Pushy → Deceptive → Likely Scam

Users are shown exactly which signals triggered the warning, improving awareness and digital literacy.

---

## ✨ Key Features:

### 🔍 Dark Pattern Engine

Detects:

* Fake countdown timers
* Scarcity tactics
* Confirmshaming
* Pre-selected add-ons
* Hidden cancellation controls
* Misleading buttons
* Unclear pricing and subscriptions

### 🌐 Scam Website Detection

Checks for:

* Lookalike domains
* Punycode URLs
* Suspicious TLDs
* Domain inconsistencies
* Unsafe forms
* Missing business information
* Unrealistic discounts
* Risky payment methods

### 💬 Message Scanner

Classifies:

* KYC scams
* Fake bank alerts
* Digital arrest scams
* Fake courier notices
* Fake utility bill warnings
* Job scams
* UPI fraud messages

### 💳 Payment Guard

Displays a warning before payment submission when high-risk signals are detected.

### 👨‍👩‍👧 Guardian Mode (Planned)

Allows trusted family members to receive alerts when vulnerable users encounter high-risk scam pages.

---

## 🏗️ System Architecture:

### Frontend

* Chrome Extension (Manifest V3)
* JavaScript / TypeScript
* Browser Popup UI
* Risk Overlay Interface

### Detection Layer

* DOM Inspection
* Rule-Based Pattern Matching
* URL Analysis
* Message Classification

### Backend (Optional)

* Vercel Serverless Functions
* LLM-powered Analysis
* Supabase Threat Feed

---

## 🧠 Hybrid Detection Model
TrustLens follows a hybrid architecture:

1. Local rules handle obvious threats instantly.
2. AI models analyze ambiguous content.
3. The interface explains every decision.

This provides:

* Faster response times
* Reduced API costs
* Better transparency
* Improved user trust

---

## 🛠️ Technology Stack

| Component         | Technology                 |
| ----------------- | -------------------------- |
| Browser Extension | Chrome Manifest V3         |
| Frontend          | JavaScript / TypeScript    |
| Detection Engine  | DOM Analysis + Rule Engine |
| AI Layer          | LLM API                    |
| Backend           | Vercel Functions           |
| Database          | Supabase                   |
| UI                | Popup + Overlay            |

---

## 📂 Project Structure

text
trustlens/
├── extension/
│   ├── manifest.json
│   ├── background/
│   ├── content/
│   ├── popup/
│   └── rules/
├── backend/
├── demo-pages/
├── docs/
├── .env.example
├── package.json
└── README.md

---

## 🔒 Privacy Principles

TrustLens is designed with privacy-first principles:

* Local analysis whenever possible
* Minimal data transmission
* No collection of passwords or payment credentials
* Transparent AI usage
* User-controlled scanning options

---

## ⚠️ Limitations
TrustLens is a warning system, not a guarantee of safety.
The platform may:

* Miss previously unseen scam techniques
* Produce false positives
* Misclassify ambiguous content

Users should always independently verify payment requests, domains, and official communications.

---

## 🗺️ Roadmap:

### Current Prototype

* Chrome Extension Skeleton
* Dark Pattern Detection
* Scam Signal Analysis
* Message Scanner
* Risk Dashboard
* Demo Environment

### Future Releases

* Guardian Mode
* Community Threat Feed
* Firefox & Edge Support
* Mobile Integration
* WhatsApp & SMS Analysis
* Multilingual Scam Detection
* Voice Scam Detection
* Scam Reporting Dashboard

---

## 💼 Business Potential

Potential expansion opportunities include:

* Freemium Browser Protection
* Family Safety Plans
* School & Organization Dashboards
* Threat Intelligence APIs
* Banking & Fintech Partnerships
* Senior Citizen Digital Safety Programs

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Add tests
4. Document new detection rules
5. Open a pull request

---

## 📬 Contact

For collaboration, responsible disclosure, or project discussions, please open an issue in this repository.

---

### 🛡️ TrustLens

**Making the internet safer, one decision at a time.**
