"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import { ArrowRight, Building2, Leaf, LockKeyhole, Mail, UserRound } from "lucide-react";
import { registerUser, saveAuthToken } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await registerUser({ name, email, city, password, country: "Ethiopia" });
      saveAuthToken(result.token);
      router.push("/onboarding");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FBF9F6] text-[#1E1E1E]">
      <AuthHeader />

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-8">
        <div>
          <p className="text-xs font-black uppercase text-[#7A4F2A]">Start with Wellness DNA</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] md:text-7xl">
            build your
            <span className="mt-2 block font-serif italic text-[#2C401F]">wellness intelligence.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4D4D4D]">
            Create your account, then unlock personalized scores, coach plans, local food guidance, social wellness,
            marketplace offers, and passport rewards.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { number: "5", label: "wellbeing scores" },
              { number: "7", label: "day coach plan" },
              { number: "1", label: "reward passport" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[8px] bg-[#E2F0D9] p-4">
                <p className="text-4xl font-black text-[#2C401F]">{stat.number}</p>
                <p className="mt-2 text-sm font-semibold text-[#4D4D4D]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[8px] border border-[#2C401F]/10 bg-white p-5 shadow-sm md:p-8">
          <p className="text-xs font-black uppercase text-[#7A4F2A]">Create account</p>
          <h2 className="mt-3 text-3xl font-black">Join Tenadam</h2>

          <div className="mt-7 grid gap-4">
            <Field label="Full name" icon={<UserRound className="size-5 text-[#7A4F2A]" aria-hidden="true" />}>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
                autoComplete="name"
                required
                minLength={2}
                className="h-12 w-full bg-transparent text-base text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/45"
                placeholder="Your name"
              />
            </Field>

            <Field label="Email address" icon={<Mail className="size-5 text-[#7A4F2A]" aria-hidden="true" />}>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                required
                className="h-12 w-full bg-transparent text-base text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/45"
                placeholder="you@example.com"
              />
            </Field>

            <Field label="City" icon={<Building2 className="size-5 text-[#7A4F2A]" aria-hidden="true" />}>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                type="text"
                autoComplete="address-level2"
                className="h-12 w-full bg-transparent text-base text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/45"
                placeholder="Addis Ababa"
              />
            </Field>

            <Field label="Password" icon={<LockKeyhole className="size-5 text-[#7A4F2A]" aria-hidden="true" />}>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="h-12 w-full bg-transparent text-base text-[#1E1E1E] outline-none placeholder:text-[#1E1E1E]/45"
                placeholder="At least 8 characters"
              />
            </Field>
          </div>

          {error ? (
            <p className="mt-5 rounded-[6px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#2C401F] px-5 text-sm font-black uppercase text-white transition hover:bg-[#223118] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create account"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>

          <p className="mt-5 text-center text-sm font-medium text-[#4D4D4D]">
            Already have an account?{" "}
            <Link href="/login" className="font-black text-[#2C401F] underline decoration-[#C5D86D] decoration-2">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#2C401F]">
      {label}
      <span className="flex items-center gap-3 rounded-[6px] border border-[#2C401F]/15 bg-[#FBF9F6] px-3">
        {icon}
        {children}
      </span>
    </label>
  );
}

function AuthHeader() {
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
          href="/login"
          className="rounded-[6px] bg-[#E2F0D9] px-4 py-2 text-sm font-black text-[#2C401F] transition hover:bg-[#d4e7c8]"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
