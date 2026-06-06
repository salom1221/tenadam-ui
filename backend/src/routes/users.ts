import { Router } from "express";
import { z } from "zod";
import { asyncRoute, HttpError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

export const usersRouter = Router();

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("Ethiopia"),
});

usersRouter.post(
  "/",
  asyncRoute(async (req, res) => {
    const data = createUserSchema.parse(req.body);
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });

    res.status(201).json(user);
  }),
);

usersRouter.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(req.params);
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        assessments: { orderBy: { createdAt: "desc" }, take: 3 },
        fitnessPlans: { orderBy: { createdAt: "desc" }, take: 1 },
        growthGoals: { orderBy: { createdAt: "desc" } },
        passportActivities: { orderBy: { occurredAt: "desc" }, take: 10 },
      },
    });

    if (!user) throw new HttpError(404, "User not found");
    res.json(user);
  }),
);
