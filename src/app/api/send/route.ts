import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const { targetEmail, subject, emailBody, pdfBase64, filename, coverLetterPdfBase64, coverLetterFilename } = await req.json();

        if (!targetEmail || !pdfBase64) {
            return NextResponse.json(
                { error: "Missing target email or PDF attachment" },
                { status: 400 }
            );
        }

        // Clean up the password (remove spaces if copied directly from Google)
        const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: pass,
            },
        });

        // Verify connection configuration
        try {
            await new Promise((resolve, reject) => {
                transporter.verify(function (error, success) {
                    if (error) {
                        console.error("SMTP Verify Error:", error);
                        reject(error);
                    } else {
                        console.log("Server is ready to take our messages");
                        resolve(success);
                    }
                });
            });
        } catch (verifyError) {
            console.error("SMTP Connection Failed:", verifyError);
            return NextResponse.json(
                { error: `SMTP Connection Failed: ${(verifyError as Error).message}` },
                { status: 500 }
            );
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

        return NextResponse.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: `Failed to send email: ${(error as Error).message}` },
            { status: 500 }
        );
    }
}
