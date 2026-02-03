export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addEntry } from "@/lib/db";
import { Status } from "@prisma/client";

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

/**
 * Helper to try and hint the company/role from JD text (Very Naive)
 */
function extractMetaFromJD(jd: string) {
    // Naive heuristic: First line often contains title/company
    const firstLine = jd.split('\n')[0].substring(0, 50);
    return {
        jobTitle: firstLine || 'Software Engineer',
        company: 'Unknown Company' // hard to extract reliably without LLM, keeping simple
    };
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
You are an expert resume writer.

JOB DESCRIPTION:
${jobDescription}

BASE RESUME:
${baseResume}

TASK:
Generate a clean, ATS-friendly resume in PLAIN TEXT ONLY — no markdown symbols, no bullets like "• --", no asterisks, no decorative characters.

STRICT RULES:
- Do NOT generate any divider lines such as "• --" or "---".
- Do NOT use asterisks (*) anywhere.
- Do NOT use markdown bold (**text**).
- Do NOT wrap section titles in markdown (#, ##, ###).
- Do NOT prefix headings like "2026*" with an asterisk.
- Use ONLY hyphens "-" for bullet points.
- Job title, project title, and college name MUST NOT have any bullets or symbols before or after.
- Output clean plain text with proper line spacing, like this:

PROFESSIONAL EXPERIENCE
Junior Software Engineer, LLUMO AI
June 2025 – Present
- Bullet point
- Bullet point

PROJECTS
Resume Web (2026)
- Bullet point

EDUCATION
Pranveer Singh Institute of Technology
Master of Computer Applications (CGPA: 8.2)
2025 | Kanpur, India

OUTPUT FORMAT:
{
  "resume": "<clean plain text resume>",
  "coverLetter": "<plain text>"
}

ESCAPE:
- Escape all newlines with \\n
- Escape all quotes
- No markdown, no code fences, no extra formatting.
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

        // --- SAVE TO HISTORY DB ---
        const meta = extractMetaFromJD(jobDescription);
        const entry = await addEntry({
            jobTitle: meta.jobTitle,
            company: meta.company,
            status: Status.PENDING,
            resumePreview: parsed.resume.substring(0, 200) + '...',
            fullResume: parsed.resume,
            coverLetter: parsed.coverLetter,
            jobDescription: jobDescription
        });

        return NextResponse.json({
            tailoredResume: parsed.resume,
            coverLetter: parsed.coverLetter,
            entryId: entry.id // Return ID so frontend can update to 'Sent' later
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
