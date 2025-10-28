// types/node.ts

export const NODE_TYPES = {
  TOOL: "tool",
  AGENT: "agent",
  TEXT_INPUT: "textInput",
  TEXT_OUTPUT: "textOutput",
  TAVILY: "tavily",
  API_REQUEST: "apiRequest",
  YAHOO_FINANCE: "yahooFinance",
  CHAT_INPUT: "chatInput",
  CHAT_OUTPUT: "chatOutput",
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

// Optional: Category definitions for type safety
export const NODE_CATEGORIES = {
  Io: "I/O",
  AI_AGENTS: "AI & Agents",
  TOOLS: "Tools & Integrations",
} as const;

export type NodeCategory =
  (typeof NODE_CATEGORIES)[keyof typeof NODE_CATEGORIES];
