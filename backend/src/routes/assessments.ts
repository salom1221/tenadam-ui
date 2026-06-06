import { Router } from "express";
import { WorkType } from "@prisma/client";
import { z } from "zod";
import { asyncRoute } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { buildCoachPlan, calculateWellnessScores } from "../services/wellness.js";

export const assessmentsRouter = Router();

const assessmentSchema = z.object({
  userId: z.string().min(1),
  workType: z.nativeEnum(WorkType),
  sleepHours: z.number().min(0).max(16),
  stressLevel: z.number().int().min(1).max(10),
  socialActivityLevel: z.number().int().min(1).max(10),
  exerciseMinutesPerWeek: z.number().int().min(0).max(3000),
  nutritionQuality: z.number().int().min(1).max(10),
  goals: z.array(z.string().min(1)).default([]),
});

assessmentsRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const input = assessmentSchema.parse(req.body);
    const scores = calculateWellnessScores(input);
    const coachPlan = buildCoachPlan(input);

    const assessment = await prisma.wellnessAssessment.create({
      data: {
        ...input,
        ...scores,
        coachPlans: {
          create: coachPlan,
        },
      },
      include: { coachPlans: true },
    });

    res.status(201).json(assessment);
  }),
);

assessmentsRouter.get(
  "/user/:userId",
  asyncRoute(async (req, res) => {
    const { userId } = z.object({ userId: z.string().min(1) }).parse(req.params);
    const assessments = await prisma.wellnessAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { coachPlans: true, recommendations: { include: { offer: { include: { provider: true } } } } },
    });

    res.json(assessments);
  }),
);
