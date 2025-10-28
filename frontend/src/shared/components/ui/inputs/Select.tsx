import {
  type SelectHTMLAttributes,
  useState,
  forwardRef,
  useRef,
  useEffect,
} from "react";
import { FiChevronDown, FiAlertCircle, FiCheck } from "react-icons/fi";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  id: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  hasError?: boolean;
  fullWidth?: boolean;
  searchable?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      name,
      placeholder,
      value,
      onChange,
      options,
      label,
      icon,
      error,
      hasError = false,
      fullWidth = false,
      searchable = false,
      className = "",
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const SelectRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on search term
    const filteredOptions = searchable
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    // Get selected option for display
    const selectedOption = options.find((option) => option.value === value);

    // Close Select when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          SelectRef.current &&
          !SelectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
        case " ":
          if (!isOpen) {
            setIsOpen(true);
          } else if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleSelect(filteredOptions[focusedIndex].value);
          }
          e.preventDefault();
          break;
        case "Escape":
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
          break;
        case "ArrowDown":
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setFocusedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          e.preventDefault();
          break;
        case "ArrowUp":
          if (isOpen) {
            setFocusedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
            e.preventDefault();
          }
          break;
      }
    };

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm("");
      setFocusedIndex(-1);
    };

    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      if (!isOpen && searchable) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };

    return (
      <div className={`${fullWidth ? "w-full" : "w-auto"} space-y-1`}>
        {/* Hidden select for form compatibility */}
        <select
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={() => {}} // Controlled by Select
          className="sr-only"
          tabIndex={-1}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {label && (
          <label htmlFor={id} className="block text-xs text-text-body">
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative h-[35px]" ref={SelectRef}>
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              {icon}
            </div>
          )}

          {/* Select Trigger */}
          <div
            className={`h-full w-full text-xs rounded-md border cursor-pointer ${
              hasError || error ? "border-red-500" : "border-gray-300"
            } ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"} ${
              isOpen ? "ring-1 ring-primary" : ""
            } flex items-center ${icon ? "pl-10" : "pl-3"} pr-10 ${className}`}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            {searchable && isOpen ? (
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-transparent outline-none text-text-body placeholder:text-muted"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <span
                className={selectedOption ? "text-text-body" : "text-muted"}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            )}
          </div>

          {/* Icons */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {error ? (
              <FiAlertCircle className="text-red-500" size={14} />
            ) : (
              <FiChevronDown
                className={`text-text-muted transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                size={14}
              />
            )}
          </div>

          {/* Select Options */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted">
                  No options found
                </div>
              ) : (
                <ul role="listbox" className="py-1">
                  {filteredOptions.map((option, index) => (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={option.value === value}
                      className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        option.disabled
                          ? "text-muted cursor-not-allowed bg-gray-50"
                          : focusedIndex === index
                            ? "bg-gray-100 text-text-body"
                            : option.value === value
                              ? "bg-primary/5 text-primary"
                              : "text-text-body hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        !option.disabled && handleSelect(option.value)
                      }
                      onMouseEnter={() =>
                        !option.disabled && setFocusedIndex(index)
                      }
                    >
                      <span>{option.label}</span>
                      {option.value === value && (
                        <FiCheck size={14} className="text-primary" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
