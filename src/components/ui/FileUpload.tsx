"use client";

import { ChangeEvent, useState } from "react";
import { Upload, Loader2, FileType } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
    onFileSelect: (file: File) => Promise<void>;
    isLoading?: boolean;
}

export function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setFileName(file.name);
        await onFileSelect(file);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`relative group w-full h-32 border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden
          ${isDragOver
                        ? "border-blue-400 bg-blue-400/10"
                        : "border-white/20 hover:border-blue-400/50 hover:bg-white/5"
                    }
        `}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isLoading}
                />

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center gap-2 text-blue-300"
                        >
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-sm font-medium">Extracting text...</span>
                        </motion.div>
                    ) : fileName ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center gap-2 text-emerald-400"
                        >
                            <FileType className="w-8 h-8" />
                            <span className="text-sm font-medium">{fileName}</span>
                            <span className="text-xs text-emerald-400/70">Click or drop to replace</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-300 transition-colors"
                        >
                            <Upload className="w-8 h-8 mb-1" />
                            <span className="text-sm font-medium">Upload Base Resume</span>
                            <span className="text-xs text-gray-500 group-hover:text-blue-300/70">PDF or TXT (Max 5MB)</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
