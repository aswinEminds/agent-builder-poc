import type { Node, Edge } from "reactflow";

export interface Workflow {
  _id: string;
  title: string;
  version: string;
  description: string;
  icons: string;
  nodes?: Node[];
  edges?: Edge[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface RecentWorkflowsProps {
  workflows?: Workflow[];
}
