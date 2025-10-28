/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect } from "react";
import {
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  type Connection,
  addEdge,
  useReactFlow,
} from "reactflow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  fetchWorkflow as apiFetchWorkflow,
  updateWorkflow as apiUpdateWorkflow,
  createWorkflow as apiCreateWorkflow,
  executeWorkflow as apiExecuteWorkflow,
} from "../api/api";
import type { Workflow as WorkflowData } from "@/features/home/types";
import { NODE_CATEGORIES } from "../types";

export const useWorkflow = (workflowId?: string) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();
  const queryClient = useQueryClient();

  // Fetch workflow query
  const {
    data: workflowData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: () => apiFetchWorkflow(workflowId!),
    enabled: !!workflowId,
  });

  // Update nodes and edges when workflow data changes
  useEffect(() => {
    if (workflowData) {
      if (workflowData.nodes) setNodes(workflowData.nodes);
      if (workflowData.edges) setEdges(workflowData.edges);
    }
  }, [workflowData, setNodes, setEdges]);

  // Update workflow mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowData> }) =>
      apiUpdateWorkflow(id, data),
    onSuccess: (data: WorkflowData) => {
      queryClient.setQueryData(["workflow", data._id], data);
      if (data.nodes) setNodes(data.nodes);
      if (data.edges) setEdges(data.edges);
    },
  });

  // Create workflow mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<WorkflowData, "id">) => apiCreateWorkflow(data),
    onSuccess: (data: WorkflowData) => {
      queryClient.setQueryData(["workflow", data._id], data);
      if (data.nodes) setNodes(data.nodes);
      if (data.edges) setEdges(data.edges);
    },
  });

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: (id: string) => apiExecuteWorkflow(id),
    onSuccess: (data) => {
      console.log("Workflow executed successfully:", data);
      toast.success("Workflow executed successfully!");
    },
    onError: (error: any) => {
      console.error("Workflow execution failed:", error);
      toast.error("Failed to execute workflow!");
    },
  });

  const error = queryError
    ? (queryError as any).response?.data?.message ||
      (queryError as any).message ||
      "Failed to fetch workflow"
    : null;

  // UPDATED: onConnect to create two edges when tool node is involved
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => {
        const sourceNode = nodes.find((node) => node.id === params.source);
        const targetNode = nodes.find((node) => node.id === params.target);

        const isToolInvolved =
          sourceNode?.data?.category === NODE_CATEGORIES.TOOLS ||
          targetNode?.data?.category === NODE_CATEGORIES.TOOLS;

        console.log(
          "Creating edge(s):",
          params,
          "Tool involved:",
          isToolInvolved,
          "Source Node:",
          sourceNode,
          "Target Node:",
          targetNode
        );

        const newEdges: Edge[] = [];

        if (isToolInvolved) {
          // Create TWO BIDIRECTIONAL edges for tool connections
          const timestamp = Date.now();

          // Forward edge: source → target
          const forwardEdge: Edge = {
            id: `edge-${params.source}-to-${params.target}-forward-${timestamp}`,
            source: params.source!,
            target: params.target!,
            sourceHandle: params.sourceHandle || null,
            targetHandle: params.targetHandle || null,
            type:
              targetNode?.data?.category === NODE_CATEGORIES.TOOLS
                ? "conditional"
                : "simple",
          };
          newEdges.push(forwardEdge);

          // Backward edge: target → source (REVERSED)
          const backwardEdge: Edge = {
            id: `edge-${params.target}-to-${params.source}-backward-${timestamp}`,
            source: params.target!, // SWAPPED
            target: params.source!, // SWAPPED
            sourceHandle: params.targetHandle || null, // SWAPPED
            targetHandle: params.sourceHandle || null, // SWAPPED
            type:
              sourceNode?.data?.category === NODE_CATEGORIES.TOOLS
                ? "conditional"
                : "simple",
          };
          newEdges.push(backwardEdge);
        } else {
          // Regular connection - single simple edge
          const regularEdge: Edge = {
            id: `${params.source}-${params.sourceHandle || "output"}-${params.target}-${params.targetHandle || "input"}-${Date.now()}`,
            source: params.source!,
            target: params.target!,
            sourceHandle: params.sourceHandle || null,
            targetHandle: params.targetHandle || null,
            type: "simple",
          };
          newEdges.push(regularEdge);
        }

        // Add all new edges to the existing edges
        let updatedEdges = [...eds];
        newEdges.forEach((edge) => {
          updatedEdges = addEdge(edge, updatedEdges);
        });

        return updatedEdges;
      });
    },
    [nodes, setEdges]
  );
  // Rest of your existing functions
  const fetchWorkflow = useCallback(
    async (id: string) => {
      if (!id) return;
      const result = await refetch();
      return result.data;
    },
    [refetch]
  );

  const updateWorkflow = useCallback(
    async (updates?: Partial<WorkflowData>) => {
      if (!workflowId) throw new Error("Workflow ID is required for update");

      const updatePayload = updates || {
        title: workflowData?.title || "Untitled Workflow",
        version: workflowData?.version || "1.0.0",
        description: workflowData?.description || "",
        icons: workflowData?.icons || "",
        nodes,
        edges,
      };

      return await updateMutation.mutateAsync({
        id: workflowId,
        data: updatePayload,
      });
    },
    [workflowId, workflowData, nodes, edges, updateMutation]
  );

  const saveWorkflow = useCallback(
    async (customData?: Partial<WorkflowData>) => {
      try {
        const savedWorkflow = await updateWorkflow(customData);
        toast.success("Workflow saved successfully!");
        return savedWorkflow;
      } catch (err) {
        toast.error("Failed to save workflow!");
        throw err;
      }
    },
    [updateWorkflow]
  );

  const executeWorkflow = useCallback(async () => {
    if (!workflowId) {
      toast.error("No workflow ID available for execution");
      return;
    }

    try {
      // First save the current workflow state
      await saveWorkflow();
      // Then execute the workflow
      await executeWorkflowMutation.mutateAsync(workflowId);
    } catch (err) {
      console.error("Workflow execution error:", err);
      // Error handling is already done in the mutation onError
    }
  }, [workflowId, saveWorkflow, executeWorkflowMutation]);

  const addNode = useCallback(
    (node: Node) => {
      setNodes((nds) => nds.concat(node));
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow/nodeType");
      const category = event.dataTransfer.getData(
        "application/reactflow/nodeCategory"
      );

      if (!type) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: type,
        position,
        data: { category: category },
      };

      addNode(newNode);
    },
    [addNode, project]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const resetWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const createNewWorkflow = useCallback(
    async (workflowData: Omit<WorkflowData, "id">) => {
      return await createMutation.mutateAsync(workflowData);
    },
    [createMutation]
  );

  return {
    nodes,
    edges,
    workflowData: workflowData || null,
    isLoading,
    error,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    saveWorkflow,
    executeWorkflow,
    addNode,
    deleteNode,
    updateNodeData,
    fetchWorkflow,
    updateWorkflow,
    resetWorkflow,
    createNewWorkflow,
    setNodes,
    setEdges,
    isExecuting: executeWorkflowMutation.isPending,
  };
};
