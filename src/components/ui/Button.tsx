import { cn } from "@/lib/utils";
import React from "react";

type Variant = "default" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    asChild?: boolean;
}

export function Button({ variant = "default", asChild, className, children, ...props }: ButtonProps) {
    const base = "px-4 py-1 text-sm rounded-md font-medium";
    const variants = {
        default: "bg-gray-800 text-white",
        outline: "border text-gray-800",
    };

    const Component = asChild ? "span" : "button"; // <Link><Button asChild /></Link> 패턴

    return (
        <Component className={cn(base, variants[variant], className)} {...props}>
            {children}
        </Component>
    );
}
