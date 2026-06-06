import { Router } from "express";
import { PassportActivityType } from "@prisma/client";
import { z } from "zod";
import { asyncRoute } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

export const passportRouter = Router();

const activitySchema = z.object({
  userId: z.string().min(1),
  type: z.nativeEnum(PassportActivityType),
  description: z.string().min(1),
  points: z.number().int().positive(),
  occurredAt: z.coerce.date().optional(),
});

passportRouter.post(
  "/activities",
  asyncRoute(async (req, res) => {
    const input = activitySchema.parse(req.body);
    const activity = await prisma.passportActivity.create({ data: input });
    res.status(201).json(activity);
  }),
);

passportRouter.get(
  "/users/:userId",
  asyncRoute(async (req, res) => {
    const { userId } = z.object({ userId: z.string().min(1) }).parse(req.params);
    const activities = await prisma.passportActivity.findMany({
      where: { userId },
      orderBy: { occurredAt: "desc" },
    });

    const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0);
    res.json({ userId, totalPoints, activities });
  }),
);
