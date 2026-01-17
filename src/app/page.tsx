"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Wand2, Mail } from "lucide-react";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import jsPDF from "jspdf";

export default function Home() {
    const [jobDescription, setJobDescription] = useState("");
    const [baseResume, setBaseResume] = useState("");
    const [targetEmail, setTargetEmail] = useState("");
    const [tailoredResume, setTailoredResume] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [isTailoring, setIsTailoring] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);

    const handleFileSelect = async (file: File) => {
        setIsExtracting(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/parse-resume", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.text) {
                setBaseResume(data.text);
            } else {
                alert("Failed to extract text: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error parsing resume:", error);
            alert("Error parsing resume");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleTailor = async () => {
        setIsTailoring(true);
        try {
            const response = await fetch("/api/tailor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ baseResume, jobDescription }),
            });
            const data = await response.json();
            if (data.tailoredResume) {
                setTailoredResume(data.tailoredResume);
                setCoverLetter(data.coverLetter || "");
            } else {
                alert("Failed to tailor resume: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error tailoring resume:", error);
            alert("Error tailoring resume");
        } finally {
            setIsTailoring(false);
        }
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            // Generate PDF for Resume
            const doc = new jsPDF();

            // Add resume content to PDF (basic text wrapping)
            const splitText = doc.splitTextToSize(tailoredResume, 180);
            let y = 10;
            const lineHeight = 7;
            const pageHeight = doc.internal.pageSize.height;

            splitText.forEach((line: string) => {
                if (y > pageHeight - 10) {
                    doc.addPage();
                    y = 10;
                }
                doc.text(line, 10, y);
                y += lineHeight;
            });

            const pdfBase64 = doc.output("datauristring").split(",")[1];

            // Generate PDF for Cover Letter
            const docCover = new jsPDF();
            const splitCover = docCover.splitTextToSize(coverLetter, 180);
            let yCover = 10;

            splitCover.forEach((line: string) => {
                if (yCover > pageHeight - 10) {
                    docCover.addPage();
                    yCover = 10;
                }
                docCover.text(line, 10, yCover);
                yCover += lineHeight;
            });
            const coverLetterPdfBase64 = docCover.output("datauristring").split(",")[1];


            const response = await fetch("/api/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetEmail,
                    subject: "Job Application",
                    emailBody: coverLetter,
                    pdfBase64: pdfBase64,
                    filename: "Tailored_Resume.pdf",
                    coverLetterPdfBase64: coverLetterPdfBase64,
                    coverLetterFilename: "Cover_Letter.pdf"
                }),
            });
            const data = await response.json();
            if (data.success) {
                alert("Email sent successfully!");
            } else {
                alert("Failed to send email: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Error sending email");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-4 pt-12"
                >
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Resume Automation
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Tailor your resume instantly with AI and send it to recruiters in seconds.
                    </p>
                </motion.section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        <Card
                            delay={0.2}
                            title="Inputs"
                            icon={<FileText className="text-blue-400" />}
                            className="space-y-4"
                        >
                            <div className="space-y-4">
                                <FileUpload
                                    onFileSelect={handleFileSelect}
                                    isLoading={isExtracting}
                                />
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-[#1f2937] px-2 text-gray-500">Or paste text</span>
                                    </div>
                                </div>
                                <Textarea
                                    label="Job Description"
                                    placeholder="Paste the job description here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="h-40"
                                />

                                <Textarea
                                    label="Your Base Resume"
                                    placeholder="Paste your base resume content in Markdown or Plain Text..."
                                    value={baseResume}
                                    onChange={(e) => setBaseResume(e.target.value)}
                                    className="h-60 font-mono text-sm"
                                />

                                <Input
                                    label="Recruiter's Email"
                                    placeholder="recruiter@company.com"
                                    type="email"
                                    value={targetEmail}
                                    onChange={(e) => setTargetEmail(e.target.value)}
                                />
                            </div>
                        </Card>

                        <Button
                            className="w-full"
                            onClick={handleTailor}
                            disabled={isTailoring || !jobDescription || !baseResume}
                            isLoading={isTailoring}
                            variant="primary"
                        >
                            <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Tailor Resume with AI
                        </Button>
                    </div>

                    {/* Right Column: Preview & Action */}
                    <div className="space-y-6 h-full flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl flex-1 flex flex-col min-h-[600px] space-y-4">
                                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="text-emerald-400" />
                                    Tailored Output
                                </h2>

                                <div className="flex-1 flex flex-col space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Resume Content</label>
                                    <Textarea
                                        placeholder="Your tailored resume will appear here..."
                                        value={tailoredResume}
                                        onChange={(e) => setTailoredResume(e.target.value)}
                                        className="flex-1 bg-white text-gray-900 shadow-inner font-mono text-sm rounded-xl border-none focus:ring-emerald-500/50 min-h-[400px]"
                                        style={{ backgroundColor: "white", color: "black" }}
                                    />
                                </div>

                                <div className="flex-col space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Email Summary (Cover Letter)</label>
                                    <Textarea
                                        placeholder="Email summary will appear here..."
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        className="h-40 bg-white text-gray-900 shadow-inner font-sans text-sm rounded-xl border-none focus:ring-emerald-500/50"
                                        style={{ backgroundColor: "white", color: "black" }}
                                    />
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <Button
                                        className="w-full"
                                        variant="secondary"
                                        onClick={handleSend}
                                        disabled={isSending || !tailoredResume || !targetEmail}
                                        isLoading={isSending}
                                    >
                                        <Mail className="w-5 h-5" />
                                        Send Application with PDF
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
