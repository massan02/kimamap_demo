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

Instructions:
1. Use Google Maps to find real places in Fukuoka that match the user's query/mood/interest.
2. Select appropriate spots considering the available time and transportation method.
3. Order them logically to create an efficient route starting near the "Starting Location".
4. Consider travel time between spots (approximate speeds: Walk=80m/min, Bike=250m/min, Car=400m/min).
5. Ensure the total duration (stay time + travel time) does not exceed "Available Time".
6. For each spot, provide the name, description, recommended stay duration, location coordinates, and address.
7. If returning to start is required, factor in the return travel time.

IMPORTANT: Return ONLY a valid JSON object (no markdown, no code blocks, no explanation).
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

    const aiResponse = JSON.parse(cleanedResponse);

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
