/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { useState, useCallback, useRef, useLayoutEffect } from "react";
import {
  Handle,
  Position,
  type NodeProps,
  useReactFlow,
  useUpdateNodeInternals,
} from "reactflow";
import { BaseNode } from "../BaseNode";
import { TextFiled, Select } from "@shared/components/ui";

interface AgentNodeData {
  label: string;
  title: string;
  description?: string;
  provider: string;
  model: string;
  API_key: string;
  api_version?: string;
  azure_endpoint?: string;
  system_message: string;
  input: string;
  type?: string;
}

interface AgentNodeProps extends NodeProps<AgentNodeData> {}

const LLM_PROVIDERS = [
  { value: "", label: "Select Provider" },
  { value: "openai", label: "OpenAI" },
  { value: "Groq", label: "Groq" },
  { value: "azure", label: "Azure OpenAI" },
];

const MODEL_OPTIONS = {
  openai: [
    { value: "", label: "Select Model" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  Groq: [
    { value: "", label: "Select Model" },
    { value: "llama-3.1-70b-versatile", label: "Llama 3.1 70B" },
    { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    { value: "openai/gpt-oss-20b", label: "openai/gpt-oss-20b" },
    { value: "openai/gpt-oss-120b", label: "openai/gpt-oss-120b" },
  ],
  azure: [
    { value: "", label: "Select Model" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-35-turbo", label: "GPT-3.5 Turbo" },
  ],
};

export const AgentNode: React.FC<AgentNodeProps> = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const [config, setConfig] = useState<AgentNodeData>({
    label: data?.label || "Agent",
    title: data?.title || "LLM Node (agent)",
    description: data?.description || "Configure and run an AI agent",
    provider: data?.provider || "",
    model: data?.model || "",
    API_key: data?.API_key || "",
    api_version: data?.api_version || "2024-06-01",
    azure_endpoint: data?.azure_endpoint || "",
    system_message: data?.system_message || "",
    input: data?.input || "",
    type: data?.type || "agent",
  });

  // Simple refs for positioning
  const instructionsRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Simple handle positions - no complex calculations needed
  const [handlePositions, setHandlePositions] = useState({
    instructions: 120,
    tools: 170,
    input: 220,
  });

  // Simple position calculation
  const calculateHandlePositions = useCallback(() => {
    if (instructionsRef.current && toolsRef.current && inputRef.current) {
      const instructionsTop =
        instructionsRef.current.offsetTop +
        instructionsRef.current.offsetHeight / 2;
      const toolsTop =
        toolsRef.current.offsetTop + toolsRef.current.offsetHeight / 2;
      const inputTop =
        inputRef.current.offsetTop + inputRef.current.offsetHeight / 2;

      setHandlePositions({
        instructions: instructionsTop,
        tools: toolsTop,
        input: inputTop,
      });

      // Update React Flow internals
      updateNodeInternals(id);
    }
  }, [id, updateNodeInternals]);

  // Update positions when content changes
  useLayoutEffect(() => {
    calculateHandlePositions();
  }, [
    calculateHandlePositions,
    config.provider,
    config.system_message,
    config.input,
  ]);

  const updateNodeData = useCallback(
    (newData: Partial<AgentNodeData>) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  // All your existing handlers (updated with snake_case)
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setConfig((prev) => ({ ...prev, title: newTitle }));
      updateNodeData({ title: newTitle });
    },
    [updateNodeData]
  );

  const handleDescriptionChange = useCallback(
    (newDescription: string) => {
      setConfig((prev) => ({ ...prev, description: newDescription }));
      updateNodeData({ description: newDescription });
    },
    [updateNodeData]
  );

  const handleProviderChange = useCallback(
    (value: string) => {
      setConfig((prev) => ({ ...prev, provider: value, model: "" }));
      updateNodeData({ provider: value, model: "" });
    },
    [updateNodeData]
  );

  const handleModelChange = useCallback(
    (value: string) => {
      setConfig((prev) => ({ ...prev, model: value }));
      updateNodeData({ model: value });
    },
    [updateNodeData]
  );

  const handleApiKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const API_key = e.target.value;
      setConfig((prev) => ({ ...prev, API_key }));
      updateNodeData({ API_key });
    },
    [updateNodeData]
  );

  const handleApiVersionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const api_version = e.target.value;
      setConfig((prev) => ({ ...prev, api_version }));
      updateNodeData({ api_version });
    },
    [updateNodeData]
  );

  const handleAzureEndpointChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const azure_endpoint = e.target.value;
      setConfig((prev) => ({ ...prev, azure_endpoint }));
      updateNodeData({ azure_endpoint });
    },
    [updateNodeData]
  );

  const handleSystemMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const system_message = e.target.value;
      setConfig((prev) => ({ ...prev, system_message }));
      updateNodeData({ system_message });
    },
    [updateNodeData]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setConfig((prev) => ({ ...prev, input }));
      updateNodeData({ input });
    },
    [updateNodeData]
  );

  const isConfigured = () => {
    const baseRequired =
      config.provider &&
      config.model &&
      config.API_key &&
      config.system_message.trim();
    if (config.provider === "azure") {
      return baseRequired && config.api_version && config.azure_endpoint;
    }
    return baseRequired;
  };

  const renderProviderFields = () => {
    const currentModels =
      MODEL_OPTIONS[config.provider as keyof typeof MODEL_OPTIONS] || [];

    return (
      <div className="space-y-3">
        <Select
          id={`${id}-provider`}
          name="provider"
          placeholder="Select Provider"
          value={config.provider}
          onChange={handleProviderChange}
          options={LLM_PROVIDERS}
          label="LLM Provider"
          fullWidth
        />

        {config.provider && (
          <Select
            id={`${id}-model`}
            name="model"
            placeholder="Select Model"
            value={config.model}
            onChange={handleModelChange}
            options={currentModels}
            label="Model Name"
            fullWidth
          />
        )}

        {config.provider && (
          <TextFiled
            type="password"
            id={`${id}-api-key`}
            name="API_key"
            value={config.API_key}
            placeholder="Enter your API key"
            onChange={handleApiKeyChange}
            label="API Key"
            fullWidth
          />
        )}

        {config.provider === "azure" && (
          <>
            <TextFiled
              type="text"
              id={`${id}-api-version`}
              name="api_version"
              value={config.api_version}
              placeholder="2024-06-01"
              onChange={handleApiVersionChange}
              label="API Version"
              fullWidth
            />
            <TextFiled
              type="text"
              id={`${id}-azure-endpoint`}
              name="azure_endpoint"
              value={config.azure_endpoint}
              placeholder="https://your-resource.openai.azure.com"
              onChange={handleAzureEndpointChange}
              label="Azure Endpoint"
              fullWidth
            />
          </>
        )}
      </div>
    );
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
          <div className="border-b border-gray-100 pb-3">
            {renderProviderFields()}
          </div>

          <div ref={instructionsRef}>
            <TextFiled
              type="text"
              id={`${id}-system-message`}
              name="system_message"
              value={config.system_message}
              placeholder="Provide detailed instructions for the agent..."
              onChange={handleSystemMessageChange}
              label="System Message"
              fullWidth
            />
          </div>

          <div ref={toolsRef} className="py-2">
            <span className="text-sm font-medium text-gray-700">Tools</span>
            <p className="text-xs text-gray-500 mt-1">
              Connect tool nodes here
            </p>
          </div>

          <div ref={inputRef}>
            <TextFiled
              type="text"
              id={`${id}-input`}
              name="input"
              value={config.input}
              placeholder="Connect input data or enter text..."
              onChange={handleInputChange}
              label="Input"
              enableExpandModal={false}
              fullWidth
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
            <div
              className={`w-2 h-2 rounded-full ${isConfigured() ? "bg-green-500" : "bg-gray-300"}`}
            />
            <span className="text-xs text-gray-600">
              {isConfigured() ? "Ready" : "Configuration incomplete"}
            </span>
          </div>
        </div>

        {/* Simple handles with calculated positions */}
        <Handle
          type="target"
          position={Position.Left}
          id="instructions"
          style={{ top: handlePositions.instructions }}
          isConnectable={true}
        />

        <Handle
          type="target"
          position={Position.Left}
          id="tools"
          style={{ top: handlePositions.tools }}
          isConnectable={true}
        />

        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={{ top: handlePositions.input }}
          isConnectable={true}
        />
      </BaseNode>

      <div className="relative bg-gray-100 text-black px-4 py-2 rounded-b-lg border border-gray-300">
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium tracking-wide">Output</span>
        </div>
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
