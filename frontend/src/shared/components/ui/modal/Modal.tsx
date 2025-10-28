import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  show: boolean;
  onHide: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  preventBodyScroll?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  show,
  onHide,
  children,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Find the modal-root element
    const rootElement = document.getElementById("modal-root");
    setModalRoot(rootElement);
  }, []);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      setTimeout(() => setShouldRender(false), 150);
    }
  }, [show]);

  // Handle ESC key press and prevent body scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onHide();
      }
    };

    if (show) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      if (preventBodyScroll) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (preventBodyScroll) {
        document.body.style.overflow = "unset";
      }
    };
  }, [show, onHide, closeOnEscape, preventBodyScroll]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onHide();
    }
  };

  if (!shouldRender || !modalRoot) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  // Check if className contains viewport sizing to override default size classes
  const hasViewportSizing =
    className.includes("w-[") || className.includes("h-[");
  const appliedSizeClass = hasViewportSizing ? "" : sizeClasses[size];

  const modalContent = (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-[9999] transition-all duration-150 ease-out`}
      style={{
        backgroundColor: isVisible ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        width: "100vw",
        height: "100vh",
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-full p-4">
        <div
          className={`relative bg-white rounded-lg shadow-2xl transform transition-all duration-150 ease-out ${appliedSizeClass} ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-8 scale-95"
          } ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the modal into modal-root
  return createPortal(modalContent, modalRoot);
};

// Header component for modal
interface ModalHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  onClose,
  showCloseButton = true,
  className = "",
}) => (
  <div
    className={`flex items-center justify-between p-4 border-b border-gray-200 ${className}`}
  >
    <div className="text-lg font-semibold text-gray-900">{children}</div>
    {showCloseButton && (
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
        onClick={onClose}
        aria-label="Close modal"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    )}
  </div>
);

// Body component for modal
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = "",
  style = {},
}) => (
  <div style={{ ...style }} className={`p-4 ${className}`}>
    {children}
  </div>
);

// Footer component for modal
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-4 border-t border-gray-200 ${className}`}
  >
    {children}
  </div>
);

export default Modal;
