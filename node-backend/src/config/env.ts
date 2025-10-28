export const config = {
  port: process.env.PORT || 8004,
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/agentic-builder-poc",
  nodeEnv: process.env.NODE_ENV || "development",
  agenticBuilderApi:
    process.env.AGENT_BUILDER_API_URL || "http://192.168.30.23:8000",
};
