import { forwardRef } from "react";

/**
 * Accessible Button component with proper ARIA attributes
 */
export const AccessibleButton = forwardRef(
  (
    {
      children,
      type = "button",
      disabled = false,
      loading = false,
      variant = "primary",
      size = "md",
      ariaLabel,
      ariaDescribedBy,
      onClick,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800";

    const variants = {
      primary:
        "bg-gradient-to-r from-emerald-600 to-lime-500 text-white hover:from-emerald-700 hover:to-lime-600 focus:ring-emerald-500 disabled:opacity-50",
      secondary:
        "bg-slate-700 text-gray-200 hover:bg-slate-600 focus:ring-slate-500 disabled:opacity-50 border border-slate-600",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:opacity-50",
      outline:
        "border-2 border-slate-600 text-gray-300 hover:bg-slate-700 focus:ring-emerald-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        aria-disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

/**
 * Accessible Input component with labels and error handling
 */
export const AccessibleInput = forwardRef(
  (
    {
      id,
      label,
      type = "text",
      error,
      helpText,
      required = false,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helpId = `${inputId}-help`;

    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            `${error ? errorId : ""} ${helpText ? helpId : ""}`.trim() ||
            undefined
          }
          aria-required={required}
          className={`
          block w-full px-3 py-2 border rounded-lg shadow-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          }
        `}
          {...props}
        />
        {helpText && !error && (
          <p id={helpId} className="text-sm text-gray-500">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = "AccessibleInput";

/**
 * Accessible Select component
 */
export const AccessibleSelect = forwardRef(
  (
    {
      id,
      label,
      options = [],
      error,
      helpText,
      required = false,
      disabled = false,
      placeholder,
      className = "",
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${selectId}-error`;
    const helpId = `${selectId}-help`;

    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            `${error ? errorId : ""} ${helpText ? helpId : ""}`.trim() ||
            undefined
          }
          aria-required={required}
          className={`
          block w-full px-3 py-2 border rounded-lg shadow-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500"
          }
        `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {helpText && !error && (
          <p id={helpId} className="text-sm text-gray-500">
            {helpText}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = "AccessibleSelect";

/**
 * Skip to main content link for keyboard navigation
 */
export function SkipLink({
  targetId = "main-content",
  children = "Skip to main content",
}) {
  return (
    <a
      href={`#${targetId}`}
      className="
        sr-only focus:not-sr-only
        focus:absolute focus:top-4 focus:left-4 focus:z-50
        focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white
        focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white
      "
    >
      {children}
    </a>
  );
}

/**
 * Visually hidden text for screen readers
 */
export function VisuallyHidden({ children, as: Component = "span" }) {
  return <Component className="sr-only">{children}</Component>;
}

/**
 * Accessible alert/notification component
 */
export function Alert({
  type = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  className = "",
}) {
  const types = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "ℹ️",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "✅",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "⚠️",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "❌",
    },
  };

  const style = types[type] || types.info;

  return (
    <div
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      className={`${style.bg} ${style.border} ${style.text} border p-4 rounded-lg ${className}`}
    >
      <div className="flex">
        <span className="mr-2" aria-hidden="true">
          {style.icon}
        </span>
        <div className="flex-1">
          {title && <h4 className="font-medium">{title}</h4>}
          <div className={title ? "mt-1" : ""}>{children}</div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-2 -mr-1 -mt-1 p-1 rounded hover:bg-black/10 focus:outline-none focus:ring-2"
            aria-label="Dismiss"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Loading spinner with accessible text
 */
export function LoadingSpinner({ size = "md", label = "Loading..." }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div role="status" className="flex items-center justify-center">
      <svg
        className={`animate-spin ${sizes[size]} text-indigo-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Accessible modal/dialog component
 */
export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  ariaDescribedBy,
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={ariaDescribedBy}
      className="fixed inset-0 z-50 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative ${sizes[size]} w-full bg-white rounded-lg shadow-xl`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close modal"
            >
              <span aria-hidden="true" className="text-xl">
                ×
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default {
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
  SkipLink,
  VisuallyHidden,
  Alert,
  LoadingSpinner,
  AccessibleModal,
};
