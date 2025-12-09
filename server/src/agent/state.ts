import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { RouteResult } from "../tools/directions";

// Define the structure of a Spot (simplified for Agent)
export interface Spot {
  name: string;
  description: string;
  stayDuration: number;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
}

// Define the structure of the Plan
export interface Plan {
  title: string;
  spots: Spot[];
  totalDuration: number; // Estimated by AI initially, then updated by Router
}

// Define the Agent State
export const PlanAgentState = Annotation.Root({
  // Inputs
  query: Annotation<string>(),
  transportation: Annotation<string>(),
  durationLimit: Annotation<number>(),
  startingLocation: Annotation<{ lat: number; lng: number }>(),
  returnToStart: Annotation<boolean>(),

  // Conversation History (for retries)
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),

  // Intermediate & Final Outputs
  plan: Annotation<Plan | null>(),
  routeResult: Annotation<RouteResult | null>(),
  
  // Flags & Metadata
  retryCount: Annotation<number>({
    reducer: (x, y) => y, // Always take the latest value
    default: () => 0,
  }),
  isOverTime: Annotation<boolean>(), // True if duration > limit (Soft Limit)
  error: Annotation<string | null>(),
});
