import { cn } from "../../lib/utils";

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-white border border-[#D9E1DB] rounded-2xl shadow-sm overflow-hidden transition-all duration-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }) {
    return (
        <div
            className={cn("flex flex-col gap-1 p-6 border-b border-[#D9E1DB]/50", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }) {
    return (
        <h3
            className={cn("text-lg font-bold tracking-tight text-[#0E1512] font-['Bricolage_Grotesque',sans-serif] m-0", className)}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardDescription({ className, children, ...props }) {
    return (
        <p
            className={cn("text-xs text-slate-500 font-medium m-0", className)}
            {...props}
        >
            {children}
        </p>
    );
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={cn("p-6", className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className, children, ...props }) {
    return (
        <div
            className={cn("flex items-center p-6 pt-0", className)}
            {...props}
        >
            {children}
        </div>
    );
}
