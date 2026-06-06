import { Router } from "express";
import { GoalCategory } from "@prisma/client";
import { z } from "zod";
import { asyncRoute } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { buildGrowthPlan } from "../services/wellness.js";

export const goalsRouter = Router();

const goalSchema = z.object({
  userId: z.string().min(1),
  category: z.nativeEnum(GoalCategory),
  statement: z.string().min(3),
  targetDate: z.coerce.date().optional(),
});

goalsRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const input = goalSchema.parse(req.body);
    const plan = buildGrowthPlan(input.statement, input.category);
    const goal = await prisma.growthGoal.create({
      data: { ...input, ...plan },
    });

    res.status(201).json(goal);
  }),
);
