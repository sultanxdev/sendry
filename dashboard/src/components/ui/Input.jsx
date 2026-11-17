import { cn } from "../../lib/utils";

export function Input({ className, type = "text", ...props }) {
    return (
        <input
            type={type}
            className={cn(
                "flex h-11 w-full rounded-xl border border-[#D9E1DB] bg-white px-4 py-2.5 text-sm text-[#0E1512] placeholder-slate-400 transition-all focus:border-[#0E1512] focus:ring-2 focus:ring-[#1FD27A]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}

export default Input;
