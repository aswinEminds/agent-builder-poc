import React, { useState, useRef, useEffect } from "react";
import { FiMoreVertical, FiChevronRight } from "react-icons/fi";

interface MenuAction {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  subMenu?: MenuAction[];
}

interface DropdownMenuProps {
  items: MenuAction[];
  className?: string;
  iconOrientation?: "vertical" | "horizontal";
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  className = "",
  iconOrientation = "vertical",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
    setActiveSubMenu(null);
  };

  const handleMenuItemClick = (item: MenuAction) => {
    if (item.onClick && !item.subMenu) {
      item.onClick();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSubMenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        aria-label="Open menu"
      >
        <FiMoreVertical
          className={`w-5 h-5 text-gray-700 ${
            iconOrientation === "horizontal" ? "rotate-90" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => item.subMenu && setActiveSubMenu(index)}
              onMouseLeave={() => item.subMenu && setActiveSubMenu(null)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuItemClick(item);
                }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                <div className="flex items-center gap-2">
                  {item.icon && (
                    <span className="text-gray-600">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </div>
                {item.subMenu && (
                  <FiChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Sub Menu */}
              {item.subMenu && activeSubMenu === index && (
                <div className="absolute left-full top-0 ml-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {item.subMenu.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (subItem.onClick) {
                          subItem.onClick();
                          setIsOpen(false);
                          setActiveSubMenu(null);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                      {subItem.icon && (
                        <span className="text-gray-600">{subItem.icon}</span>
                      )}
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
