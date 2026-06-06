import { Router } from "express";
import { GoalCategory, PassportActivityType, ProviderType, WorkType } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../lib/auth.js";
import { asyncRoute, HttpError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { generateLlmWellnessPlan } from "../services/llm-wellness.js";
import {
  buildCoachPlan,
  buildFitnessPlan,
  buildGrowthPlan,
  buildSocialRecommendations,
  calculateWellnessScores,
} from "../services/wellness.js";

export const intakeRouter = Router();

const profileSchema = z.object({
  demographics: z
    .object({
      name: z.string().min(2).optional(),
      age: z.number().int().positive().optional(),
      gender: z.string().optional(),
      city: z.string().optional(),
      country: z.string().default("Ethiopia"),
    })
    .default({ country: "Ethiopia" }),
  assessment: z.object({
    workType: z.nativeEnum(WorkType),
    sleepHours: z.number().min(0).max(16),
    stressLevel: z.number().int().min(1).max(10),
    socialActivityLevel: z.number().int().min(1).max(10),
    exerciseMinutesPerWeek: z.number().int().min(0).max(3000),
    nutritionQuality: z.number().int().min(1).max(10),
    goals: z.array(z.string().min(1)).default([]),
  }),
  fitness: z.object({
    heightCm: z.number().min(80).max(260),
    weightKg: z.number().min(20).max(400),
    activityLevel: z.string().min(1),
    goal: z.string().min(1),
  }),
  social: z.object({
    tendency: z.string().min(1),
    mood: z.string().min(1),
    lonelinessLevel: z.number().int().min(1).max(10),
    interests: z.array(z.string().min(1)).default([]),
  }),
  growthGoals: z
    .array(
      z.object({
        category: z.nativeEnum(GoalCategory),
        statement: z.string().min(3),
        targetDate: z.coerce.date().optional(),
      }),
    )
    .default([]),
});

intakeRouter.post(
  "/wellness-profile",
  requireAuth,
  asyncRoute(async (req, res) => {
    const userId = getAuthUserId(req);
    const input = profileSchema.parse(req.body);
    const scores = calculateWellnessScores(input.assessment);
    const coachPlan = buildCoachPlan(input.assessment);
    const fitnessPlan = buildFitnessPlan(input.fitness);
    const socialRecommendations = buildSocialRecommendations(input.social);
    const goalPlans = input.growthGoals.map((goal) => ({
      ...goal,
      ...buildGrowthPlan(goal.statement, goal.category),
    }));
    const history = await getWellnessHistory(userId);
    const llmPlan = await generateLlmWellnessPlan({
      profile: {
        assessment: input.assessment,
        fitness: input.fitness,
        social: input.social,
        growthGoals: input.growthGoals,
      },
      baseline: {
        coachPlan,
        fitnessPlan,
        socialRecommendations,
        growthPlans: goalPlans,
      },
      history,
    });
    const learnedCoachPlan = llmPlan
      ? {
          summary: llmPlan.summary,
          dailyRoutine: llmPlan.dailyRoutine,
          weeklyRoutine: llmPlan.weeklyRoutine,
          habits: llmPlan.habits,
          riskAlerts: mergeUnique(llmPlan.riskAlerts, scores.riskAlerts),
        }
      : coachPlan;
    const learnedFitnessPlan = llmPlan
      ? {
          ...fitnessPlan,
          workoutPlan: llmPlan.workoutPlan,
          mealSuggestions: llmPlan.mealSuggestions,
        }
      : fitnessPlan;
    const learnedSocialRecommendations = llmPlan?.socialRecommendations ?? socialRecommendations;
    const learnedGoalPlans =
      llmPlan?.growthPlans?.length
        ? llmPlan.growthPlans.map((plan, index) => ({
            category: input.growthGoals[index]?.category ?? input.growthGoals[0]?.category ?? GoalCategory.MENTAL_WELLBEING,
            statement: plan.statement,
            milestones: plan.milestones,
            nextActions: plan.nextActions,
          }))
        : goalPlans;

    const result = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: input.demographics,
          select: publicUserSelect,
        });

        const assessment = await tx.wellnessAssessment.create({
          data: {
            userId,
            ...input.assessment,
            ...scores,
            coachPlans: {
              create: learnedCoachPlan,
            },
          },
          include: { coachPlans: true },
        });

        const fitness = await tx.fitnessPlan.create({
          data: {
            userId,
            ...input.fitness,
            ...learnedFitnessPlan,
          },
        });

        const social = await tx.socialProfile.create({
          data: {
            userId,
            ...input.social,
            recommendations: learnedSocialRecommendations,
          },
        });

        const growthGoals = await Promise.all(
          learnedGoalPlans.map((goal) =>
            tx.growthGoal.create({
              data: {
                userId,
                ...goal,
              },
            }),
          ),
        );

        const passportActivity = await tx.passportActivity.create({
          data: {
            userId,
            type: PassportActivityType.WELLNESS_EVENT,
            description: "Completed Wellness DNA profile intake",
            points: 100,
          },
        });

        const recommendations = await createProviderRecommendations(tx, {
          assessmentId: assessment.id,
          city: user.city,
          stressLevel: input.assessment.stressLevel,
          sleepHours: input.assessment.sleepHours,
        });

        return {
          user,
          assessment,
          fitness,
          social,
          growthGoals,
          passportActivity,
          recommendations,
        };
      },
      { timeout: 20_000 },
    );

    res.status(201).json({
      message: "Wellness profile submitted",
      ...result,
      dashboard: buildDashboardSummary({
        user: result.user,
        assessment: result.assessment,
        fitness: result.fitness,
        social: result.social,
        growthGoals: result.growthGoals,
        passportPoints: result.passportActivity.points,
        recommendations: result.recommendations,
      }),
    });
  }),
);

