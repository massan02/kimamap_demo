import { PlanAgentState } from "../state";
import { calculateRoute, TravelMode } from "../../tools/directions";

export async function routerNode(state: typeof PlanAgentState.State) {
  const { plan, startingLocation, transportation, returnToStart } = state;

  if (!plan || !plan.spots || plan.spots.length === 0) {
    console.error("[Router] No plan to route.");
    return { error: "No plan generated." };
  }

  console.log(`[Router] Calculating accurate route for ${plan.spots.length} spots...`);

  // Prepare waypoints
  const origin = `${startingLocation.lat},${startingLocation.lng}`;
  
  // Destination: Last spot (or origin if returnToStart is true)
  // Waypoints: All spots except the last one
  
  let destination: string;
  let waypoints: string[] = [];

  if (returnToStart) {
    destination = origin;
    // All spots are waypoints
    waypoints = plan.spots.map(s => `${s.location.lat},${s.location.lng}`);
  } else {
    const lastSpot = plan.spots[plan.spots.length - 1];
    destination = `${lastSpot.location.lat},${lastSpot.location.lng}`;
    
    // Waypoints are all spots EXCEPT the last one
    waypoints = plan.spots.slice(0, -1).map(s => `${s.location.lat},${s.location.lng}`);
  }

  try {
    const routeResult = await calculateRoute(
      origin,
      destination,
      waypoints,
      transportation as TravelMode
    );

    // Calculate total stay duration
    const totalStayDuration = plan.spots.reduce((sum, spot) => sum + (spot.stayDuration || 0), 0);

    // Update Plan's total duration with ACCURATE values
    // Total = Stay Time + Travel Time
    const accurateTotalDuration = totalStayDuration + routeResult.totalDurationMinutes;

    console.log(`[Router] Accuracy Check: AI Est=${plan.totalDuration} vs Real=${accurateTotalDuration}`);

    // Return updated state
    return {
      routeResult: routeResult,
      plan: {
        ...plan,
        totalDuration: accurateTotalDuration, // Overwrite with accurate time
      },
    };

  } catch (error) {
    console.error("[Router] Error:", error);
    // If routing fails, we might want to keep the AI's estimated time or flag an error.
    // For now, just return error.
    return { error: "Failed to calculate route." };
  }
}
