import { z } from "zod";

type WellnessProfileInput = {
  assessment: {
    workType: string;
    sleepHours: number;
    stressLevel: number;
    socialActivityLevel: number;
    exerciseMinutesPerWeek: number;
    nutritionQuality: number;
    goals: string[];
  };
  fitness: {
    heightCm: number;
    weightKg: number;
    activityLevel: string;
    goal: string;
  };
  social: {
    tendency: string;
    mood: string;
    lonelinessLevel: number;
    interests: string[];
  };
  growthGoals: Array<{
    category: string;
    statement: string;
  }>;
};

type RuleBaseline = {
  coachPlan: {
    dailyRoutine: string[];
    weeklyRoutine: string[];
    habits: string[];
    riskAlerts: string[];
    summary: string;
  };
  fitnessPlan: {
    workoutPlan: string[];
    mealSuggestions: string[];
  };
  socialRecommendations: string[];
  growthPlans: Array<{
    category: string;
    statement: string;
    milestones: string[];
    nextActions: string[];
  }>;
};

type WellnessHistory = {
  assessments: Array<{
    wellnessScore: number;
    physicalScore: number;
    mentalScore: number;
    socialScore: number;
    growthScore: number;
    sleepHours: number;
    stressLevel: number;
    exerciseMinutesPerWeek: number;
    nutritionQuality: number;
    createdAt: Date;
  }>;
  fitnessPlans: Array<{
    bmi: number;
    activityLevel: string;
    goal: string;
    createdAt: Date;
  }>;
  socialProfiles: Array<{
    mood: string;
    lonelinessLevel: number;
    interests: string[];
    createdAt: Date;
  }>;
  growthGoals: Array<{
    category: string;
    statement: string;
    createdAt: Date;
  }>;
};

const llmWellnessSchema = z.object({
  summary: z.string().min(10),
  dailyRoutine: z.array(z.string().min(3)).min(3).max(6),
  weeklyRoutine: z.array(z.string().min(3)).min(3).max(6),
  habits: z.array(z.string().min(3)).min(3).max(6),
  riskAlerts: z.array(z.string().min(3)).max(6),
  workoutPlan: z.array(z.string().min(3)).min(3).max(6),
  mealSuggestions: z.array(z.string().min(3)).min(3).max(8),
  socialRecommendations: z.array(z.string().min(3)).min(3).max(8),
  growthPlans: z
    .array(
      z.object({
        category: z.string().min(1),
        statement: z.string().min(3),
        milestones: z.array(z.string().min(3)).min(3).max(6),
        nextActions: z.array(z.string().min(3)).min(3).max(6),
      }),
    )
    .max(6),
});

export type LlmWellnessPlan = z.infer<typeof llmWellnessSchema>;

export async function generateLlmWellnessPlan(input: {
  profile: WellnessProfileInput;
  baseline: RuleBaseline;
  history: WellnessHistory;
}) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  const prompt = {
    task: "Create a personalized wellness intelligence plan from the user's profile, rule-based baseline, and saved history. Learn from the history by noticing whether sleep, stress, exercise, social connection, nutrition, or goals appear to be persistent patterns.",
    requiredJsonShape: {
      summary: "string",
      dailyRoutine: ["string"],
      weeklyRoutine: ["string"],
      habits: ["string"],
      riskAlerts: ["string"],
      workoutPlan: ["string"],
      mealSuggestions: ["string"],
      socialRecommendations: ["string"],
      growthPlans: [
        {
          category: "string",
          statement: "string",
          milestones: ["string"],
          nextActions: ["string"],
        },
      ],
    },
    profile: input.profile,
    ruleBaseline: input.baseline,
    savedHistory: input.history,
  };

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.XAI_MODEL ?? "grok-4.3",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Tenadam's African wellness intelligence coach. Generate practical, culturally relevant, safe lifestyle recommendations. Use local foods such as injera, shiro, lentils, chickpeas, and teff-based meals where helpful. Do not diagnose disease or replace medical care. Return only valid JSON matching the requested shape.",
        },
        {
          role: "user",
          content: JSON.stringify(prompt),
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    console.warn(`LLM wellness generation failed: ${response.status} ${message}`);
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) return null;

  try {
    return llmWellnessSchema.parse(JSON.parse(rawText));
  } catch (error) {
    console.warn("LLM wellness generation returned invalid JSON", error);
    return null;
  }
}
