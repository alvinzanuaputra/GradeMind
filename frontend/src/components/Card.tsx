import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}
const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  hover = false,
  onClick,
}) => {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  const hoverStyle = hover
    ? "hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    : "transition-shadow duration-200";
  const clickableStyle = onClick ? "cursor-pointer" : "";
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100 hover:border-gray-200
        ${paddingStyles[padding]}
        ${hoverStyle}
        ${clickableStyle}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;