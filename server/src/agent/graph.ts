import { StateGraph, END } from "@langchain/langgraph";
import { PlanAgentState } from "./state";
import { plannerNode } from "./nodes/planner";
import { routerNode } from "./nodes/router";
import { reviewerNode } from "./nodes/reviewer";

// Define the Graph
const workflow = new StateGraph(PlanAgentState)
  // Add Nodes
  .addNode("planner", plannerNode)
  .addNode("router", routerNode)
  .addNode("reviewer", reviewerNode)

  // Add Edges (Flow)
  .addEdge("__start__", "planner")
  .addEdge("planner", "router")
  .addEdge("router", "reviewer")

  // Conditional Edge from Reviewer
  .addConditionalEdges(
    "reviewer",
    (state) => {
      // If a new message (feedback) was added by Reviewer, it means we need to retry.
      const lastMessage = state.messages[state.messages.length - 1];
      const isRetryInstruction = lastMessage && lastMessage._getType() === "human";
      
      if (isRetryInstruction) {
        return "planner"; // Go back to Planner
      }
      return "__end__"; // Finish
    },
    {
      planner: "planner",
      __end__: END,
    }
  );

// Compile the graph
export const planAgent = workflow.compile();
