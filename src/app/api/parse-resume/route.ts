import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let text = "";

        if (file.type === "application/pdf") {
            text = await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser(null, 1);

                pdfParser.on("pdfParser_dataError", (errData: any) => {
                    reject(errData.parserError);
                });

                pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                    // generic raw text extract
                    const rawText = pdfParser.getRawTextContent();
                    resolve(rawText);
                });

                pdfParser.parseBuffer(buffer);
            });
        } else {
            // Fallback for plain text or unsupported types that might be text
            text = buffer.toString("utf-8");
        }

        // Cleanup: remove page breaks and excessive whitespace
        text = text.replace(/----------------Page \(\d+\) Break----------------/g, "\n");
        text = text.replace(/\n+/g, "\n").trim();

        return NextResponse.json({ text });
    } catch (error) {
        console.error("Error parsing resume:", error);
        return NextResponse.json(
            { error: "Failed to parse resume" },
            { status: 500 }
        );
    }
}
