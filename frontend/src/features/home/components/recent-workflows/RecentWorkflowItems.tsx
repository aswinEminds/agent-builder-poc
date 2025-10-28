import React from "react";
import { FiGitBranch, FiTrash2, FiDownload } from "react-icons/fi";
import type { Workflow } from "../../types";
import { DropdownMenu } from "@/shared/components/ui/dropdown-menu/DropdownMenu";

interface ExtendedRecentWorkflowItemProps extends Workflow {
  onClick?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const RecentWorkflowItem: React.FC<ExtendedRecentWorkflowItemProps> = ({
  _id,
  title,
  description,
  onClick,
  onDelete,
  onDownload,
}) => {
  const menuItems = [
    {
      label: "Delete",
      icon: <FiTrash2 className="w-4 h-4" />,
      onClick: () => onDelete?.(_id),
    },
    {
      label: "Download",
      icon: <FiDownload className="w-4 h-4" />,
      onClick: () => onDownload?.(_id),
    },
  ];

  return (
    <div
      key={_id}
      className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200"
      onClick={() => onClick?.(_id, title)}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <FiGitBranch className="w-5 h-5 text-secondary" />
      </div>

      <div className="flex-1 ml-4 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {title}
        </h3>
        <p className="text-xs text-gray-500 truncate mt-1">{description}</p>
      </div>

      <DropdownMenu
        items={menuItems}
        className="ml-2"
        iconOrientation="vertical"
      />
    </div>
  );
};

export default RecentWorkflowItem;
