import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { invokeLLM } from "./_core/llm.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { analyzeInput, mergeLlmResult } from "../client/src/lib/rules/engine.js";
import { z } from "zod";
const analyzeInputSchema = z.object({
    input: z.string().trim().min(1, "Please paste something to analyze.").max(5000, "Please keep the input under 5,000 characters."),
    kind: z.enum(["message", "link", "page"]).default("message"),
});
const rateWindow = new Map();
function canAnalyze(key) {
    const now = Date.now();
    const current = rateWindow.get(key);
    if (!current || current.resetAt < now) {
        rateWindow.set(key, { count: 1, resetAt: now + 60_000 });
        return true;
    }
    if (current.count >= 30)
        return false;
    current.count += 1;
    return true;
}
function extractContent(content) {
    if (typeof content === "string")
        return content;
    if (Array.isArray(content))
        return content.map((item) => typeof item === "object" && item && "text" in item ? String(item.text) : "").join(" ");
    return "";
}
async function addLlmNuance(ruleResult) {
    if (!process.env.LLM_API_KEY && !process.env.BUILT_IN_FORGE_API_KEY)
        return ruleResult;
    const system = "You are a consumer-fraud and dark-pattern analyst focused on India. Given the input and the rule-engine findings, return ONLY valid JSON matching the schema. Do not invent evidence. Quote exact suspicious phrases. Explain in simple language a 60-year-old would understand. Return both explanation_en and explanation_hi. If unsure, say so and lower confidence.";
    const user = JSON.stringify({
        input: ruleResult.input,
        kind: ruleResult.kind,
        rule_findings: ruleResult.reasons,
        schema: { manipulationScore: "number 0-100", fraudScore: "number 0-100", reasons: "array with category,tactic,evidence,severity,explanation,explanation_hi,weight", advice: "array of strings" },
    });
    try {
        const response = await Promise.race([
            invokeLLM({
                messages: [{ role: "system", content: system }, { role: "user", content: user }],
                response_format: { type: "json_schema", json_schema: { name: "trustlens_analysis", strict: true, schema: { type: "object", properties: { manipulationScore: { type: "number" }, fraudScore: { type: "number" }, reasons: { type: "array", items: { type: "object", properties: { category: { type: "string" }, tactic: { type: "string" }, evidence: { type: "string" }, severity: { type: "string" }, explanation: { type: "string" }, explanation_hi: { type: "string" }, weight: { type: "number" } }, required: ["category", "tactic", "evidence", "severity", "explanation", "explanation_hi", "weight"], additionalProperties: false } }, advice: { type: "array", items: { type: "string" } } }, required: ["manipulationScore", "fraudScore", "reasons", "advice"], additionalProperties: false } } },
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("LLM timeout")), 8000)),
        ]);
        const raw = extractContent(response.choices?.[0]?.message?.content);
        const parsed = JSON.parse(raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim());
        return mergeLlmResult(ruleResult, parsed);
    }
    catch (error) {
        console.warn("[TrustLens] LLM nuance unavailable; returning rule result", error instanceof Error ? error.message : error);
        return ruleResult;
    }
}
export const appRouter = router({
    system: systemRouter,
    auth: router({
        me: publicProcedure.query(opts => opts.ctx.user),
        logout: publicProcedure.mutation(({ ctx }) => {
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
            return { success: true };
        }),
    }),
    analyze: publicProcedure.input(analyzeInputSchema).mutation(async ({ input, ctx }) => {
        const key = ctx.req.ip ?? ctx.req.headers["x-forwarded-for"]?.toString() ?? "anonymous";
        if (!canAnalyze(key))
            throw new Error("Too many scans. Please wait a minute and try again.");
        const kind = input.kind;
        const rules = analyzeInput(input.input, kind);
        return addLlmNuance(rules);
    }),
});
