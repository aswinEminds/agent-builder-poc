// nodeConfig.ts
import {
  Search,
  Globe,
  TrendingUp,
  User,
  FileText,
  FileOutput,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import React from "react";
import {
  NODE_TYPES,
  NODE_CATEGORIES,
  type NodeType,
  type NodeCategory,
} from "../types";

export interface NodeConfig {
  name: string;
  icon: React.ElementType;
  nodeType: NodeType;
  description: string;
  category: NodeCategory;
}

export const nodeConfig: NodeConfig[] = [
  // Input Category
  {
    name: "Text Input",
    icon: FileText,
    nodeType: NODE_TYPES.TEXT_INPUT,
    description: "Text input for workflows",
    category: NODE_CATEGORIES.Io,
  },
  {
    name: "Chat Input",
    icon: MessageCircle,
    nodeType: NODE_TYPES.CHAT_INPUT,
    description: "Chat input for conversation workflows",
    category: NODE_CATEGORIES.Io,
  },

  // Output Category
  {
    name: "Text Output",
    icon: FileOutput,
    nodeType: NODE_TYPES.TEXT_OUTPUT,
    description: "Text output from workflows",
    category: NODE_CATEGORIES.Io,
  },
  {
    name: "Chat Output",
    icon: MessageSquare,
    nodeType: NODE_TYPES.CHAT_OUTPUT,
    description: "Chat output for conversation workflows",
    category: NODE_CATEGORIES.Io,
  },

  // AI & Agents Category
  {
    name: "Agent",
    icon: User,
    nodeType: NODE_TYPES.AGENT,
    description: "AI agent with reasoning capabilities",
    category: NODE_CATEGORIES.AI_AGENTS,
  },

  // Tools & Integrations Category
  {
    name: "Tavily",
    icon: Search,
    nodeType: NODE_TYPES.TAVILY,
    description: "Real-time web search and content extraction",
    category: NODE_CATEGORIES.TOOLS,
  },
  {
    name: "API Request",
    icon: Globe,
    nodeType: NODE_TYPES.API_REQUEST,
    description: "HTTP API requests with multiple methods",
    category: NODE_CATEGORIES.TOOLS,
  },
  {
    name: "Yahoo Finance",
    icon: TrendingUp,
    nodeType: NODE_TYPES.YAHOO_FINANCE,
    description: "Stock market data and financial information",
    category: NODE_CATEGORIES.TOOLS,
  },
];

// Helper function to get nodes by category
export const getNodesByCategory = (): Record<NodeCategory, NodeConfig[]> => {
  return nodeConfig.reduce(
    (acc, node) => {
      if (!acc[node.category]) {
        acc[node.category] = [];
      }
      acc[node.category].push(node);
      return acc;
    },
    {} as Record<NodeCategory, NodeConfig[]>
  );
};
