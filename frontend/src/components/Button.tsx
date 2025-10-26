import React, { ButtonHTMLAttributes } from "react";
import { CircleNotch } from "phosphor-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}
const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...props
}) => {
  const baseStyles =
    "font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 focus:ring-yellow-400 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 font-bold",
    secondary:
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-400 border border-gray-300",
    outline:
      "border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-500 focus:ring-yellow-400 bg-white",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-md hover:shadow-lg",
  };
  const sizeStyles = {
    sm: "px-6 py-2 text-sm",
    md: "px-8 py-2.5 text-base",
    lg: "px-10 py-3 text-lg",
  };
  const widthStyle = fullWidth ? "w-full" : "";
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <CircleNotch
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            weight="bold"
          />
          Memuat...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
