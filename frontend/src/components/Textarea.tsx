import React, { TextareaHTMLAttributes, forwardRef, useState } from "react";
import { Copy, Check } from "phosphor-react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  showCopyButton?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount,
      maxLength,
      showCopyButton = false,
      className = "",
      value,
      ...props
    },
    ref
  ) => {
    const charCount = value ? String(value).length : 0;
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      if (value) {
        try {
          await navigator.clipboard.writeText(String(value));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      }
    };

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label className="block text-base font-bold text-gray-800">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {showCopyButton && value && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors shadow-sm"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" weight="bold" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" weight="bold" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 border-2 rounded-md focus:outline-none transition-all resize-y whitespace-pre-wrap shadow-sm
            text-gray-800 placeholder-gray-500 bg-white font-normal
            ${
              error
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-yellow-500 hover:border-gray-300"
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
        <div className="flex justify-between items-center mt-2">
          <div>
            {error && (
              <p
                className="text-sm text-red-600 font-medium"
                id={`${props.id}-error`}
              >
                {error}
              </p>
            )}
            {helperText && !error && (
              <p
                className="text-sm text-gray-600"
                id={`${props.id}-helper`}
              >
                {helperText}
              </p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p className="text-sm text-gray-600 font-medium">
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