import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Validation Schema
const PlanRequestSchema = z.object({
  query: z.string().min(1, "Query is required"),
  transportation: z.enum(['walk', 'bicycle', 'car']),
  duration: z.number().min(30, "Duration must be at least 30 minutes"),
  returnToStart: z.boolean(),
  startingLocation: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

// POST /api/plan
router.post('/', async (req, res) => {
  try {
    // Validate Request
    const validatedData = PlanRequestSchema.parse(req.body);
    
    console.log('Received Plan Request:', validatedData);

    // TODO: Implement AI Logic (Phase 3-4)
    // For now, return a dummy response
    
    res.status(200).json({
      message: "Plan request received",
      data: validatedData,
      // Mock plan data will be added in Phase 3-3
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.issues, // ZodError uses .issues, or .errors depending on version/type, but usually .issues is safer or cast it
      });
    }
    
    console.error('Server Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
