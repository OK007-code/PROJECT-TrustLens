import { analyzeInput, verdictFor } from "../../client/src/lib/rules/engine.js";

const PARKING_MARKERS = [
  "ready for development",
  "domain is for sale",
  "domain for sale",
  "check availability for customer use",
  "development opportunities",
  "buy this domain",
  "this domain is parked",
];

function hasReason(result, id) {
  return result.reasons.some((reason) => reason.id === id);
}

export function analyzeForExtension(input, kind = "page", location = globalThis.location) {
  const result = analyzeInput(input, kind);
  const normalized = String(input).toLocaleLowerCase();

  if (location?.protocol === "http:" && !hasReason(result, "extension-insecure-http")) {
    result.reasons.push({
      id: "extension-insecure-http",
      category: "scam",
      tactic: "Insecure HTTP page",
      evidence: "http://",
      severity: "high",
      weight: 18,
      explanation: "This page is not using HTTPS. Do not enter passwords, payment details, or identity documents here.",
      explanation_hi: "यह page HTTPS का उपयोग नहीं कर रहा है। यहाँ password, payment या identity details enter न करें।",
    });
  }

  if (kind === "page" && PARKING_MARKERS.some((marker) => normalized.includes(marker)) && !hasReason(result, "extension-domain-parking")) {
    result.reasons.push({
      id: "extension-domain-parking",
      category: "scam",
      tactic: "Domain parking / placeholder site",
      evidence: PARKING_MARKERS.find((marker) => normalized.includes(marker)) || "domain",
      severity: "high",
      weight: 30,
      explanation: "This looks like a parked or placeholder domain, not a normal service website. Treat requests from it as unsafe.",
      explanation_hi: "यह parked या placeholder domain जैसा दिखता है, normal service website जैसा नहीं। इससे आने वाली requests को unsafe मानें।",
    });
  }

  const manipulationScore = Math.min(100, Math.round(result.reasons.filter((reason) => reason.category === "dark_pattern").reduce((total, reason) => total + reason.weight, 0) * 1.8));
  const fraudScore = Math.min(100, Math.round(result.reasons.filter((reason) => reason.category === "scam").reduce((total, reason) => total + reason.weight, 0) * 1.55));
  return { ...result, manipulationScore, fraudScore, verdict: verdictFor(manipulationScore, fraudScore), source: "extension-rules" };
}
