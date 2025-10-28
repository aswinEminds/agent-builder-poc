/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { BaseNode } from "../BaseNode";

interface ChatInputNodeData {
  title: string;
}

interface ChatInputNodeProps extends NodeProps<ChatInputNodeData> {}

export const ChatInputNode: React.FC<ChatInputNodeProps> = ({
  data,
  selected,
}) => {
  return (
    <BaseNode title={data?.title || "Chat Input"} selected={selected}>
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
    </BaseNode>
  );
};
