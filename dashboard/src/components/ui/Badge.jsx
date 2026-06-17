import { cn } from "../../lib/utils";

export function Badge({ className, variant = "default", children, ...props }) {
    const variants = {
        default: "bg-[#222026] text-white border-transparent",
        secondary: "bg-[#A8DFF8]/20 text-[#222026] border-[#A8DFF8]/30",
        destructive: "bg-red-500/10 text-red-600 border-red-500/25",
        outline: "text-slate-600 border-[#EBEBEB] bg-white",
        success: "bg-[#A7E46A]/20 text-slate-800 border-[#A7E46A]/30",
        warning: "bg-yellow-500/10 text-yellow-755 border-yellow-500/25",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors select-none",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
