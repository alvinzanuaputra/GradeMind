import React, { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount,
      maxLength,
      className = "",
      value,
      ...props
    },
    ref
  ) => {
    const charCount = value ? String(value).length : 0;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-y whitespace-pre-wrap shadow-sm
            text-gray-900 placeholder-gray-400 bg-white
            ${
              error
                ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                : "border-gray-300 focus:ring-yellow-200 focus:border-yellow-400 hover:border-yellow-300"
            }
            ${
              props.disabled
                ? "bg-gray-100 cursor-not-allowed opacity-60"
                : ""
            }
            ${className}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error
              ? `${props.id}-error`
              : helperText
              ? `${props.id}-helper`
              : undefined
          }
          {...props}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {error && (
              <p
                className="text-sm text-red-600"
                id={`${props.id}-error`}
              >
                {error}
              </p>
            )}
            {helperText && !error && (
              <p
                className="text-sm text-gray-500"
                id={`${props.id}-helper`}
              >
                {helperText}
              </p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p className="text-sm text-gray-500">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
