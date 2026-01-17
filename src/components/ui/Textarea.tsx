import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export function Textarea({ label, className = "", ...props }: TextareaProps) {
    return (
        <div className="space-y-1 h-full flex flex-col">
            {label && (
                <label className="block text-sm font-medium text-gray-300">
                    {label}
                </label>
            )}
            <textarea
                className={`w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all ${className}`}
                {...props}
            />
        </div>
    );
}
