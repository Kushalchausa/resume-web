import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { updateEntryStatus } from "@/lib/db";
import { Status } from "@prisma/client";

export async function POST(req: NextRequest) {
    let entryId: string | undefined;

    try {
        const body = await req.json();
        const { targetEmail, subject, emailBody, pdfBase64, filename, coverLetterPdfBase64, coverLetterFilename } = body;
        entryId = body.entryId;

        if (!targetEmail || !pdfBase64) {
            return NextResponse.json(
                { error: "Missing target email or PDF attachment" },
                { status: 400 }
            );
        }

        // Clean up the password (remove spaces if copied directly from Google)
        const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");

        // Helper to create and verify transporter
        const createAndVerify = async (port: number, secure: boolean) => {
             const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: port,
                secure: secure,
                auth: { user: process.env.SMTP_USER, pass: pass },
            });
            await new Promise((resolve, reject) => {
                transporter.verify((error, success) => error ? reject(error) : resolve(success));
            });
            return transporter;
        };

        let transporter;
        try {
            // Attempt 1: Use environment settings or default to Port 465 (SSL)
            const envPort = Number(process.env.SMTP_PORT) || 465;
            const envSecure = process.env.SMTP_SECURE === "true" || envPort === 465;
            transporter = await createAndVerify(envPort, envSecure);
        } catch (err1) {
            console.warn("Attempt 1 (Env/Default) failed. Retrying with Port 587 (STARTTLS)...", err1);
            try {
                // Attempt 2: Fallback to Port 587 (STARTTLS) - standard for Gmail
                transporter = await createAndVerify(587, false);
            } catch (err2) {
                console.error("Attempt 2 failed:", err2);
                if (entryId) await updateEntryStatus(entryId, Status.FAILURE);
                return NextResponse.json(
                    { error: `SMTP Connection Failed (Tried ports 465 & 587). Error: ${(err2 as Error).message}` },
                    { status: 500 }
                );
            }
        }

        const attachments = [
            {
                filename: filename || "Resume.pdf",
                content: pdfBase64,
                encoding: "base64",
            },
        ];

        if (coverLetterPdfBase64) {
            attachments.push({
                filename: coverLetterFilename || "CoverLetter.pdf",
                content: coverLetterPdfBase64,
                encoding: "base64",
            });
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: targetEmail,
            subject: subject || "Job Application",
            text: emailBody || "Please find attached my resume.",
            attachments: attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);

        if (entryId) {
            await updateEntryStatus(entryId, Status.SUCCESS);
        }

        return NextResponse.json({ success: true, messageId: info.messageId });
    } catch (error) {
        if (entryId) await updateEntryStatus(entryId, Status.FAILURE);
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: `Failed to send email: ${(error as Error).message}` },
            { status: 500 }
        );
    }
}
