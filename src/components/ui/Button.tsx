import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-green-500 hover:bg-green-400 text-white shadow-[0_4px_14px_rgba(34,197,94,0.4)]",
  secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100",
  danger: "bg-red-800 hover:bg-red-700 text-slate-100",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-2 text-sm rounded-xl gap-1.5",
  md: "px-4 py-3 text-sm rounded-xl gap-1.5",
  lg: "px-5 py-[18px] text-xl rounded-2xl gap-2.5",
};

export function Button({
  children,
  variant = "secondary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
