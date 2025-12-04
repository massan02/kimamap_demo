import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export type TravelMode = "walking" | "bicycling" | "driving";

export interface RouteLeg {
  startAddress: string;
  endAddress: string;
  distanceMeters: number;
  durationMinutes: number; // Rounded to nearest minute
  polyline: string; // Encoded polyline for this leg
}

export interface RouteResult {
  totalDistanceMeters: number;
  totalDurationMinutes: number;
  overviewPolyline: string; // Encoded polyline for the entire route
  legs: RouteLeg[];
}

/**
 * Calculate route using Google Maps Directions API.
 * This tool is designed to be used by an AI Agent.
 */
export async function calculateRoute(
  origin: string,
  destination: string,
  waypoints: string[] = [],
  mode: TravelMode = "driving"
): Promise<RouteResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set in environment variables.");
  }

  // Construct API URL
  const baseUrl = "https://maps.googleapis.com/maps/api/directions/json";
  const params = new URLSearchParams({
    origin: origin,
    destination: destination,
    mode: mode,
    key: GOOGLE_MAPS_API_KEY,
  });

  if (waypoints.length > 0) {
    // "optimize:true" would reorder waypoints for efficiency.
    // For now, we respect the AI's order, so we don't use optimize:true.
    params.append("waypoints", waypoints.join("|"));
  }

  const url = `${baseUrl}?${params.toString()}`;
  console.log(`[DirectionsTool] Fetching route: ${origin} -> ${destination} (${waypoints.length} waypoints)`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("[DirectionsTool] API Error:", data);
      throw new Error(`Google Directions API Error: ${data.status} - ${data.error_message || ""}`);
    }

    const route = data.routes[0];
    const result: RouteResult = {
      totalDistanceMeters: 0,
      totalDurationMinutes: 0,
      overviewPolyline: route.overview_polyline.points,
      legs: [],
    };

    // Parse legs (segments between waypoints)
    if (route.legs) {
      route.legs.forEach((leg: any) => {
        const durationMin = Math.round(leg.duration.value / 60);
        
        result.totalDistanceMeters += leg.distance.value;
        result.totalDurationMinutes += durationMin;

        result.legs.push({
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          distanceMeters: leg.distance.value,
          durationMinutes: durationMin,
          // Note: Individual leg polylines are inside "steps", but overview_polyline is usually sufficient for display.
          // If needed, we could decode step polylines, but it's complex. 
          // For this tool, we return the overview_polyline as the main visual.
          polyline: "", 
        });
      });
    }

    return result;

  } catch (error) {
    console.error("[DirectionsTool] Network or Parse Error:", error);
    throw error;
  }
}
