import { cn } from "../../lib/utils";

export function Button({ className, variant = "default", size = "default", children, ...props }) {
    const variants = {
        default: "bg-[#0E1512] text-white hover:bg-[#11503F] active:scale-[0.99] border border-[#0E1512]",
        accent: "bg-[#1FD27A] text-[#0E1512] hover:bg-white active:scale-[0.99] border border-[#0E1512] font-bold",
        secondary: "bg-[#DCE7DF] text-[#0E1512] hover:bg-[#c9dcd0] active:scale-[0.99] border border-[#D9E1DB]",
        outline: "border border-[#D9E1DB] bg-white text-[#0E1512] hover:bg-[#F3F5F0]",
        destructive: "bg-[#D92D20] text-white hover:bg-[#b02217] active:scale-[0.99] border border-[#D92D20]",
        ghost: "bg-transparent text-[#0E1512] hover:bg-[#DCE7DF]/40",
        link: "text-[#0E1512] underline-offset-4 hover:underline bg-transparent",
    };

    const sizes = {
        default: "h-11 px-5 py-2.5 rounded-xl font-semibold text-sm",
        sm: "h-9 px-3.5 rounded-lg font-semibold text-xs",
        lg: "h-12 px-6 rounded-xl font-bold text-base",
        icon: "h-10 w-10 rounded-xl flex items-center justify-center p-0",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#1FD27A] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer font-sans",
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

export default Button;