intakeRouter.get(
  "/dashboard",
  requireAuth,
  asyncRoute(async (req, res) => {
    const userId = getAuthUserId(req);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });

    if (!user) throw new HttpError(404, "User not found");

    const [assessment, fitness, social, growthGoals, passportActivities] = await Promise.all([
      prisma.wellnessAssessment.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          coachPlans: { orderBy: { createdAt: "desc" }, take: 1 },
          recommendations: { include: { offer: { include: { provider: true } } }, orderBy: { priority: "asc" } },
        },
      }),
      prisma.fitnessPlan.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.socialProfile.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } }),
      prisma.growthGoal.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.passportActivity.findMany({ where: { userId }, orderBy: { occurredAt: "desc" }, take: 20 }),
    ]);

    const passportPoints = passportActivities.reduce((sum, activity) => sum + activity.points, 0);

    res.json({
      user,
      hasCompletedIntake: Boolean(assessment && fitness && social),
      assessment,
      fitness,
      social,
      growthGoals,
      passport: {
        totalPoints: passportPoints,
        activities: passportActivities,
      },
      dashboard: assessment
        ? buildDashboardSummary({
            user,
            assessment,
            fitness,
            social,
            growthGoals,
            passportPoints,
            recommendations: assessment.recommendations,
          })
        : null,
    });
  }),
);

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  age: true,
  gender: true,
  city: true,
  country: true,
  createdAt: true,
  updatedAt: true,
} as const;

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function createProviderRecommendations(
  tx: TransactionClient,
  input: {
    assessmentId: string;
    city?: string | null;
    stressLevel: number;
    sleepHours: number;
  },
) {
  const wantsRecovery = input.stressLevel >= 7 || input.sleepHours < 6;
  const providerTypes = wantsRecovery
    ? [ProviderType.SPA, ProviderType.MASSAGE, ProviderType.RETREAT, ProviderType.YOGA]
    : [ProviderType.GYM, ProviderType.SPORTS, ProviderType.COMMUNITY, ProviderType.NUTRITION];

  const offers = await tx.providerOffer.findMany({
    where: {
      active: true,
      provider: {
        city: input.city ? { equals: input.city, mode: "insensitive" } : undefined,
        type: { in: providerTypes },
      },
    },
    include: { provider: true },
    take: 5,
  });

  const fallbackOffers =
    offers.length > 0
      ? offers
      : await tx.providerOffer.findMany({
          where: { active: true, provider: { type: { in: providerTypes } } },
          include: { provider: true },
          take: 5,
        });

  return Promise.all(
    fallbackOffers.map((offer, index) =>
      tx.recommendation.create({
        data: {
          assessmentId: input.assessmentId,
          offerId: offer.id,
          priority: index + 1,
          reason: wantsRecovery
            ? "High stress or low sleep detected. Recovery-focused providers may help."
            : "Your profile can benefit from movement, recreation, and community wellness.",
        },
        include: { offer: { include: { provider: true } } },
      }),
    ),
  );
}

