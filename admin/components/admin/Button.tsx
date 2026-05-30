import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variantStyles = {
  primary:
    "bg-[#1A56DB] hover:bg-[#1444B8] text-white shadow-sm hover:shadow-[0_6px_18px_rgba(26,86,219,0.32)] active:scale-[0.98]",
  secondary:
    "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm",
  danger:
    "bg-[#D42B2B] hover:bg-[#b82020] text-white shadow-sm hover:shadow-[0_6px_18px_rgba(212,43,43,0.32)] active:scale-[0.98]",
  ghost:
    "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900",
};

const sizeStyles = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-[13px] gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-bold tracking-[0.01em] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A56DB] focus-visible:ring-offset-2",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}