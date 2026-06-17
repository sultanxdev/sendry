import { cn } from "../../lib/utils";

export function Button({ className, variant = "default", size = "default", children, ...props }) {
    const variants = {
        default: "bg-[#222026] text-white hover:bg-[#34323a] active:scale-[0.99] shadow-sm shadow-slate-200",
        destructive: "bg-red-650 text-white hover:bg-red-700 active:scale-[0.99]",
        outline: "border border-[#EBEBEB] bg-white text-[#222026] hover:bg-slate-50",
        secondary: "bg-[#A8DFF8] text-[#222026] hover:bg-[#91d3f0] active:scale-[0.99]",
        accent: "bg-[#A7E46A] text-[#222026] hover:bg-[#96d859] active:scale-[0.99]",
        ghost: "bg-transparent text-[#222026] hover:bg-[#EBEBEB]/50",
        link: "text-[#222026] underline-offset-4 hover:underline bg-transparent",
    };

    const sizes = {
        default: "h-11 px-6 py-2.5 rounded-full font-bold text-sm",
        sm: "h-9 px-4 rounded-full font-bold text-xs",
        lg: "h-13 px-8 rounded-full font-bold text-base",
        icon: "h-11 w-11 rounded-full flex items-center justify-center",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#A7E46A] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-none cursor-pointer",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
