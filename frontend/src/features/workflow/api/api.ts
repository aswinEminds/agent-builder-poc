// api/workflow.api.ts
import type { Workflow } from "@/features/home/types";
import { axiosInstance } from "@config/http/http";

/**
 * Fetch a workflow by ID
 */
export const fetchWorkflow = async (id: string): Promise<Workflow> => {
  const response = await axiosInstance.get(`/workflows/${id}`);
  return response.data.data || response.data;
};

/**
 * Update an existing workflow
 */
export const updateWorkflow = async (
  id: string,
  data: Partial<Workflow>
): Promise<Workflow> => {
  const response = await axiosInstance.put(`/workflows/${id}`, data);
  return response.data.data || response.data;
};

/**
 * Create a new workflow
 */
export const createWorkflow = async (
  data: Omit<Workflow, "id">
): Promise<Workflow> => {
  const response = await axiosInstance.post("/workflows", data);
  return response.data.data || response.data;
};

export const executeWorkflow = async (id: string): Promise<void> => {
  const response = await axiosInstance.post(`/workflows/${id}/execute`);
  return response.data.data || response.data;
};
