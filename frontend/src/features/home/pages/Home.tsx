import { useWorkflow } from "../hooks/useWorkflow";
import Sidebar from "../components/sidebar/Sidebar";
import RecentWorkflows from "../components/recent-workflows/RecentWorkflows";
import { Header } from "@/shared/components/ui";
import { useNavigate } from "react-router-dom";
import CreateNewWorkflowModal from "../components/CreateNewWorkflowModal";
import { useState } from "react";

const Home = () => {
  const {
    workflows,
    isLoading,
    error,
    addWorkflow,
    uploadWorkflow,
    deleteWorkflow,
    downloadWorkflow,
  } = useWorkflow([]);
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      await uploadWorkflow(file);
      console.log("Workflow uploaded successfully");
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleCreateWorkflow = async (workflowData: {
    title: string;
    description: string;
  }) => {
    setIsCreating(true);
    try {
      await addWorkflow({
        version: "1.0",
        icons: "default",
        title: workflowData.title,
        description: workflowData.description,
        metadata: {
          imports: [],
          state: {
            type: "prebuilt",
            name: "MessagesState",
          },
        },
      });
      console.log("Workflow created successfully");
    } catch (err) {
      console.error("Creation failed:", err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await deleteWorkflow(id);
      console.log("Workflow deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDownloadWorkflow = async (id: string) => {
    try {
      await downloadWorkflow(id);
      console.log("Workflow downloaded successfully");
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleSidebarCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleWorkflowClick = (id: string, title: string) => {
    console.log("Workflow clicked:", id);
    navigate("/workflow/" + id + "?title=" + encodeURIComponent(title));
  };

  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <div className="flex h-full">
        <div className="w-[20%]">
          <Sidebar
            onUpload={handleUpload}
            onCreate={handleSidebarCreate}
            isLoading={isLoading}
          />
        </div>
        <div className="flex-1 overflow-auto p-4 mb-16">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 border-b border-red-200">
              {error}
            </div>
          )}
          <p className="text-sm font-bold p-1"> Recent Workflows</p>
          <RecentWorkflows
            workflows={workflows}
            onWorkflowClick={handleWorkflowClick}
            onDeleteWorkflow={handleDeleteWorkflow}
            onDownloadWorkflow={handleDownloadWorkflow}
          />
        </div>

        <CreateNewWorkflowModal
          show={isCreateModalOpen}
          onHide={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateWorkflow}
          isLoading={isCreating}
        />
      </div>
    </div>
  );
};

export default Home;
