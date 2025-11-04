import React from "react";
import { CircleNotch } from "phosphor-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "white" ;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "blue",
  text,
  fullScreen = false,
}) => {
  const sizeStyles = {
    sm: "h-8 w-8",
    md: "h-14 w-14",
    lg: "h-20 w-20",
    xl: "h-24 w-24",
  };

  const colorStyles = {
    blue: "text-yellow-500",
    white: "text-white",
    gray: "text-gray-500",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <CircleNotch
        className={`${sizeStyles[size]} ${colorStyles[color]} animate-spin`}
        weight="bold"
      />
      {text && (
        <p className={`text-lg font-large ${colorStyles[color]}`}>{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;