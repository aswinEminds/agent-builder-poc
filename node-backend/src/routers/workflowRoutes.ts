import { Router } from "express";
import { WorkflowController } from "../controllers/workflowController";

const router = Router();

// Create a new workflow
router.post("/workflows", WorkflowController.createWorkflow);

// Get all workflows
router.get("/workflows", WorkflowController.getAllWorkflows);

// Get workflow by ID
router.get("/workflows/:id", WorkflowController.getWorkflowById);

// Update workflow
router.put("/workflows/:id", WorkflowController.updateWorkflow);

// Delete workflow
router.delete("/workflows/:id", WorkflowController.deleteWorkflow);

//Excecute
router.post("/workflows/:id/execute", WorkflowController.executeWorkflow);

export default router;
