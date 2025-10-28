import { Request, Response } from "express";
import { WorkflowModel } from "../modals/Workflow";
import axios from "axios";
import { config } from "../config/env";

export class WorkflowController {
  // Create a new workflow
  public static async createWorkflow(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { title, version, description, icons, nodes, edges, metadata } =
        req.body;

      const workflow = new WorkflowModel({
        title,
        version: version || "1.0.0",
        description: description || "",
        icons: icons || "",
        nodes: nodes || [],
        edges: edges || [],
        metadata: metadata || {},
      });

      const savedWorkflow = await workflow.save();

      res.status(201).json({
        success: true,
        data: savedWorkflow,
        message: "Workflow created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating workflow",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get all workflows
  public static async getAllWorkflows(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const workflows = await WorkflowModel.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: workflows,
        count: workflows.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching workflows",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get workflow by ID
  public static async getWorkflowById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const workflow = await WorkflowModel.findById(id);

      if (!workflow) {
        res.status(404).json({
          success: false,
          message: "Workflow not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: workflow,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching workflow",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update workflow
  public static async updateWorkflow(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const workflow = await WorkflowModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!workflow) {
        res.status(404).json({
          success: false,
          message: "Workflow not found",
        });
        return;
      }

      const filteredWorkflow = {
        id: workflow._id,
        title: workflow.title,
        metadata: workflow.metadata,
        nodes: workflow.nodes.map((node: any) => ({
          id: node.id,
          type: node.type,
          data: node.data,
        })),
        edges: workflow.edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          sourceHandle: edge.sourceHandle,
          target: edge.target,
          targetHandle: edge.targetHandle,
          type: edge.type,
        })),
      };

      const generate = await axios.post(
        `${config.agenticBuilderApi}/generate`,
        filteredWorkflow
      );

      console.log(generate.data, "helloo");

      res.status(200).json({
        success: true,
        data: generate.data,
        message: "Workflow updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating workflow",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Delete workflow
  public static async deleteWorkflow(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const workflow = await WorkflowModel.findByIdAndDelete(id);

      if (!workflow) {
        res.status(404).json({
          success: false,
          message: "Workflow not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Workflow deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting workflow",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Execute workflow - Get filtered workflow data for execution
  public static async executeWorkflow(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { input } = req.body;

      console.log(`Executing workflow ${id} with input:`, input);

      // Add timeout to axios request (60 seconds)
      const generate = await axios.post(
        `${config.agenticBuilderApi}/workflows/${id}/execute`,
        {
          message: input,
        },
        {
          timeout: 60000, // 60 seconds timeout
        }
      );

      console.log("Workflow execution response:", generate.data);

      // Handle different response structures
      let responseData;
      if (generate.data?.response) {
        responseData = generate.data.response;
      } else if (generate.data?.data) {
        responseData = generate.data.data;
      } else {
        responseData = generate.data;
      }

      res.status(200).json({
        success: true,
        data: responseData,
        message: "Workflow executed successfully",
      });
    } catch (error: any) {
      console.error("Workflow execution error:", error);

      // Provide more detailed error information
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;

        res.status(statusCode).json({
          success: false,
          message: "Error executing workflow",
          error: errorMessage,
          details: error.response?.data,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Error executing workflow",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }
}
