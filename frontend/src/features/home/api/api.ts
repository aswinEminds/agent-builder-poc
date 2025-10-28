import { axiosInstance } from "@config/http/http";
import type { Workflow } from "../types";

export type CreateWorkflowPayload = Omit<Workflow, "_id">;
export type UpdateWorkflowPayload = Partial<Workflow>;

// Query Keys
export const workflowKeys = {
  all: ["workflows"] as const,
  lists: () => [...workflowKeys.all, "list"] as const,
  detail: (id: string) => [...workflowKeys.all, "detail", id] as const,
};

// API Functions
export const workflowApi = {
  getAll: async (): Promise<Workflow[]> => {
    const response = await axiosInstance.get("/workflows");
    return response.data.data || response.data;
  },

  create: async (workflow: CreateWorkflowPayload): Promise<Workflow> => {
    const response = await axiosInstance.post("/workflows", workflow);
    return response.data.data;
  },

  update: async (
    id: string,
    updates: UpdateWorkflowPayload
  ): Promise<Workflow> => {
    const response = await axiosInstance.put(`/workflows/${id}`, updates);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/workflows/${id}`);
  },

  upload: async (workflowData: CreateWorkflowPayload): Promise<Workflow> => {
    const response = await axiosInstance.post("/workflows", workflowData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data.data;
  },
};
