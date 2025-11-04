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
    "font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg";
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 focus:ring-yellow-400 transform hover:-translate-y-0.5 font-bold",
    secondary:
      "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 focus:ring-gray-400 border border-gray-300 shadow-sm",
    outline:
      "border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-500 hover:shadow-xl focus:ring-yellow-400 bg-white",
    danger:
      "bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800 focus:ring-red-500 shadow-md hover:shadow-xl",
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
