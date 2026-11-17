import { cn } from "../../lib/utils";

export function Badge({ className, variant = "default", children, ...props }) {
    const variants = {
        default: "bg-[#0E1512] text-white border-[#0E1512]",
        secondary: "bg-[#DCE7DF] text-[#0E1512] border-[#D9E1DB]",
        destructive: "bg-[#D92D20]/15 text-[#D92D20] border-[#D92D20]/30",
        outline: "text-slate-600 border-[#D9E1DB] bg-white",
        success: "bg-[#1FD27A]/20 text-[#0B3B2E] border-[#1FD27A]/40",
        warning: "bg-[#F2B233]/20 text-[#8F5B00] border-[#F2B233]/40",
        live: "bg-[#1FD27A] text-[#0E1512] border-transparent font-bold",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-semibold select-none",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

export default Badge;
