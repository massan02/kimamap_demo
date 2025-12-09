import { Router } from "express";
import { z } from "zod";
import { planAgent } from "../agent/graph";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = Router();

// Validation Schema
const PlanRequestSchema = z.object({
  query: z.string().min(1, "Query is required"),
  transportation: z.enum(["walk", "bicycle", "car"]),
  duration: z.number().min(30, "Duration must be at least 30 minutes"),
  returnToStart: z.boolean(),
  startingLocation: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

// POST /api/plan
router.post("/", async (req, res) => {
  try {
    // Validate Request
    const validatedData = PlanRequestSchema.parse(req.body);
    const { query, transportation, duration, returnToStart, startingLocation } = validatedData;

    console.log("Received Plan Request:", validatedData);

    // Initialize Agent State
    const initialState = {
      query,
      transportation,
      durationLimit: duration,
      startingLocation,
      returnToStart,
    };

    console.log("Invoking Plan Agent...");
    
    // Run the Agent
    const finalState = await planAgent.invoke(initialState);

    // Check for errors in Agent execution
    if (finalState.error) {
      console.error("Agent Error:", finalState.error);
      return res.status(500).json({
        error: "Plan Generation Failed",
        details: finalState.error,
      });
    }

    if (!finalState.plan) {
      return res.status(500).json({
        error: "Plan Generation Failed",
        details: "Agent completed but produced no plan.",
      });
    }

    console.log("Plan Generated successfully!");

    res.status(200).json({
      message: "Plan created by AI Agent",
      request: validatedData,
      plan: {
        title: finalState.plan.title,
        spots: finalState.plan.spots,
        totalDuration: finalState.plan.totalDuration,
      },
      // New Data from Agent
      routeResult: finalState.routeResult,
      isOverTime: finalState.isOverTime,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.issues,
      });
    }

    console.error("Server Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
