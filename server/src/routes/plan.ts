import { Router } from "express";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = Router();

// Initialize Google Gen AI SDK
// Note: In a real app, ensure GEMINI_API_KEY is set in server/.env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

// Expected JSON output format (used in prompt, not as responseSchema)
// Note: Google Maps grounding doesn't support JSON mode (responseMimeType: "application/json")
// So we instruct the model via prompt to return JSON format
const expectedJsonFormat = `
{
  "title": "string - A creative title for the plan",
  "spots": [
    {
      "name": "string - Name of the place",
      "description": "string - Brief description and why it matches the user's interest",
      "stayDuration": "number - Recommended stay duration in minutes",
      "location": {
        "lat": "number - Latitude",
        "lng": "number - Longitude"
      },
      "address": "string - Full address of the place"
    }
  ],
  "totalDuration": "number - Total estimated duration in minutes including travel time"
}
`;

// POST /api/plan
router.post("/", async (req, res) => {
  try {
    // Validate Request
    const validatedData = PlanRequestSchema.parse(req.body);
    const { query, transportation, duration, returnToStart, startingLocation } = validatedData;

    console.log("Received Plan Request:", validatedData);

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set.");
      return res
        .status(500)
        .json({ error: "Server Configuration Error: API Key missing" });
    }

    // Construct Prompt
    const prompt = `
You are a travel guide AI for Fukuoka, Japan.
Create a travel plan based on the user's request using real places from Google Maps.

User Request:
- Query (Mood/Interest): "${query}"
- Transportation: ${transportation}
- Available Time: ${duration} minutes
- Return to Start: ${returnToStart}
- Starting Location: latitude ${startingLocation.lat}, longitude ${startingLocation.lng}

**CRITICAL INSTRUCTIONS for Google Maps Tool Usage:**
1.  **Search**: Find real places in Fukuoka that match the user's query **AND are located reasonably close to the "Starting Location"**.
2.  **Route Calculation**: You MUST use the Google Maps Routing capabilities to calculate the *exact* travel time and route distance between each spot.
    *   **Calculate the route STARTING FROM the "Starting Location"** to the first spot.
    *   Include this initial travel time in the total duration.
    *   **DO NOT estimate travel times** based on straight-line distance or average speeds.
    *   **DO NOT assume** constant speeds (e.g., "80m/min"). Use actual road network data.
    *   Take into account the specified transportation mode: ${transportation}.
3.  **Optimization**: Order the spots to create a logical, efficient route **starting from the "Starting Location"** that fits within the "Available Time".
4.  **Verification**: If the calculated total duration (stay time + *actual* travel time) exceeds the limit, reduce the number of spots.

**Output Format:**
Return ONLY a valid JSON object.
The JSON must follow this exact format:
${expectedJsonFormat}
`;

    console.log("Calling Gemini API...");
    
    // Call API with new SDK
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        tools: [
          // @ts-ignore: googleMaps is supported but might not be in types yet or requires specific config
          { googleMaps: {} }
        ],
      },
    });

    const responseText = result.text;
    console.log("Gemini Response:", responseText);

    if (!responseText) {
       throw new Error("Empty response from AI");
    }

    // Clean up response text (remove markdown code blocks if present)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.slice(7);
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw AI Response:", responseText); // Log the raw text for debugging
      return res.status(422).json({
        error: "AI Response Error",
        message: "The AI failed to generate a valid plan. Please try again.",
        details: "Invalid JSON format received from AI.",
      });
    }

    res.status(200).json({
      message: "Plan created by AI with Google Maps grounding",
      request: validatedData,
      plan: {
        title: aiResponse.title,
        spots: aiResponse.spots,
        totalDuration: aiResponse.totalDuration,
      },
      // Accessing grounding metadata from candidates
      groundingMetadata: result.candidates?.[0]?.groundingMetadata || null,
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
