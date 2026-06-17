import { cn } from "../../lib/utils";

export function Input({ className, type = "text", ...props }) {
    return (
        <input
            type={type}
            className={cn(
                "flex h-11 w-full rounded-xl border border-[#EBEBEB] bg-slate-50 px-4 py-2.5 text-sm text-[#222026] placeholder-slate-400 transition-all focus:border-[#222026] focus:ring-1 focus:ring-[#222026] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}
