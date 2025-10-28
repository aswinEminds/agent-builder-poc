import { type InputHTMLAttributes, useState, forwardRef } from "react";
import { FiAlertCircle, FiEye, FiEyeOff, FiMaximize } from "react-icons/fi";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@shared/components/ui"; // Adjust path as needed

type InputType = "email" | "password" | "text";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type: InputType;
  id: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  hasError?: boolean;
  showToggle?: boolean;
  fullWidth?: boolean;
  enableExpandModal?: boolean; // New prop to enable/disable modal functionality
}

export const TextFiled = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      id,
      name,
      placeholder,
      value,
      onChange,
      label,
      icon,
      error,
      hasError = false,
      showToggle = false,
      fullWidth = false,
      enableExpandModal = true, // Default to true, but can be disabled
      className = "",
      required,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalValue, setModalValue] = useState(value);

    // Handle modal save
    const handleModalSave = () => {
      // Create a synthetic event to match the expected onChange signature
      const syntheticEvent = {
        target: {
          name,
          value: modalValue,
        },
        currentTarget: {
          name,
          value: modalValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
      setShowModal(false);
    };

    // Handle modal cancel
    const handleModalCancel = () => {
      setModalValue(value); // Reset to original value
      setShowModal(false);
    };

    // Open modal and sync the current value
    const handleExpandClick = () => {
      setModalValue(value);
      setShowModal(true);
    };

    // Check if we should show the expand icon (not for password fields)
    const shouldShowExpandIcon = enableExpandModal && type !== "password";

    return (
      <>
        <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
          {label && (
            <label
              htmlFor={id}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          <div className={`relative ${hasError ? "group-error" : ""}`}>
            {icon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">{icon}</span>
              </div>
            )}

            <input
              ref={ref}
              type={
                showToggle && type === "password"
                  ? showPassword
                    ? "text"
                    : "password"
                  : type
              }
              id={id}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              autoComplete="off"
              required={required}
              className={`
                block w-full px-3 py-2 border text-xs border-gray-300 outline-none rounded-md 
                placeholder-gray-400 
                ${icon ? "pl-10" : ""}
                ${(showToggle && type === "password") || error || shouldShowExpandIcon ? "pr-10" : ""}
                ${hasError || error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
                disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              `}
              {...props}
            />

            {((showToggle && type === "password") ||
              error ||
              shouldShowExpandIcon) && (
              <div className="absolute inset-y-0 right-0 flex items-center">
                {/* Expand Icon - only show for non-password fields */}
                {shouldShowExpandIcon && (
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                    onClick={handleExpandClick}
                    aria-label="Expand text editor"
                  >
                    <FiMaximize className="w-4 h-4" />
                  </button>
                )}

                {/* Password Toggle */}
                {showToggle && type === "password" && (
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* Error Icon */}
                {error && (
                  <div className="p-2">
                    <FiAlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Expanded Text Modal */}
        <Modal
          show={showModal}
          onHide={handleModalCancel}
          size="lg"
          closeOnBackdrop={false} // Prevent accidental closes
          closeOnEscape={true}
        >
          <ModalHeader onClose={handleModalCancel}>
            {label || "Edit Text"}
          </ModalHeader>

          <ModalBody>
            <div className="space-y-4">
              <div>
                <textarea
                  id={`${id}-modal`}
                  rows={6}
                  className="block w-full px-3 py-2 rounded-md outline-gray-300  shadow-sm placeholder-gray-400  resize-vertical"
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              className="px-4 py-2 text-sm"
              onClick={handleModalCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="ml-3 px-4 py-2 text-sm "
              onClick={handleModalSave}
            >
              Save
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
);

TextFiled.displayName = "TextFiled";
