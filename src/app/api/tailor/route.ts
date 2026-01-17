export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Remove possible markdown fences that the LLM might add.
 */
function stripMarkdownFences(text: string): string {
    let cleaned = text.trim();
    // Remove markdown code blocks if present (standard or json-tagged)
    cleaned = cleaned.replace(/^```(json)?|```$/gi, "");

    // Attempt to extract the JSON object by finding the first '{' and last '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return cleaned;
}

/**
 * Simple exponential back‑off retry helper for network calls.
 */
async function retry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> {
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            // Only retry on network‑related errors
            if (err instanceof Error && /(ETIMEDOUT|ECONNREFUSED|fetch failed)/i.test(err.message)) {
                await new Promise((r) => setTimeout(r, delayMs * 2 ** i));
                continue;
            }
            throw err; // non‑retryable
        }
    }
    throw lastError;
}

export async function POST(req: NextRequest) {
    try {
        const { baseResume, jobDescription } = await req.json();

        if (!baseResume || !jobDescription) {
            return NextResponse.json(
                { error: "Missing `baseResume` or `jobDescription` in request body." },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your-gemini-api-key-here") {
            console.error("[tailor-resume] GEMINI_API_KEY missing or placeholder");
            return NextResponse.json(
                { error: "Server mis‑configuration: GEMINI_API_KEY not set." },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Use gemini-1.5-flash for speed and low cost, capable of JSON output
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
You are an expert resume writer and career coach.
Tailor a resume and write a short email cover‑letter summary based on the following job description.

JOB DESCRIPTION:
${jobDescription}

BASE RESUME:
${baseResume}

INSTRUCTIONS:
1. Produce a markdown‑formatted resume that highlights the most relevant experience, skills and achievements for the role.
2. Write a concise, professional email body (cover‑letter) addressed to the hiring manager, referencing the attached resume.

RETURN ONLY VALID JSON (no markdown fences) with this shape:
{
  "resume": "<markdown string>",
  "coverLetter": "<plain‑text email body>"
}
IMPORTANT: The 'resume' field must be a valid JSON string. Escape all newlines (\\n) and quotes (\\") properly.
`.trim();

        // Call Gemini (wrapped in retry for transient network errors)
        const result = await retry(() => model.generateContent(prompt));
        const rawContent = result.response.text();

        if (!rawContent) {
            throw new Error("Gemini returned an empty response.");
        }

        // Parse JSON
        let parsed;
        try {
            const cleaned = stripMarkdownFences(rawContent);
            parsed = JSON.parse(cleaned);
        } catch (jsonErr) {
            console.error("[tailor-resume] JSON parse error:", jsonErr, "\nRaw LLM output:", rawContent);
            return NextResponse.json(
                {
                    error: "Unable to parse Gemini response as JSON.",
                    rawResponse: rawContent,
                },
                { status: 500 }
            );
        }

        if (!parsed || !parsed.resume || !parsed.coverLetter) {
            console.error("[tailor-resume] Missing expected fields in response:", parsed);
            return NextResponse.json(
                {
                    error: "AI response missing 'resume' or 'coverLetter' fields.",
                    rawResponse: rawContent,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            tailoredResume: parsed.resume,
            coverLetter: parsed.coverLetter,
        });

    } catch (err: any) {
        console.error("[tailor-resume] Unexpected error:", err);
        return NextResponse.json(
            {
                error: err?.message ?? "Unknown server error",
            },
            { status: 500 }
        );
    }
}