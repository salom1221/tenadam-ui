"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Apple,
  Brain,
  CalendarCheck,
  Gift,
  HandHeart,
  Leaf,
  LogOut,
  MapPin,
  Medal,
  Sparkles,
  Users,
} from "lucide-react";
import { AuthUser, DashboardResponse, clearAuthToken, getAuthToken, getDashboardData } from "@/lib/auth-client";

const sidebarItems = [
  { label: "Wellness Overview", targetId: "overview" },
  { label: "Wellness DNA", targetId: "wellness-dna" },
  { label: "AI Coach Plan", targetId: "ai-coach" },
  { label: "Fitness & Nutrition", targetId: "fitness-nutrition" },
  { label: "Social Wellness", targetId: "social-wellness" },
  { label: "Marketplace Leads", targetId: "marketplace-leads" },
  { label: "Wellness Passport", targetId: "wellness-passport" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dashboard, setDashboard] = useState<NonNullable<DashboardResponse["dashboard"]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    getDashboardData(token)
      .then((result) => {
        if (!result.hasCompletedIntake) {
          router.replace("/onboarding");
          return;
        }

        setUser(result.user);
        setDashboard(result.dashboard);
      })
      .catch(() => {
        clearAuthToken();
        router.replace("/login");
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  function handleLogout() {
    clearAuthToken();
    router.replace("/");
  }

  function scrollToSection(targetId: string) {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const kpis = dashboard
    ? [
        { label: "Wellness Score", value: dashboard.kpis.wellnessScore, suffix: "/100", icon: Sparkles },
        { label: "Physical Health", value: dashboard.kpis.physicalScore, suffix: "/100", icon: Activity },
        { label: "Mental Wellbeing", value: dashboard.kpis.mentalScore, suffix: "/100", icon: Brain },
        { label: "Social Wellbeing", value: dashboard.kpis.socialScore, suffix: "/100", icon: Users },
        { label: "Passport Points", value: dashboard.kpis.passportPoints, suffix: "pts", icon: Medal },
        { label: "Provider Matches", value: dashboard.kpis.providerMatches, suffix: "nearby", icon: MapPin },
      ]
    : [];

  const weeklyWellness = dashboard?.chartData.weeklyWellness ?? [];
  const habitCompletion = dashboard?.chartData.habitCompletion ?? [];
  const nutritionProgress = dashboard?.chartData.nutritionFocus ?? [];
  const coachTasks = dashboard?.coachPlan?.dailyRoutine ?? [];
  const coachSummary = dashboard?.coachPlan?.summary ?? "Your AI coach plan will appear after your wellness intake.";
  const firstRiskAlert = dashboard?.riskAlerts[0] ?? "Your dashboard is learning from your latest wellness profile.";
  const fitnessPlan = dashboard?.fitnessPlan;
  const socialPlan = dashboard?.socialPlan;
  const growthPlans = dashboard?.growthPlans ?? [];

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FBF9F6] text-[#2C401F]">
        <div className="flex items-center gap-3 font-black">
          <Sparkles className="size-5 animate-pulse" aria-hidden="true" />
          Loading your wellness dashboard...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#1E1E1E] lg:flex">
      <aside className="bg-[#2C401F] text-white shadow-lg lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-shrink-0">
        <div className="flex items-center justify-between border-b border-white/10 p-5 lg:block lg:border-b-0 lg:p-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[6px] bg-[#C5D86D] text-[#2C401F]">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight text-[#C5D86D]">TENADAM</span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">Dashboards</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex size-10 items-center justify-center rounded-[6px] bg-white/10 text-white transition hover:bg-white/15 lg:hidden"
            aria-label="Logout"
          >
            <LogOut className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-5 py-4 lg:mt-2 lg:block lg:space-y-1 lg:overflow-visible lg:px-0">
          {sidebarItems.map((item, index) => (
            <button
              key={item.targetId}
              type="button"
              onClick={() => scrollToSection(item.targetId)}
              className={`whitespace-nowrap border-r-4 px-4 py-3 text-left text-sm font-semibold transition lg:w-full lg:px-6 ${
                index === 0
                  ? "border-[#C5D86D] bg-white/15 text-white"
                  : "border-transparent text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="m-5 hidden rounded-[8px] bg-white/10 p-4 lg:block">
          <p className="text-xs font-black uppercase text-[#C5D86D]">AI Coach Alert</p>
          <p className="mt-2 text-sm leading-6 text-white/78">{firstRiskAlert}</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-5 md:p-8">
        <header id="overview" className="scroll-mt-6 mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7A4F2A]">
              Welcome, {user?.name ?? "friend"}
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#2C401F] md:text-4xl">Wellness Intelligence Overview</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-widest text-[#666]">
              <span>
                City: <strong className="text-[#2C401F]">{user?.city ?? "Addis Ababa"}</strong>
              </span>
              <span>
                Profile: <strong className="text-[#2C401F]">Active demo</strong>
              </span>
              <span>
                Data: <strong className="text-[#2C401F]">Today</strong>
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[6px] bg-[#E2F0D9] px-4 py-2 text-sm font-black text-[#2C401F] transition hover:bg-[#d4e7c8]"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-[6px] bg-[#C5D86D] px-5 py-2 text-sm font-black text-[#2C401F] shadow-sm transition hover:bg-[#b8cd5c] lg:inline-flex"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </header>

        <section id="wellness-dna" className="scroll-mt-6 mb-10">
          <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-[#2C401F]">Wellness Operation KPIs</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {kpis.map((kpi) => (
              <article
                key={kpi.label}
                className="rounded-[8px] border border-[#2C401F]/10 bg-white p-4 text-center shadow-sm"
              >
                <kpi.icon className="mx-auto mb-3 size-6 text-[#2C401F]" aria-hidden="true" />
                <p className="mb-2 min-h-8 text-[10px] font-bold uppercase leading-4 text-[#777]">{kpi.label}</p>
                <p className="text-2xl font-black text-[#2C401F]">
                  {formatNumber(kpi.value)} <span className="text-xs font-bold text-[#7A4F2A]">{kpi.suffix}</span>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="fitness-nutrition" className="scroll-mt-6 mb-10">
          <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-[#2C401F]">Wellness Turnover</h2>
          <div className="grid gap-6 xl:grid-cols-3">
            <article className="rounded-[8px] bg-white p-6 shadow-sm">
              <p className="mb-6 text-center text-xs font-black uppercase text-[#777]">Weekly Wellness Score</p>
              <div className="relative h-48 w-full overflow-hidden rounded-[8px] bg-[#FBF9F6]">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 200" role="img" aria-label="Weekly wellness score trend">
                  <path
                    d={`${buildTrendPath(weeklyWellness, true)}`}
                    fill="#E2F0D9"
                    fillOpacity="0.75"
                  />
                  <path
                    d={buildTrendPath(weeklyWellness)}
                    fill="none"
                    stroke="#2C401F"
                    strokeWidth="4"
                  />
                  <circle
                    cx={lastPoint(weeklyWellness).x}
                    cy={lastPoint(weeklyWellness).y}
                    r="7"
                    fill="#C5D86D"
                    stroke="#2C401F"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            </article>

            <article className="rounded-[8px] bg-white p-6 shadow-sm">
              <p className="mb-6 text-center text-xs font-black uppercase text-[#777]">Habit Completion</p>
              <div className="flex h-48 items-end justify-around rounded-[8px] bg-[#FBF9F6] px-4 py-5">
                {habitCompletion.map((item) => (
                  <div key={item.label} className="flex h-full flex-col items-center justify-end gap-2">
                    <div
                      className="w-5 rounded-t-[4px] bg-[#2C401F]"
                      style={{ height: `${item.value}%` }}
                      aria-label={`${item.label}: ${item.value}%`}
                    />
                    <span className="max-w-16 text-center text-[10px] font-bold uppercase leading-3 text-[#777]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[8px] bg-white p-6 shadow-sm">
              <p className="mb-6 text-center text-xs font-black uppercase text-[#777]">Local Nutrition Focus</p>
              <div className="space-y-5">
                {nutritionProgress.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between text-[11px] font-bold uppercase text-[#666]">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full bg-[#F0EEE8]">
                      <div style={{ width: `${item.value}%`, backgroundColor: "#C5D86D" }} />
                      <div className="flex-1 bg-[#E2F0D9]" />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <article className="rounded-[8px] bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase text-[#7A4F2A]">Workout Plan</p>
              <div className="mt-4 grid gap-3">
                {(fitnessPlan?.workoutPlan ?? ["Submit fitness data to generate a workout plan."]).map((item) => (
                  <div key={item} className="rounded-[8px] bg-[#FBF9F6] p-4 font-semibold leading-7 text-[#2C401F]">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[8px] bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase text-[#7A4F2A]">Local Meal Suggestions</p>
              <div className="mt-4 grid gap-3">
                {(fitnessPlan?.mealSuggestions ?? ["Submit nutrition data to generate local meal suggestions."]).map((item) => (
                  <div key={item} className="rounded-[8px] bg-[#FBF9F6] p-4 font-semibold leading-7 text-[#2C401F]">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article id="ai-coach" className="scroll-mt-6 rounded-[8px] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-[#7A4F2A]">Today&apos;s AI coach plan</p>
                <h2 className="mt-1 text-2xl font-black text-[#2C401F]">{coachSummary}</h2>
              </div>
              <CalendarCheck className="size-8 text-[#2C401F]" aria-hidden="true" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {coachTasks.map((task, index) => (
                <div key={task} className="flex items-center gap-3 rounded-[8px] bg-[#FBF9F6] p-4">
                  <span
                    className="flex size-7 items-center justify-center rounded-[6px] bg-[#C5D86D] text-xs font-black text-[#2C401F]"
                  >
                    {index + 1}
                  </span>
                  <span className="font-semibold text-[#2C401F]">{task}</span>
                </div>
              ))}
            </div>
          </article>

          <article id="marketplace-leads" className="scroll-mt-6 rounded-[8px] bg-[#E2F0D9] p-6 shadow-sm">
            <p className="text-xs font-black uppercase text-[#7A4F2A]">Marketplace & rewards</p>
            <div className="mt-5 grid gap-3">
              <MetricRow icon={HandHeart} label="Qualified provider matches" value={`${dashboard?.kpis.providerMatches ?? 0} offers`} />
              <MetricRow icon={Gift} label="Unlocked passport points" value={`${dashboard?.kpis.passportPoints ?? 0} pts`} targetId="wellness-passport" />
              <MetricRow icon={Apple} label="Water target" value={`${dashboard?.kpis.waterLitersPerDay ?? "-"} L/day`} />
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <article id="social-wellness" className="scroll-mt-6 rounded-[8px] bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase text-[#7A4F2A]">Social Wellness</p>
            <h2 className="mt-1 text-2xl font-black text-[#2C401F]">
              Mood: {socialPlan?.mood ?? "Not set"}
            </h2>
            <div className="mt-5 grid gap-3">
              {(socialPlan?.recommendations ?? ["Submit your social profile to unlock recommendations."]).map((item) => (
                <div key={item} className="rounded-[8px] bg-[#FBF9F6] p-4 font-semibold leading-7 text-[#2C401F]">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[8px] bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase text-[#7A4F2A]">Growth Goals</p>
            <h2 className="mt-1 text-2xl font-black text-[#2C401F]">Next milestones</h2>
            <div className="mt-5 grid gap-3">
              {(growthPlans[0]?.milestones ?? ["Complete onboarding to generate weekly milestones."]).map((item) => (
                <div key={item} className="rounded-[8px] bg-[#FBF9F6] p-4 font-semibold leading-7 text-[#2C401F]">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article id="wellness-passport" className="scroll-mt-6 rounded-[8px] bg-[#2C401F] p-6 text-white shadow-sm">
            <p className="text-xs font-black uppercase text-[#C5D86D]">Wellness Passport</p>
            <h2 className="mt-1 text-5xl font-black text-[#C5D86D]">
              {dashboard?.kpis.passportPoints ?? 0}
              <span className="ml-2 text-sm uppercase text-white/70">points</span>
            </h2>
            <p className="mt-5 leading-7 text-white/78">
              Earn points by completing assessments, walking, exercising, joining community activities, and visiting
              recommended wellness providers.
            </p>
            <button
              type="button"
              onClick={() => scrollToSection("marketplace-leads")}
              className="mt-6 rounded-[6px] bg-[#C5D86D] px-5 py-3 text-sm font-black uppercase text-[#2C401F] transition hover:bg-[#b8cd5c]"
            >
              See reward offers
            </button>
          </article>
        </section>
      </main>
    </div>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
  targetId,
}: {
  icon: typeof HandHeart;
  label: string;
  value: string;
  targetId?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-[#2C401F]" aria-hidden="true" />
        <span className="font-semibold text-[#2C401F]">{label}</span>
      </div>
      <span className="text-sm font-black text-[#7A4F2A]">{value}</span>
    </>
  );

  if (targetId) {
    return (
      <button
        type="button"
        onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className="flex w-full items-center justify-between gap-4 rounded-[8px] bg-white p-4 text-left transition hover:bg-[#FBF9F6]"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-[8px] bg-white p-4">
      {content}
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function buildTrendPath(points: Array<{ value: number }>, closeArea = false) {
  const chartPoints = points.length > 0 ? points : [{ value: 0 }];
  const plotted = chartPoints.map((point, index) => {
    const x = chartPoints.length === 1 ? 200 : (index / (chartPoints.length - 1)) * 400;
    const y = 180 - (Math.max(0, Math.min(100, point.value)) / 100) * 150;
    return { x, y };
  });

  const line = plotted.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  if (!closeArea) return line;

  const first = plotted[0];
  const last = plotted[plotted.length - 1];
  return `${line} L ${last.x} 200 L ${first.x} 200 Z`;
}

function lastPoint(points: Array<{ value: number }>) {
  const chartPoints = points.length > 0 ? points : [{ value: 0 }];
  const index = chartPoints.length - 1;
  return {
    x: chartPoints.length === 1 ? 200 : (index / (chartPoints.length - 1)) * 400,
    y: 180 - (Math.max(0, Math.min(100, chartPoints[index].value)) / 100) * 150,
  };
}
