import { Router } from "express";
import { ProviderType } from "@prisma/client";
import { z } from "zod";
import { asyncRoute, HttpError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

export const marketplaceRouter = Router();

const providerSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(ProviderType),
  city: z.string().min(1),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  offers: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        price: z.number().positive().optional(),
        pointsCost: z.number().int().positive().optional(),
      }),
    )
    .default([]),
});

marketplaceRouter.post(
  "/providers",
  asyncRoute(async (req, res) => {
    const input = providerSchema.parse(req.body);
    const provider = await prisma.provider.create({
      data: {
        ...input,
        offers: { create: input.offers },
      },
      include: { offers: true },
    });

    res.status(201).json(provider);
  }),
);

marketplaceRouter.get(
  "/offers",
  asyncRoute(async (req, res) => {
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const offers = await prisma.providerOffer.findMany({
      where: { active: true, provider: city ? { city: { equals: city, mode: "insensitive" } } : undefined },
      include: { provider: true },
      orderBy: { title: "asc" },
    });

    res.json(offers);
  }),
);

marketplaceRouter.post(
  "/recommend/:assessmentId",
  asyncRoute(async (req, res) => {
    const { assessmentId } = z.object({ assessmentId: z.string().min(1) }).parse(req.params);
    const assessment = await prisma.wellnessAssessment.findUnique({
      where: { id: assessmentId },
      include: { user: true },
    });
    if (!assessment) throw new HttpError(404, "Assessment not found");

    const wantsStressRelief = assessment.stressLevel >= 7 || assessment.sleepHours < 6;
    const providerTypes = wantsStressRelief ? [ProviderType.SPA, ProviderType.MASSAGE, ProviderType.RETREAT, ProviderType.YOGA] : [ProviderType.GYM, ProviderType.SPORTS, ProviderType.COMMUNITY];

    const offers = await prisma.providerOffer.findMany({
      where: {
        active: true,
        provider: {
          city: assessment.user.city ? { equals: assessment.user.city, mode: "insensitive" } : undefined,
          type: { in: providerTypes },
        },
      },
      include: { provider: true },
      take: 5,
    });

    const recommendations = await Promise.all(
      offers.map((offer, index) =>
        prisma.recommendation.create({
          data: {
            assessmentId: assessment.id,
            offerId: offer.id,
            priority: index + 1,
            reason: wantsStressRelief
              ? "High stress or low sleep detected. Recovery-focused providers may help."
              : "Your profile can benefit from active recreation and community wellness.",
          },
          include: { offer: { include: { provider: true } } },
        }),
      ),
    );

    res.status(201).json(recommendations);
  }),
);

marketplaceRouter.post(
  "/leads",
  asyncRoute(async (req, res) => {
    const input = z
      .object({
        userId: z.string().min(1),
        providerId: z.string().min(1),
        note: z.string().optional(),
      })
      .parse(req.body);

    const lead = await prisma.providerLead.create({ data: input, include: { provider: true, user: true } });
    res.status(201).json(lead);
  }),
);
