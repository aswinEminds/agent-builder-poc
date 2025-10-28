import React, { useState, useRef } from "react";

interface BaseNodeProps {
  title: string;
  description?: string;
  onTitleChange?: (newTitle: string) => void;
  onDescriptionChange?: (newDescription: string) => void;
  children?: React.ReactNode;
  selected?: boolean;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  children,
  selected = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description || "");
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (onTitleChange && editedTitle !== title) {
      onTitleChange(editedTitle);
    }
    if (onDescriptionChange && editedDescription !== description) {
      onDescriptionChange(editedDescription);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setEditedDescription(description || "");
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedTitle(title);
    setEditedDescription(description || "");
  };

  return (
    <div className="relative">
      {/* Main Node Container */}
      <div
        ref={nodeRef}
        className={`
          min-w-[150px] 
          bg-white 
          border-1
          border-gray-300 
          rounded-t-md
          transition-all 
          duration-200
          ${selected ? "border-gray-500 shadow-md" : "border-gray-300"}
          hover:shadow-md
        `}
      >
        {/* Header */}
        <div className="px-3 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-xs font-medium text-gray-900 bg-transparent border-none rounded w-full focus:outline-none focus:ring-0"
                  autoFocus
                />
              ) : (
                <h3 className="text-xs font-medium text-gray-900 truncate">
                  {title}
                </h3>
              )}

              {description && (
                <div className="mt-0.5">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Add description..."
                      className="text-[10px] text-gray-500 bg-transparent border-none rounded w-full focus:outline-none focus:ring-0"
                    />
                  ) : (
                    <p className="text-[10px] text-gray-500 truncate">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Show empty description input when editing and no description exists */}
              {isEditing && !description && (
                <div className="mt-0.5">
                  <input
                    type="text"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Add description (optional)..."
                    className="text-[10px] text-gray-500 bg-transparent border-none rounded w-full focus:outline-none focus:ring-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area - Extended nodes render UI here */}
        <div className="p-3">{children}</div>
      </div>

      {/* Edit/Save Icon - Positioned outside the node when selected */}
      {selected && (onTitleChange || onDescriptionChange) && (
        <button
          onClick={isEditing ? handleSave : handleEditClick}
          className={`
            absolute 
            top-2.5 
            right-[-22px] 
            p-0.5 
            rounded 
            transition-colors 
            duration-200 
            ${
              isEditing
                ? "text-green-500 hover:text-green-600 hover:bg-green-100"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
            }
          `}
          title={isEditing ? "Save" : "Edit node"}
        >
          <svg
            className="w-2.5 h-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isEditing ? (
              // Check icon for save
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            ) : (
              // Edit icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            )}
          </svg>
        </button>
      )}
    </div>
  );
};
