export type Status = "experimental" | "prototype" | "research" | "planned" | "deprecated";
export type MilestoneStatus = "shipped" | "in-progress" | "planned";

export interface Milestone {
  version: string;
  label: string;
  status: MilestoneStatus;
  detail?: string;
}

export interface RoadmapEntry {
  version: string;
  label: string;
  shipped: boolean;
}

export interface Primitive {
  id: string;
  name: string;
  tagline: string;
  description: string;
  command: string;
  icon: string;
  shipped: boolean;
  relatedPrimitives?: string[];
}

export interface ResearchArea {
  id: string;
  title: string;
  status: Status;
  description: string;
  tags: string[];
  secondaryStatus?: Status;
}

export interface CapsuleEntry {
  project: string;
  useCase: string;
  snippet: string[];
  repo: string;
  tags: string[];
}

export type PostCategory = "lab-update" | "technical" | "release";
