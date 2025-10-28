/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { useState, useCallback } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "reactflow";
import { BaseNode } from "../BaseNode";
import { TextFiled } from "@shared/components/ui";

interface TavilyNodeData {
  label: string;
  title: string;
  description?: string;
  API_key: string;
  search_query: string;
  type?: string;
}

interface TavilyNodeProps extends NodeProps<TavilyNodeData> {}

export const TavilyNode: React.FC<TavilyNodeProps> = ({
  id,
  data,
  selected,
}) => {
  const { setNodes } = useReactFlow();
  const [config, setConfig] = useState<TavilyNodeData>({
    label: data?.label || "Tool",
    title: data?.title || "Tavily Search",
    description: data?.description || "Perform web search using Tavily API",
    API_key: data?.API_key || "",
    search_query: data?.search_query || "",
    type: data?.type || "tavily",
  });

  // Update node data in React Flow
  const updateNodeData = useCallback(
    (newData: Partial<TavilyNodeData>) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  // Handle title change from BaseNode
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      const updatedConfig = {
        ...config,
        title: newTitle,
      };
      setConfig(updatedConfig);
      updateNodeData({ title: newTitle });
    },
    [config, updateNodeData]
  );

  // Handle description change from BaseNode
  const handleDescriptionChange = useCallback(
    (newDescription: string) => {
      const updatedConfig = {
        ...config,
        description: newDescription,
      };
      setConfig(updatedConfig);
      updateNodeData({ description: newDescription });
    },
    [config, updateNodeData]
  );

  // Handle field changes
  const handleFieldChange = useCallback(
    (field: keyof TavilyNodeData, value: string) => {
      const updatedConfig = {
        ...config,
        [field]: value,
      };
      setConfig(updatedConfig);
      updateNodeData({ [field]: value });
    },
    [config, updateNodeData]
  );

  const isConfigured = () => {
    return config.API_key.trim() !== "" && config.search_query.trim() !== "";
  };

  return (
    <div className="relative">
      <BaseNode
        title={config.title}
        selected={selected}
        description={config.description}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
      >
        <div className="space-y-4">
          {/* API Key Field */}
          <TextFiled
            type="password"
            id={`${id}-api-key`}
            name="API_key"
            value={config.API_key}
            placeholder="Enter your Tavily API key"
            onChange={(e) => handleFieldChange("API_key", e.target.value)}
            label="API Key *"
            fullWidth
          />

          {/* Search Query Field */}
          <TextFiled
            type="text"
            id={`${id}-search-query`}
            name="search_query"
            value={config.search_query}
            placeholder="Enter search query"
            onChange={(e) => handleFieldChange("search_query", e.target.value)}
            label="Search Query *"
            fullWidth
          />

          {/* Status Indicator */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
            <div
              className={`w-2 h-2 rounded-full ${
                isConfigured() ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span className="text-xs text-gray-600">
              {isConfigured() ? "Ready" : "Missing API key or search query"}
            </span>
          </div>
        </div>
      </BaseNode>

      {/* Output Section */}
      <div className="relative bg-gray-100 text-black px-4 py-2 rounded-b-lg border border-gray-300">
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium tracking-wide">
            Search Results
          </span>
        </div>

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          style={{
            background: "black",
            width: 8,
            height: 8,
          }}
          isConnectable={true}
        />
      </div>
    </div>
  );
};
