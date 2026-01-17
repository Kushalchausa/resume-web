import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-300">
                    {label}
                </label>
            )}
            <input
                className={`w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${className}`}
                {...props}
            />
        </div>
    );
}
