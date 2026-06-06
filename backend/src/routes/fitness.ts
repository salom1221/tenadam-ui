import { Router } from "express";
import { z } from "zod";
import { asyncRoute } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { buildFitnessPlan } from "../services/wellness.js";

export const fitnessRouter = Router();

const fitnessSchema = z.object({
  userId: z.string().min(1),
  heightCm: z.number().min(80).max(260),
  weightKg: z.number().min(20).max(400),
  activityLevel: z.string().min(1),
  goal: z.string().min(1),
});

fitnessRouter.post(
  "/plans",
  asyncRoute(async (req, res) => {
    const input = fitnessSchema.parse(req.body);
    const plan = buildFitnessPlan(input);

    const fitnessPlan = await prisma.fitnessPlan.create({
      data: { ...input, ...plan },
    });

    res.status(201).json(fitnessPlan);
  }),
);
