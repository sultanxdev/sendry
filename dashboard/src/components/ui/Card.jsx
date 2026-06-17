import { cn } from "../../lib/utils";

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-white border border-[#EBEBEB] rounded-3xl shadow-lg shadow-slate-200/40 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60",
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
            className={cn("flex flex-col gap-1.5 p-6", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }) {
    return (
        <h3
            className={cn("text-xl font-bold tracking-tight text-[#222026] m-0", className)}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardDescription({ className, children, ...props }) {
    return (
        <p
            className={cn("text-sm text-slate-500 m-0", className)}
            {...props}
        >
            {children}
        </p>
    );
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={cn("p-6 pt-0", className)} {...props}>
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
