import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import { Header } from "@shared/components/ui";
import Sidebar from "../components/Sidebar";
import Canvas from "../components/Canvas";

const WorkflowCanvas: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title") || "Untitled Workflow";

  return (
    <div className="flex flex-col h-screen w-screen">
      <Header centerElements={[<h1 className="font-semibold">{title}</h1>]} />
      <div className="flex flex-1 overflow-hidden">
        <ReactFlowProvider>
          <Sidebar />
          <Canvas id={id} />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
