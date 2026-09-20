import { describe, expect, it } from "vitest";
import { analyzeInput, highlightEvidence } from "./engine";
describe("TrustLens rule engine", () => {
    it("flags a lookalike bank URL and OTP request", () => {
        const result = analyzeInput("URGENT: SBI KYC expired. Share OTP at https://sbi-kyc-update.xyz", "message");
        expect(result.verdict).toBe("scam");
        expect(result.reasons.map((reason) => reason.id)).toEqual(expect.arrayContaining(["brand-sbi", "credentials", "urgency"]));
    });
    it("flags digital arrest authority language", () => {
        const result = analyzeInput("This is CBI. You are under digital arrest. Pay the verification fee immediately.");
        expect(result.fraudScore).toBeGreaterThan(50);
        expect(result.reasons.map((reason) => reason.id)).toEqual(expect.arrayContaining(["authority", "money"]));
    });
    it("flags task-based job fraud", () => {
        const result = analyzeInput("Earn Rs 5000/day guaranteed. Review products and pay a refundable registration fee.");
        expect(result.verdict).toBe("scam");
        expect(result.reasons.map((reason) => reason.id)).toEqual(expect.arrayContaining(["too-good", "money", "trick"]));
    });
    it("flags UPI collect-request credential tricks", () => {
        const result = analyzeInput("Enter your UPI PIN to receive money from this collect request.");
        expect(result.reasons.map((reason) => reason.id)).toEqual(expect.arrayContaining(["credentials", "trick"]));
    });
    it("flags dark patterns in checkout copy", () => {
        const result = analyzeInput("Only 2 left. Offer ends in 09:47. Add protection selected. Final price + platform fee.", "page");
        expect(result.manipulationScore).toBeGreaterThan(45);
        expect(result.reasons.map((reason) => reason.id)).toEqual(expect.arrayContaining(["countdown", "scarcity", "preticked", "drip-pricing"]));
    });
    it("recognises a normal message as safe", () => {
        const result = analyzeInput("Your appointment with Dr Mehta is tomorrow at 10 AM. Reply YES to confirm.");
        expect(result.verdict).toBe("safe");
        expect(result.reasons).toHaveLength(0);
    });
    it("does not allow evidence highlighting to invent a phrase", () => {
        const parts = highlightEvidence("Please update your profile from the official app.", "OTP");
        expect(parts.every((part) => !part.match)).toBe(true);
    });
    it("limits very long inputs", () => {
        const result = analyzeInput("a".repeat(6000));
        expect(result.input.length).toBe(5000);
    });
});
