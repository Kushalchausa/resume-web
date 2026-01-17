import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: ReactNode;
    icon?: ReactNode;
    delay?: number;
}

export function Card({ children, className = "", title, icon, delay = 0 }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className={`bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl ${className}`}
        >
            {(title || icon) && (
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    {icon}
                    {title}
                </h2>
            )}
            {children}
        </motion.div>
    );
}
