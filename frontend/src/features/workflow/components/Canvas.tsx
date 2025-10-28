// Canvas.tsx
import ReactFlow, { Background, Controls, Panel } from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "../hooks/useNodeTypes";
import { useWorkflow } from "../hooks/useWorkflow";
import { Save, Play, Code } from "lucide-react";
import { Button } from "@/shared/components/ui";
import PlaygroundModal from "./Playground";
import ApiAccessModal from "./ApiAccess";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

interface CanvasProps {
  id?: string;
}

const Canvas: React.FC<CanvasProps> = ({ id }) => {
  const [showPlayground, setShowPlayground] = useState(false);
  const [showApiAccess, setShowApiAccess] = useState(false);
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title") || "Untitled Workflow";
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    saveWorkflow,
  } = useWorkflow(id);

  return (
    <div className="flex-1 bg-gray-50">
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />

        {/* Clean Horizontal Panel */}
        <Panel position="top-right" className="p-2">
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-sm p-1">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPlayground(true)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-gray-100"
            >
              <Play className="w-3.5 h-3.5" />
              Playground
            </Button>
            <div className="w-px h-6 bg-gray-200" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => saveWorkflow()}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-gray-100"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </Button>
            <div className="w-px h-6 bg-gray-200" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowApiAccess(true)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-gray-100"
            >
              <Code className="w-3.5 h-3.5" />
              API
            </Button>
          </div>
        </Panel>
      </ReactFlow>

      <PlaygroundModal
        show={showPlayground}
        onHide={() => setShowPlayground(false)}
        workflowId={id!}
        title={title}
      />

      <ApiAccessModal
        show={showApiAccess}
        onHide={() => setShowApiAccess(false)}
        workflowId={id!}
      />
    </div>
  );
};

export default Canvas;
