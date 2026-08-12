import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: React.CSSProperties;
}

const variantClasses = {
  primary: "bg-gray-1000 text-background-100 hover:opacity-90",
  secondary: "bg-background-200 text-gray-1000 shadow-border-small hover:bg-gray-100",
  ghost: "text-gray-1000 hover:bg-gray-alpha-300",
};

const sizeClasses = {
  sm: "h-7 px-3 text-xs rounded-md",
  md: "h-9 px-4 text-sm rounded-lg",
  lg: "h-11 px-5 text-sm rounded-xl",
};

export const Button = ({
  children,
  onClick,
  className,
  variant = "secondary",
  size = "md",
  disabled,
  style,
}: ButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={style}
    className={twMerge(
      clsx(
        "inline-flex items-center justify-center font-medium transition-colors font-sans disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )
    )}
  >
    {children}
  </button>
);
