import { describe, expect, it } from "vitest";
import { invokeLLM } from "./_core/llm.js";
describe("server-side LLM configuration", () => {
    it("can make a lightweight completion without exposing credentials", async () => {
        if (!process.env.LLM_API_KEY && !process.env.BUILT_IN_FORGE_API_KEY)
            return;
        const response = await invokeLLM({
            messages: [
                { role: "system", content: "Return only the word OK." },
                { role: "user", content: "Health check" },
            ],
        });
        expect(response.choices?.[0]?.message?.content).toBeTruthy();
    }, 15000);
});
