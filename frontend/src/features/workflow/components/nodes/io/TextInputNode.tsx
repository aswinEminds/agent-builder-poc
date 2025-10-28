/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { useState, useCallback } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "reactflow";
import { BaseNode } from "../BaseNode";
import { TextFiled } from "@shared/components/ui";

interface TextInputNodeData {
  title: string;
  description?: string;
  textValue: string;
  placeholder?: string;
}

interface TextInputNodeProps extends NodeProps<TextInputNodeData> {}

export const TextInputNode: React.FC<TextInputNodeProps> = ({
  id,
  data,
  selected,
}) => {
  const { setNodes } = useReactFlow();
  const [config, setConfig] = useState<TextInputNodeData>({
    title: data?.title || "Text Input",
    description: data?.description || "Enter text to pass through the workflow",
    textValue: data?.textValue || "",
    placeholder: data?.placeholder || "Type your text here...",
  });

  // Update node data in React Flow
  const updateNodeData = useCallback(
    (newData: Partial<TextInputNodeData>) => {
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

  // Handle text value change
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const updatedConfig = {
        ...config,
        textValue: value,
      };

      setConfig(updatedConfig);
      updateNodeData({ textValue: value });
    },
    [config, updateNodeData]
  );

  const isConfigured = () => {
    return config.textValue.trim() !== "";
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
          {/* Text Input Field */}
          <TextFiled
            type="text"
            id={`${id}-text-input`}
            name="textValue"
            value={config.textValue}
            placeholder="Type something..."
            onChange={handleTextChange}
            label="Text"
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
              {isConfigured() ? `Ready` : "No text entered"}
            </span>
          </div>
        </div>

        {/* Input Handle - Optional for TextInputNode since it's typically a source node */}
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={{
            background: "#555",
            width: 8,
            height: 8,
            top: "30%",
          }}
          isConnectable={true}
        />
      </BaseNode>

      {/* Black Output Section */}
      <div className="relative bg-gray-100 text-black px-4 py-2 rounded-b-lg border border-gray-300">
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium  tracking-wide">Output</span>
        </div>

        {/* Output Handle positioned on the black section */}
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
