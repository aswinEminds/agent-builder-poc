/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { useState, useCallback } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "reactflow";
import { BaseNode } from "../BaseNode";
import { TextFiled } from "@shared/components/ui";

interface YahooFinanceNodeData {
  label: string;
  title: string;
  description?: string;
  ticker_symbol: string;
  type?: string;
}

interface YahooFinanceNodeProps extends NodeProps<YahooFinanceNodeData> {}

export const YahooFinanceNode: React.FC<YahooFinanceNodeProps> = ({
  id,
  data,
  selected,
}) => {
  const { setNodes } = useReactFlow();
  const [config, setConfig] = useState<YahooFinanceNodeData>({
    label: data?.label || "Tool",
    title: data?.title || "Yahoo Finance",
    description: data?.description || "Fetch stock and company information",
    ticker_symbol: data?.ticker_symbol || "",
    type: data?.type || "yahoo_finance",
  });

  // Update node data in React Flow
  const updateNodeData = useCallback(
    (newData: Partial<YahooFinanceNodeData>) => {
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

  // Handle ticker symbol change
  const handleTickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase(); // Convert to uppercase for stock symbols
      const updatedConfig = {
        ...config,
        ticker_symbol: value,
      };

      setConfig(updatedConfig);
      updateNodeData({ ticker_symbol: value });
    },
    [config, updateNodeData]
  );

  const isConfigured = () => {
    return config.ticker_symbol.trim() !== "";
  };

  const isValidTicker = () => {
    // Basic validation for ticker symbols (1-5 uppercase letters)
    const tickerRegex = /^[A-Z]{1,5}$/;
    return tickerRegex.test(config.ticker_symbol.trim());
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
          {/* Ticker Symbol Field */}
          <TextFiled
            type="text"
            id={`${id}-ticker-symbol`}
            name="ticker_symbol"
            value={config.ticker_symbol}
            placeholder="AAPL, MSFT, TSLA..."
            onChange={handleTickerChange}
            label="Ticker Symbol *"
            fullWidth
            style={{ textTransform: "uppercase" }}
          />

          {/* Ticker Examples */}
          <div className="text-xs text-gray-500">
            <p>
              Examples: AAPL (Apple), MSFT (Microsoft), TSLA (Tesla), GOOGL
              (Google)
            </p>
          </div>

          {/* Validation Message */}
          {config.ticker_symbol.trim() !== "" && !isValidTicker() && (
            <div className="flex items-center space-x-2 text-amber-600">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs">
                Please enter a valid ticker symbol (1-5 letters)
              </span>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
            <div
              className={`w-2 h-2 rounded-full ${
                isConfigured() && isValidTicker()
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
            <span className="text-xs text-gray-600">
              {isConfigured() && isValidTicker()
                ? "Ready"
                : "Enter a valid ticker symbol"}
            </span>
          </div>
        </div>

        {/* Input Handle */}
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

      {/* Output Section */}
      <div className="relative bg-gray-100 text-black px-4 py-2 rounded-b-lg border border-gray-300">
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium tracking-wide">Stock Data</span>
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
