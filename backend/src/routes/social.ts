import { Router } from "express";
import { z } from "zod";
import { asyncRoute } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { buildSocialRecommendations } from "../services/wellness.js";

export const socialRouter = Router();

const socialSchema = z.object({
  userId: z.string().min(1),
  tendency: z.string().min(1),
  mood: z.string().min(1),
  lonelinessLevel: z.number().int().min(1).max(10),
  interests: z.array(z.string().min(1)).default([]),
});

socialRouter.post(
  "/profiles",
  asyncRoute(async (req, res) => {
    const input = socialSchema.parse(req.body);
    const recommendations = buildSocialRecommendations(input);
    const profile = await prisma.socialProfile.create({
      data: { ...input, recommendations },
    });

    res.status(201).json(profile);
  }),
);
