type AssessmentInput = {
  sleepHours: number;
  stressLevel: number;
  socialActivityLevel: number;
  exerciseMinutesPerWeek: number;
  nutritionQuality: number;
  goals: string[];
};

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export function calculateWellnessScores(input: AssessmentInput) {
  const sleepScore = clampScore((input.sleepHours / 8) * 100);
  const exerciseScore = clampScore((input.exerciseMinutesPerWeek / 150) * 100);
  const nutritionScore = clampScore(input.nutritionQuality * 10);
  const stressScore = clampScore(100 - input.stressLevel * 10);
  const socialScore = clampScore(input.socialActivityLevel * 10);
  const growthScore = clampScore(Math.min(input.goals.length, 5) * 20);

  const physicalScore = clampScore(sleepScore * 0.35 + exerciseScore * 0.35 + nutritionScore * 0.3);
  const mentalScore = clampScore(stressScore * 0.65 + sleepScore * 0.35);
  const wellnessScore = clampScore(
    physicalScore * 0.35 + mentalScore * 0.3 + socialScore * 0.2 + growthScore * 0.15,
  );

  return {
    wellnessScore,
    physicalScore,
    mentalScore,
    socialScore,
    growthScore,
    riskAlerts: buildRiskAlerts(input),
  };
}

export function buildCoachPlan(input: AssessmentInput) {
  const dailyRoutine = [
    "Start the morning with water and a protein-rich local breakfast.",
    input.exerciseMinutesPerWeek < 90
      ? "Take a 15-minute walk after work or class."
      : "Keep your existing movement habit and add light stretching.",
    input.sleepHours < 7
      ? "Reduce caffeine after 4 PM and set a consistent bedtime."
      : "Protect your current sleep window.",
  ];

  const weeklyRoutine = [
    "Do 3 focused movement sessions this week.",
    "Plan 2 meals around lentils, chickpeas, shiro, or teff-based foods.",
    "Schedule one social or community activity.",
  ];

  const habits = [
    input.stressLevel >= 7 ? "Practice 5 minutes of breathing before sleep." : "Keep a short evening reflection.",
    input.socialActivityLevel <= 4 ? "Reach out to one friend, faith group, or club this week." : "Maintain your social rhythm.",
    input.nutritionQuality <= 5 ? "Add vegetables or legumes to one daily meal." : "Keep your balanced meals consistent.",
  ];

  return {
    dailyRoutine,
    weeklyRoutine,
    habits,
    riskAlerts: buildRiskAlerts(input),
    summary: `Your current pattern suggests a ${input.sleepHours < 7 ? "sleep and recovery" : "consistency"} focus. Start small, repeat daily, and let the platform reward each healthy action.`,
  };
}

export function buildFitnessPlan(input: {
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  goal: string;
}) {
  const heightM = input.heightCm / 100;
  const bmi = Number((input.weightKg / (heightM * heightM)).toFixed(1));
  const waterLitersPerDay = Number(Math.max(2, input.weightKg * 0.035).toFixed(1));

  return {
    bmi,
    waterLitersPerDay,
    workoutPlan: [
      "Day 1: 25-minute brisk walk plus bodyweight squats.",
      "Day 3: Low-impact strength circuit with push, pull, legs, and core.",
      "Day 5: Sports, dancing, jogging, or a longer walk with a friend.",
    ],
    mealSuggestions: [
      "Injera with shiro and vegetables.",
      "Lentil stew with salad.",
      "Chickpea tibs-style bowl with teff-based bread.",
      "Eggs or beans with fruit for breakfast.",
    ],
  };
}

export function buildSocialRecommendations(input: {
  tendency: string;
  mood: string;
  lonelinessLevel: number;
  interests: string[];
}) {
  const recommendations = [
    "Join a weekend church or faith-community activity.",
    "Try a volunteer group focused on elder support or neighborhood cleanup.",
    "Attend a sports group, walking club, or youth community meetup.",
  ];

  if (input.interests.some((interest) => interest.toLowerCase().includes("book"))) {
    recommendations.push("Join a book club with a predictable monthly rhythm.");
  }

  if (input.lonelinessLevel >= 7) {
    recommendations.unshift("Start with one low-pressure activity this week and repeat it for 3 weeks.");
  }

  return recommendations;
}

export function buildGrowthPlan(statement: string, category: string) {
  return {
    milestones: [
      `Week 1: Define what success means for ${category.toLowerCase()}.`,
      "Week 2: Learn one foundational skill or habit.",
      "Week 3: Practice publicly or with accountability.",
      "Week 4: Review progress and choose the next level.",
    ],
    nextActions: [
      `Write a 30-day version of: ${statement}`,
      "Block two focused sessions on your calendar.",
      "Find one mentor, peer, group, or event related to the goal.",
    ],
  };
}

function buildRiskAlerts(input: AssessmentInput) {
  const alerts: string[] = [];

  if (input.sleepHours < 6) alerts.push("Low sleep may reduce recovery, mood, and focus.");
  if (input.stressLevel >= 8) alerts.push("High stress trend detected. Prioritize recovery and support.");
  if (input.exerciseMinutesPerWeek < 60) alerts.push("Low movement can increase long-term physical health risk.");
  if (input.socialActivityLevel <= 3) alerts.push("Low social connection may affect wellbeing.");

  return alerts;
}
