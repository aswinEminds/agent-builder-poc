/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { useState, useCallback } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "reactflow";
import { BaseNode } from "../BaseNode";
import { TextFiled, Select } from "@shared/components/ui";

interface APIRequestNodeData {
  label: string;
  title: string;
  description?: string;
  url: string;
  method: string;
  payload: string;
  headers: string;
  type?: string;
}

interface APIRequestNodeProps extends NodeProps<APIRequestNodeData> {}

export const APIRequestNode: React.FC<APIRequestNodeProps> = ({
  id,
  data,
  selected,
}) => {
  const { setNodes } = useReactFlow();
  const [config, setConfig] = useState<APIRequestNodeData>({
    label: data?.label || "Tool",
    title: data?.title || "API Request",
    description: data?.description || "Make HTTP API requests",
    url: data?.url || "",
    method: data?.method || "GET",
    payload: data?.payload || "",
    headers: data?.headers || '{"Content-Type": "application/json"}',
    type: data?.type || "api_request",
  });

  // Update node data in React Flow
  const updateNodeData = useCallback(
    (newData: Partial<APIRequestNodeData>) => {
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
    (field: keyof APIRequestNodeData, value: string) => {
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
    return config.url.trim() !== "";
  };

  const requiresPayload = () => {
    return ["POST", "PUT", "PATCH"].includes(config.method);
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
          {/* URL Field */}
          <TextFiled
            type="text"
            id={`${id}-url`}
            name="url"
            value={config.url}
            placeholder="https://api.example.com/endpoint"
            onChange={(e) => handleFieldChange("url", e.target.value)}
            label="URL *"
            fullWidth
          />

          {/* Method Select */}
          <Select
            id={`${id}-method`}
            name="method"
            value={config.method}
            placeholder="Select HTTP method"
            onChange={(value) => handleFieldChange("method", value)}
            label="HTTP Method"
            options={[
              { value: "GET", label: "GET" },
              { value: "POST", label: "POST" },
              { value: "PUT", label: "PUT" },
              { value: "DELETE", label: "DELETE" },
              { value: "PATCH", label: "PATCH" },
            ]}
            fullWidth
          />

          {/* Headers Field */}
          <TextFiled
            type="text"
            id={`${id}-headers`}
            name="headers"
            value={config.headers}
            onChange={(e) => handleFieldChange("headers", e.target.value)}
            placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
            label="Headers"
            fullWidth
          />

          {/* Payload Field - Only show for POST, PUT, PATCH */}
          {requiresPayload() && (
            <TextFiled
              type="text"
              id={`${id}-payload`}
              name="payload"
              value={config.payload}
              onChange={(e) => handleFieldChange("payload", e.target.value)}
              placeholder='{"key": "value"}'
              label="Request Body"
              fullWidth
            />
          )}

          {/* Status Indicator */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
            <div
              className={`w-2 h-2 rounded-full ${
                isConfigured() ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span className="text-xs text-gray-600">
              {isConfigured() ? "Ready" : "URL required"}
            </span>
          </div>
        </div>
      </BaseNode>

      {/* Output Section */}
      <div className="relative bg-gray-100 text-black px-4 py-2 rounded-b-lg border border-gray-300">
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium tracking-wide">
            API Response
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
