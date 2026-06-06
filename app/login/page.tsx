"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Leaf, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { getDashboardData, loginUser, saveAuthToken } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await loginUser({ email, password });
      saveAuthToken(result.token);
      const dashboard = await getDashboardData(result.token);
      router.push(dashboard.hasCompletedIntake ? "/dashboard" : "/onboarding");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to login");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FBF9F6] text-[#1E1E1E]">
      <AuthHeader actionLabel="" actionHref="/register" />

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-10 md:grid-cols-[0.95fr_1.05fr] md:px-8">
        <div className="rounded-[8px] bg-[#2C401F] p-6 text-white md:p-8">
          <p className="text-xs font-black uppercase text-[#C5D86D]">Welcome back</p>
          <h1 className="mt-4 text-5xl font-black leading-[0.95] md:text-7xl">
            continue your
            <span className="mt-2 block font-serif italic text-[#C5D86D]">wellness journey.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
            Return to your Wellness DNA, AI coach plan, marketplace recommendations, and passport rewards.
          </p>

          <div className="mt-8 grid gap-3">
            {["Wellness score tracking", "Personalized coach routines", "Local provider recommendations"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3 rounded-[8px] bg-white/10 p-4">
                  <Sparkles className="size-5 text-[#C5D86D]" aria-hidden="true" />
                  <span className="font-semibold">{item}</span>
                </div>
              ),
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[8px] border border-[#2C401F]/10 bg-white p-5 shadow-sm md:p-8">
          <p className="text-xs font-black uppercase text-[#7A4F2A]">Login</p>
          <h2 className="mt-3 text-3xl font-black">Access your account</h2>

          <div className="mt-7 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-[#2C401F]">
              Email address
              <span className="flex items-center gap-3 rounded-[6px] border border-[#2C401F]/15 bg-[#FBF9F6] px-3">
                <Mail className="size-5 text-[#7A4F2A]" aria-hidden="true" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  className="h-12 w-full bg-transparent text-base text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/45"
                  placeholder="you@example.com"
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-bold text-[#2C401F]">
              Password
              <span className="flex items-center gap-3 rounded-[6px] border border-[#2C401F]/15 bg-[#FBF9F6] px-3">
                <LockKeyhole className="size-5 text-[#7A4F2A]" aria-hidden="true" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-12 w-full bg-transparent text-base text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/45"
                  placeholder="Your password"
                />
              </span>
            </label>
          </div>

          {error ? (
            <p className="mt-5 rounded-[6px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#C5D86D] px-5 text-sm font-black uppercase text-[#1E1E1E] transition hover:bg-[#b8cd5c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>

          <p className="mt-5 text-center text-sm font-medium text-[#4D4D4D]">
            New to Tenadam?{" "}
            <Link href="/register" className="font-black text-[#2C401F] underline decoration-[#C5D86D] decoration-2">
              Create your account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

function AuthHeader({ actionLabel, actionHref }: { actionLabel: string; actionHref: string }) {
  return (
    <header className="border-b border-[#2C401F]/10 bg-[#FBF9F6]/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-[6px] bg-[#2C401F] text-white">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
          <span>Tenadam</span>
        </Link>
        <Link
          href={actionHref}
          className="rounded-[6px] bg-[#E2F0D9] px-4 py-2 text-sm font-black text-[#2C401F] transition hover:bg-[#d4e7c8]"
        >
          {actionLabel}
        </Link>
      </nav>
    </header>
  );
}
