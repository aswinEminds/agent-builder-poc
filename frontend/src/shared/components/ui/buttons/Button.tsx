import React from "react";

// Button Component Props Interface
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Button Component
const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  // Base classes
  const baseClasses =
    "inline-flex items-center text-xs cursor-pointer justify-center font-medium rounded-button transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant classes
  const variantClasses = {
    primary:
      "bg-primary text-secondary border border-gray-300 hover:bg-gray-800 focus:ring-gray-500",
    secondary:
      "bg-secondary border border-gray-200 text-primary hover:bg-gray-50 focus:ring-gray-200",
    tertiary:
      "bg-transparent text-secondary hover:bg-gray-100 focus:ring-gray-500",
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg
      className={`animate-spin ${iconSizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Combine classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  // Render icon with proper spacing
  const renderIcon = (position: "left" | "right") => {
    if (loading && position === "left") {
      return <LoadingSpinner />;
    }

    if (
      icon &&
      React.isValidElement<{ className?: string }>(icon) &&
      iconPosition === position
    ) {
      return React.cloneElement(icon, {
        className: `${iconSizeClasses[size]} ${
          position === "left" && children ? "mr-2" : ""
        } ${position === "right" && children ? "ml-2" : ""}`,
      });
    }

    return null;
  };

  return (
    <button className={buttonClasses} disabled={disabled || loading} {...props}>
      {renderIcon("left")}
      {children}
      {renderIcon("right")}
    </button>
  );
};

// Export component and types
export { Button };
export type { ButtonProps };
