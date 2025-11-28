import React from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export function Button({ className, variant = 'primary', size = 'md', isLoading, children, ...props }: ButtonProps) {
    const variants = {
        primary: "bg-neural-600 hover:bg-neural-500 text-white shadow-lg shadow-neural-500/20",
        secondary: "bg-void-800 hover:bg-void-700 text-neural-100 border border-neural-700/50",
        ghost: "bg-transparent hover:bg-white/5 text-neural-300 hover:text-white",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base"
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}

// --- CARD ---
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("glass-card rounded-2xl p-6", className)} {...props}>
            {children}
        </div>
    );
}

// --- PROGRESS BAR ---
export function ProgressBar({ progress, className }: { progress: number, className?: string }) {
    return (
        <div className={cn("h-2 w-full bg-void-900 rounded-full overflow-hidden", className)}>
            <div
                className="h-full bg-gradient-to-r from-neural-600 to-synapse-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
        </div>
    );
}
