/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  workflowApi,
  workflowKeys,
  type CreateWorkflowPayload,
  type UpdateWorkflowPayload,
} from "../api/api";
import type { Workflow } from "../types";

interface UseWorkflowReturn {
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  addWorkflow: (workflow: CreateWorkflowPayload) => Promise<void>;
  uploadWorkflow: (file: File) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  updateWorkflow: (id: string, updates: UpdateWorkflowPayload) => Promise<void>;
  downloadWorkflow: (id: string, filename?: string) => void;
  refetch: () => void;
}

export const useWorkflow = (
  options?: Omit<UseQueryOptions<Workflow[]>, "queryKey" | "queryFn">
): UseWorkflowReturn => {
  const queryClient = useQueryClient();

  // Fetch workflows query
  const {
    data: workflows = [],
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: workflowKeys.lists(),
    queryFn: workflowApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });

  // Create workflow mutation
  const createMutation = useMutation({
    mutationFn: workflowApi.create,
    onSuccess: (newWorkflow) => {
      queryClient.setQueryData<Workflow[]>(workflowKeys.lists(), (old) =>
        old ? [newWorkflow, ...old] : [newWorkflow]
      );
      toast.success("Workflow created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create workflow");
    },
  });

  // Upload workflow mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!file.name.endsWith(".json")) {
        throw new Error("Invalid file type. Please upload a JSON file.");
      }

      const fileContent = await file.text();
      const workflowData = JSON.parse(fileContent);

      if (!workflowData.title || !workflowData.description) {
        throw new Error("Invalid workflow format. Missing required fields.");
      }

      return workflowApi.upload(workflowData);
    },
    onSuccess: (uploadedWorkflow) => {
      queryClient.setQueryData<Workflow[]>(workflowKeys.lists(), (old) =>
        old ? [uploadedWorkflow, ...old] : [uploadedWorkflow]
      );
      toast.success("Workflow uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload workflow");
    },
  });

  // Update workflow mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateWorkflowPayload;
    }) => workflowApi.update(id, updates),
    onSuccess: (updatedWorkflow) => {
      queryClient.setQueryData<Workflow[]>(workflowKeys.lists(), (old) =>
        old?.map((workflow) =>
          workflow._id === updatedWorkflow._id ? updatedWorkflow : workflow
        )
      );
      toast.success("Workflow updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update workflow");
    },
  });

  // Delete workflow mutation
  const deleteMutation = useMutation({
    mutationFn: workflowApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Workflow[]>(workflowKeys.lists(), (old) =>
        old?.filter((workflow) => workflow._id !== deletedId)
      );
      toast.success("Workflow deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete workflow");
    },
  });

  // Combined loading state
  const isLoading =
    isQueryLoading ||
    createMutation.isPending ||
    uploadMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // Error state
  const error = queryError?.message || null;

  // Mutation handlers
  const addWorkflow = useCallback(
    async (workflow: CreateWorkflowPayload) => {
      await createMutation.mutateAsync(workflow);
    },
    [createMutation]
  );

  const uploadWorkflow = useCallback(
    async (file: File) => {
      await uploadMutation.mutateAsync(file);
    },
    [uploadMutation]
  );

  const deleteWorkflow = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const updateWorkflow = useCallback(
    async (id: string, updates: UpdateWorkflowPayload) => {
      await updateMutation.mutateAsync({ id, updates });
    },
    [updateMutation]
  );

  // Download functionality
  const downloadWorkflow = useCallback(
    (id: string, filename?: string) => {
      try {
        const workflow = workflows.find((w) => w._id === id);
        if (!workflow) {
          toast.error("Workflow not found");
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...workflowData } = workflow;
        const jsonString = JSON.stringify(workflowData, null, 2);
        const workflowName = filename || workflow.title || "workflow";
        const downloadFilename = `${workflowName}.json`;

        const blob = new Blob([jsonString], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Workflow downloaded successfully");
      } catch (err) {
        console.error("Download failed:", err);
        toast.error("Failed to download workflow");
      }
    },
    [workflows]
  );

  return {
    workflows,
    isLoading,
    error,
    addWorkflow,
    uploadWorkflow,
    deleteWorkflow,
    updateWorkflow,
    downloadWorkflow,
    refetch,
  };
};
