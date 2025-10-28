import type { NodeTypes } from "reactflow";
import { TextInputNode } from "../components/nodes/io/TextInputNode";
import { NODE_TYPES } from "../types";
import { AgentNode } from "../components/nodes/ai_agents/AgentNode";
import { TavilyNode } from "../components/nodes/tools_integrations/TavilyNode";
import { APIRequestNode } from "../components/nodes/tools_integrations/APIRequestNode";
import { YahooFinanceNode } from "../components/nodes/tools_integrations/YahooFinanceNode";
import { ChatInputNode } from "../components/nodes/io/ChatInputNode";
import { ChatOutputNode } from "../components/nodes/io/ChatOutputNode";

export const nodeTypes: NodeTypes = {
  [NODE_TYPES.AGENT]: AgentNode,
  [NODE_TYPES.TEXT_INPUT]: TextInputNode,
  [NODE_TYPES.TAVILY]: TavilyNode,
  [NODE_TYPES.API_REQUEST]: APIRequestNode,
  [NODE_TYPES.YAHOO_FINANCE]: YahooFinanceNode,
  [NODE_TYPES.CHAT_INPUT]: ChatInputNode,
  [NODE_TYPES.CHAT_OUTPUT]: ChatOutputNode,
};
