export type AuthUser = {
  id: string;
  name: string;
  email: string;
  age?: number | null;
  gender?: string | null;
  city?: string | null;
  country: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type IntakePayload = {
  demographics: {
    name?: string;
    age?: number;
    gender?: string;
    city?: string;
    country?: string;
  };
  assessment: {
    workType:
      | "OFFICE"
      | "DRIVER"
      | "STUDENT"
      | "LABORER"
      | "ENTREPRENEUR"
      | "HEALTHCARE"
      | "HOSPITALITY"
      | "REMOTE"
      | "OTHER";
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
    category:
      | "FITNESS"
      | "SPIRITUAL_GROWTH"
      | "RELATIONSHIPS"
      | "EDUCATION"
      | "CAREER"
      | "FINANCE"
      | "MENTAL_WELLBEING"
      | "SOCIAL_WELLBEING";
    statement: string;
  }>;
};

export type DashboardResponse = {
  user: AuthUser;
  hasCompletedIntake: boolean;
  dashboard: {
    kpis: {
      wellnessScore: number;
      physicalScore: number;
      mentalScore: number;
      socialScore: number;
      growthScore: number;
      passportPoints: number;
      providerMatches: number;
      bmi: number | null;
      waterLitersPerDay: number | null;
    };
    chartData: {
      weeklyWellness: Array<{ day: string; value: number }>;
      habitCompletion: Array<{ label: string; value: number }>;
      nutritionFocus: Array<{ label: string; value: number }>;
    };
    coachPlan: {
      summary: string;
      dailyRoutine: string[];
      weeklyRoutine: string[];
      habits: string[];
      riskAlerts: string[];
    } | null;
    fitnessPlan: {
      bmi: number;
      waterLitersPerDay: number;
      workoutPlan: string[];
      mealSuggestions: string[];
    } | null;
    socialPlan: {
      recommendations: string[];
      lonelinessLevel: number;
      mood: string;
      interests: string[];
    } | null;
    growthPlans: Array<{
      category: string;
      statement: string;
      milestones: string[];
      nextActions: string[];
    }>;
    riskAlerts: string[];
  } | null;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://tenadam-ui-11.onrender.com").replace(/\/$/, "");
const TOKEN_KEY = "tenadam_auth_token";

export function saveAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  city?: string;
  country?: string;
}) {
  return authRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginUser(input: { email: string; password: string }) {
  return authRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentUser(token: string) {
  return authRequest<{ user: AuthUser }>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function submitWellnessProfile(token: string, input: IntakePayload) {
  return authRequest<DashboardResponse & { message: string }>("/intake/wellness-profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}

export async function getDashboardData(token: string) {
  return authRequest<DashboardResponse>("/intake/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function authRequest<T>(path: string, init: RequestInit) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? "Something went wrong");
  }

  return data as T;
}
