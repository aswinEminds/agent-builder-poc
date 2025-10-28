import { FiUpload, FiPlus } from "react-icons/fi";
import { useRef } from "react";
import { Button } from "@/shared/components/ui";

interface SidebarProps {
  onUpload: (file: File) => void;
  onCreate: () => void;
  isLoading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onUpload, onCreate, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      // Reset input to allow uploading the same file again
      e.target.value = "";
    }
  };

  return (
    <div className="border-r h-full border-gray-200 p-4">
      <div className="flex flex-col space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="primary"
          icon={<FiUpload />}
          fullWidth
          size="sm"
          onClick={handleUploadClick}
          disabled={isLoading}
        >
          {isLoading ? "Uploading..." : "Upload Flow"}
        </Button>
        <Button
          variant="secondary"
          icon={<FiPlus />}
          fullWidth
          size="sm"
          onClick={onCreate}
          disabled={isLoading}
        >
          Create New
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
