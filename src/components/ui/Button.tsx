import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
    isLoading?: boolean;
    variant?: "primary" | "secondary" | "outline";
    children: ReactNode;
}

export function Button({
    children,
    isLoading,
    variant = "primary",
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-blue-500/25",
        secondary: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg hover:shadow-emerald-500/25",
        outline: "border-2 border-white/20 hover:bg-white/10 text-white"
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {children}
        </motion.button>
    );
}
