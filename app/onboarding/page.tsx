"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, Brain, Dumbbell, Leaf, Users } from "lucide-react";
import { getAuthToken, IntakePayload, submitWellnessProfile } from "@/lib/auth-client";

const workTypes = [
  "OFFICE",
  "DRIVER",
  "STUDENT",
  "LABORER",
  "ENTREPRENEUR",
  "HEALTHCARE",
  "HOSPITALITY",
  "REMOTE",
  "OTHER",
] as const;

const goalCategories = [
  "FITNESS",
  "CAREER",
  "EDUCATION",
  "SPIRITUAL_GROWTH",
  "RELATIONSHIPS",
  "FINANCE",
  "MENTAL_WELLBEING",
  "SOCIAL_WELLBEING",
] as const;

const genderOptions = ["male", "female"] as const;

const scaleOptions = Array.from({ length: 10 }, (_, index) => String(index + 1));

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    age: "24",
    gender: "male",
    city: "Addis Ababa",
    workType: "STUDENT",
    sleepHours: "6",
    stressLevel: "7",
    socialActivityLevel: "5",
    exerciseMinutesPerWeek: "60",
    nutritionQuality: "6",
    heightCm: "170",
    weightKg: "65",
    activityLevel: "light",
    fitnessGoal: "Improve energy and consistency",
    tendency: "introvert",
    mood: "stressed",
    lonelinessLevel: "5",
    goals: "Improve sleep, build fitness, grow career",
    interests: "church, books, volunteering, football",
    growthCategory: "CAREER",
    growthStatement: "Improve my career opportunities",
  });

  useEffect(() => {
    const authToken = getAuthToken();
    if (!authToken) {
      router.replace("/login");
    }
  }, [router]);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const payload: IntakePayload = {
      demographics: {
        age: Number(form.age),
        gender: form.gender || undefined,
        city: form.city,
        country: "Ethiopia",
      },
      assessment: {
        workType: form.workType as IntakePayload["assessment"]["workType"],
        sleepHours: Number(form.sleepHours),
        stressLevel: Number(form.stressLevel),
        socialActivityLevel: Number(form.socialActivityLevel),
        exerciseMinutesPerWeek: Number(form.exerciseMinutesPerWeek),
        nutritionQuality: Number(form.nutritionQuality),
        goals: splitList(form.goals),
      },
      fitness: {
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        activityLevel: form.activityLevel,
        goal: form.fitnessGoal,
      },
      social: {
        tendency: form.tendency,
        mood: form.mood,
        lonelinessLevel: Number(form.lonelinessLevel),
        interests: splitList(form.interests),
      },
      growthGoals: [
        {
          category: form.growthCategory as IntakePayload["growthGoals"][number]["category"],
          statement: form.growthStatement,
        },
      ],
    };

    try {
      await submitWellnessProfile(token, payload);
      router.push("/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to submit wellness profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FBF9F6] text-[#1E1E1E]">
      <header className="border-b border-[#2C401F]/10 bg-[#FBF9F6]/95">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-[6px] bg-[#2C401F] text-white">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <span>Tenadam</span>
          </Link>
          <span className="rounded-[6px] bg-[#E2F0D9] px-4 py-2 text-sm font-black text-[#2C401F]">
            Wellness DNA
          </span>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="h-fit rounded-[8px] bg-[#2C401F] p-6 text-white lg:sticky lg:top-8">
          <p className="text-xs font-black uppercase text-[#C5D86D]">Before your dashboard</p>
          <h1 className="mt-4 text-5xl font-black leading-[0.95]">
            teach Tenadam
            <span className="mt-2 block font-serif italic text-[#C5D86D]">about you.</span>
          </h1>
          <p className="mt-5 leading-8 text-white/78">
            Your dashboard will learn from these inputs and generate scores, coach actions, nutrition guidance, social
            recommendations, marketplace matches, and passport rewards.
          </p>
          <div className="mt-7 grid gap-3">
            <Step icon={Brain} text="Wellness DNA scores" />
            <Step icon={Dumbbell} text="Fitness and local nutrition plan" />
            <Step icon={Users} text="Social wellness recommendations" />
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <Panel title="Demographics" eyebrow="Profile basics">
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Age" value={form.age} onChange={(value) => updateField("age", value)} type="number" />
              <Select label="Gender" value={form.gender} onChange={(value) => updateField("gender", value)} options={genderOptions} />
              <Input label="City" value={form.city} onChange={(value) => updateField("city", value)} />
            </div>
          </Panel>

          <Panel title="Wellness DNA Assessment" eyebrow="Scores engine">
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Work type" value={form.workType} onChange={(value) => updateField("workType", value)} options={workTypes} />
              <Input label="Sleep hours" value={form.sleepHours} onChange={(value) => updateField("sleepHours", value)} type="number" />
              <ScaleRadioRow
                label="Stress level"
                value={form.stressLevel}
                onChange={(value) => updateField("stressLevel", value)}
                lowLabel="Calm"
                highLabel="Very stressed"
              />
              <ScaleRadioRow
                label="Social activity"
                value={form.socialActivityLevel}
                onChange={(value) => updateField("socialActivityLevel", value)}
                lowLabel="Less social"
                highLabel="Very social"
              />
              <Input label="Exercise minutes/week" value={form.exerciseMinutesPerWeek} onChange={(value) => updateField("exerciseMinutesPerWeek", value)} type="number" />
              <Input label="Nutrition quality 1-10" value={form.nutritionQuality} onChange={(value) => updateField("nutritionQuality", value)} type="number" />
            </div>
            <Textarea label="Personal goals" value={form.goals} onChange={(value) => updateField("goals", value)} />
          </Panel>

          <Panel title="Fitness & Nutrition" eyebrow="Local plan inputs">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Height cm" value={form.heightCm} onChange={(value) => updateField("heightCm", value)} type="number" />
              <Input label="Weight kg" value={form.weightKg} onChange={(value) => updateField("weightKg", value)} type="number" />
              <Input label="Activity level" value={form.activityLevel} onChange={(value) => updateField("activityLevel", value)} />
              <Input label="Fitness goal" value={form.fitnessGoal} onChange={(value) => updateField("fitnessGoal", value)} />
            </div>
          </Panel>

          <Panel title="Social Wellness & Growth" eyebrow="Connection and goals">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Introvert/extrovert" value={form.tendency} onChange={(value) => updateField("tendency", value)} />
              <Input label="Current mood" value={form.mood} onChange={(value) => updateField("mood", value)} />
              <ScaleRadioRow
                label="Loneliness level"
                value={form.lonelinessLevel}
                onChange={(value) => updateField("lonelinessLevel", value)}
                lowLabel="Connected"
                highLabel="Very lonely"
              />
              <Select label="Growth category" value={form.growthCategory} onChange={(value) => updateField("growthCategory", value)} options={goalCategories} />
            </div>
            <Textarea label="Interests" value={form.interests} onChange={(value) => updateField("interests", value)} />
            <Textarea label="Growth goal statement" value={form.growthStatement} onChange={(value) => updateField("growthStatement", value)} />
          </Panel>

          {error ? (
            <p className="rounded-[6px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[6px] bg-[#C5D86D] px-6 text-sm font-black uppercase text-[#2C401F] transition hover:bg-[#b8cd5c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Building your dashboard..." : "Generate my wellness dashboard"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[8px] border border-[#2C401F]/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase text-[#7A4F2A]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black text-[#2C401F]">{title}</h2>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#2C401F]">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required
        className="h-12 rounded-[6px] border border-[#2C401F]/15 bg-[#FBF9F6] px-3 text-base outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#2C401F]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-[6px] border border-[#2C401F]/15 bg-[#FBF9F6] px-3 text-base outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOptionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ScaleRadioRow({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <fieldset className="grid gap-3 md:col-span-2">
      <legend className="text-sm font-bold text-[#2C401F]">{label}</legend>
      <div className="rounded-[6px] border border-[#2C401F]/15 bg-[#FBF9F6] px-3 py-4">
        <div className="mb-3 flex items-center justify-between text-xs font-black uppercase leading-4 text-[#7A4F2A]">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
          {scaleOptions.map((option) => {
            const isSelected = option === value;

            return (
              <label
                key={option}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-[6px] px-1 py-2 text-sm font-black text-[#2C401F] transition hover:bg-white"
              >
                <input
                  type="radio"
                  name={label}
                  value={option}
                  checked={isSelected}
                  onChange={(event) => onChange(event.target.value)}
                  className="size-4 accent-[#2C401F]"
                />
                <span className={isSelected ? "text-[#2C401F]" : "text-[#4D4D4D]"}>
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#2C401F]">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        rows={3}
        className="rounded-[6px] border border-[#2C401F]/15 bg-[#FBF9F6] px-3 py-3 text-base outline-none"
      />
    </label>
  );
}

function Step({ icon: Icon, text }: { icon: typeof Brain; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] bg-white/10 p-4">
      <Icon className="size-5 text-[#C5D86D]" aria-hidden="true" />
      <span className="font-semibold">{text}</span>
    </div>
  );
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatOptionLabel(option: string) {
  return option
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
