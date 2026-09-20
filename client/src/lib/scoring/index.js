export function scoreLabel(score) {
    if (score >= 72)
        return "high";
    if (score >= 45)
        return "medium";
    if (score >= 20)
        return "low";
    return "minimal";
}
export function dominantTactic(reasons) {
    return reasons[0]?.tactic ?? "No strong signal";
}
export function verdictColor(verdict) {
    return { safe: "teal", pushy: "amber", deceptive: "orange", scam: "red" }[verdict];
}