function buildDashboardSummary(input: {
  user: typeof publicUserSelect extends infer _T ? unknown : never;
  assessment: {
    wellnessScore: number;
    physicalScore: number;
    mentalScore: number;
    socialScore: number;
    growthScore: number;
    riskAlerts: string[];
    sleepHours: number;
    stressLevel: number;
    exerciseMinutesPerWeek: number;
    nutritionQuality: number;
    coachPlans?: Array<{
      summary: string;
      dailyRoutine: string[];
      weeklyRoutine: string[];
      habits: string[];
      riskAlerts: string[];
    }>;
  };
  fitness: { bmi: number; waterLitersPerDay: number; workoutPlan: string[]; mealSuggestions: string[] } | null;
  social: { recommendations: string[]; lonelinessLevel: number; mood: string; interests: string[] } | null;
  growthGoals: Array<{ category: GoalCategory; statement: string; milestones: string[]; nextActions: string[] }>;
  passportPoints: number;
  recommendations: Array<unknown>;
}) {
  const coachPlan = input.assessment.coachPlans?.[0] ?? null;

  return {
    kpis: {
      wellnessScore: input.assessment.wellnessScore,
      physicalScore: input.assessment.physicalScore,
      mentalScore: input.assessment.mentalScore,
      socialScore: input.assessment.socialScore,
      growthScore: input.assessment.growthScore,
      passportPoints: input.passportPoints,
      providerMatches: input.recommendations.length,
      bmi: input.fitness?.bmi ?? null,
      waterLitersPerDay: input.fitness?.waterLitersPerDay ?? null,
    },
    chartData: {
      weeklyWellness: buildWeeklyTrend(input.assessment.wellnessScore),
      habitCompletion: buildHabitCompletion(input.assessment),
      nutritionFocus: [
        { label: "Local food quality", value: input.assessment.nutritionQuality * 10 },
        { label: "Water target", value: input.fitness ? Math.min(100, Math.round(input.fitness.waterLitersPerDay * 25)) : 0 },
        { label: "Movement target", value: Math.min(100, Math.round((input.assessment.exerciseMinutesPerWeek / 150) * 100)) },
      ],
    },
    coachPlan,
    fitnessPlan: input.fitness,
    socialPlan: input.social,
    growthPlans: input.growthGoals,
    riskAlerts: input.assessment.riskAlerts,
  };
}

function buildWeeklyTrend(score: number) {
  return [-10, -7, -5, -3, 0, 2, 4].map((change, index) => ({
    day: `D${index + 1}`,
    value: Math.max(0, Math.min(100, score + change)),
  }));
}

function buildHabitCompletion(input: {
  sleepHours: number;
  stressLevel: number;
  exerciseMinutesPerWeek: number;
  nutritionQuality: number;
}) {
  return [
    { label: "Sleep", value: Math.min(100, Math.round((input.sleepHours / 8) * 100)) },
    { label: "Stress recovery", value: Math.max(0, 100 - input.stressLevel * 10) },
    { label: "Movement", value: Math.min(100, Math.round((input.exerciseMinutesPerWeek / 150) * 100)) },
    { label: "Nutrition", value: input.nutritionQuality * 10 },
  ];
}

async function getWellnessHistory(userId: string) {
  const [assessments, fitnessPlans, socialProfiles, growthGoals] = await Promise.all([
    prisma.wellnessAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        wellnessScore: true,
        physicalScore: true,
        mentalScore: true,
        socialScore: true,
        growthScore: true,
        sleepHours: true,
        stressLevel: true,
        exerciseMinutesPerWeek: true,
        nutritionQuality: true,
        createdAt: true,
      },
    }),
    prisma.fitnessPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        bmi: true,
        activityLevel: true,
        goal: true,
        createdAt: true,
      },
    }),
    prisma.socialProfile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        mood: true,
        lonelinessLevel: true,
        interests: true,
        createdAt: true,
      },
    }),
    prisma.growthGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        category: true,
        statement: true,
        createdAt: true,
      },
    }),
  ]);

  return { assessments, fitnessPlans, socialProfiles, growthGoals };
}

function mergeUnique(primary: string[], fallback: string[]) {
  return Array.from(new Set([...primary, ...fallback])).slice(0, 6);
}

function getAuthUserId(req: Parameters<Parameters<typeof asyncRoute>[0]>[0]) {
  const userId = req.authUser?.sub;
  if (!userId) throw new HttpError(401, "Missing auth token");
  return userId;
}
