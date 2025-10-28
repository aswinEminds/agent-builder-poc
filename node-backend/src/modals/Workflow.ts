import mongoose, { Schema, Document } from "mongoose";

export interface INode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    [key: string]: any;
  };
}

export interface IEdge {
  id: string;
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
  type?: string;
  animated?: boolean;
  style?: {
    [key: string]: any;
  };
  markerEnd?: {
    type?: string;
    color?: string;
  };
  data?: {
    [key: string]: any;
  };
}

export interface IWorkflow extends Document {
  title: string;
  version: string;
  description: string;
  icons: string;
  nodes: INode[];
  edges: IEdge[];
  [key: string]: any;
  createdAt: Date;
  updatedAt: Date;
}

const NodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { strict: false }
);

const EdgeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    sourceHandle: { type: String, default: null },
    target: { type: String, required: true },
    targetHandle: { type: String, default: null },
    type: { type: String },
    animated: { type: Boolean, default: false },
    style: { type: Schema.Types.Mixed, default: {} },
    markerEnd: {
      type: {
        type: String,
      },
      color: String,
    },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { strict: false }
);

const WorkflowSchema = new Schema(
  {
    title: { type: String, required: true },
    version: { type: String, required: true, default: "1.0.0" },
    description: { type: String, default: "" },
    icons: { type: String, default: "" },
    nodes: [NodeSchema],
    edges: [EdgeSchema],
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const WorkflowModel = mongoose.model<IWorkflow>(
  "Workflow",
  WorkflowSchema
);
