import { GoogleGenAI } from "@google/genai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { PlanAgentState, Plan } from "../state";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// JSON Format Template
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
  "totalDuration": "number - Estimated total duration in minutes"
}
`;

export async function plannerNode(state: typeof PlanAgentState.State) {
  const { query, transportation, durationLimit, startingLocation, returnToStart, messages, retryCount } = state;

  console.log(`[Planner] Generating plan (Retry: ${retryCount})...`);

  let prompt = "";

  if (messages.length === 0) {
    // First attempt: Full Prompt
    prompt = `
You are a travel guide AI for Fukuoka, Japan.
Create a travel plan based on the user's request using real places from Google Maps.

User Request:
- Query (Mood/Interest): "${query}"
- Transportation: ${transportation}
- Available Time: ${durationLimit} minutes
- Return to Start: ${returnToStart}
- Starting Location: latitude ${startingLocation.lat}, longitude ${startingLocation.lng}

Instructions:
1. Use Google Maps to find real places in Fukuoka that match the user's query AND are located reasonably close to the "Starting Location".
2. Select appropriate spots considering the available time (${durationLimit} min).
   - Aim for a total duration of 90% to 100% of the limit.
   - Consider travel times between spots.
3. Order them logically to create an efficient route STARTING FROM the "Starting Location".
4. Ensure the plan is realistic and enjoyable.

IMPORTANT: Return ONLY a valid JSON object.
${expectedJsonFormat}
`;
  } else {
    // Retry attempt: Context is already in messages, just give the new instruction
    // The last message in 'messages' should be the feedback from Reviewer.
    const lastMessage = messages[messages.length - 1];
    prompt = `
    (User Feedback / System Instruction)
    ${lastMessage.content}
    
    Please fix the plan according to the instruction above.
    Return ONLY a valid JSON object.
    ${expectedJsonFormat}
    `;
  }

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        // We need to construct the conversation history properly for Gemini SDK
        // For simplicity in this MVP, we just send the prompt as a single turn or appended text.
        // Ideally, we should map LangChain messages to Gemini content format.
        {
          parts: [{ text: prompt }],
        },
      ],
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const responseText = result.text;
    if (!responseText) throw new Error("Empty response from AI");

    // Clean up JSON
    let cleaned = responseText.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const planData = JSON.parse(cleaned) as Plan;

    // Return updated state
    return {
      plan: planData,
      // Append the new AI response to history
      messages: [new AIMessage(responseText)],
    };

  } catch (error) {
    console.error("[Planner] Error:", error);
    return {
      error: "Failed to generate plan.",
    };
  }
}
