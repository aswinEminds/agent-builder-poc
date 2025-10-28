/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { BaseNode } from "../BaseNode";

interface ChatOutputNodeData {
  title: string;
}

interface ChatOutputNodeProps extends NodeProps<ChatOutputNodeData> {}

export const ChatOutputNode: React.FC<ChatOutputNodeProps> = ({
  data,
  selected,
}) => {
  return (
    <div className="relative">
      <BaseNode title={data?.title || "Chat Output"} selected={selected}>
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={{
            background: "#555",
            width: 8,
            height: 8,
          }}
          isConnectable={true}
        />
      </BaseNode>
    </div>
  );
};
