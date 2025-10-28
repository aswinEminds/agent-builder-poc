import type { Workflow } from "../../types";
import RecentWorkflowItem from "./RecentWorkflowItems";

interface RecentWorkflowsProps {
  workflows?: Workflow[];
  onWorkflowClick?: (id: string, title: string) => void;
  onDeleteWorkflow?: (id: string) => void;
  onDownloadWorkflow?: (id: string) => void;
}

const RecentWorkflows: React.FC<RecentWorkflowsProps> = ({
  workflows = [],
  onWorkflowClick,
  onDeleteWorkflow,
  onDownloadWorkflow,
}) => {
  const workflowsToDisplay = workflows;

  return (
    <div>
      {workflowsToDisplay.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No workflows yet. Upload or create your first workflow!</p>
        </div>
      ) : (
        workflowsToDisplay.map((workflow) => (
          <RecentWorkflowItem
            key={workflow._id}
            {...workflow}
            onClick={onWorkflowClick}
            onDelete={onDeleteWorkflow}
            onDownload={onDownloadWorkflow}
          />
        ))
      )}
    </div>
  );
};

export default RecentWorkflows;
