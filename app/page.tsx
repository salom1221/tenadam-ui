import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  HandHeart,
  Leaf,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

interface NavLink {
  label: string;
  url: string;
}

interface StatItem {
  number: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Wellness DNA", url: "#wellness-dna" },
  { label: "AI Coach", url: "#ai-coach" },
  { label: "Marketplace", url: "#marketplace" },
];

const STATISTICS: StatItem[] = [
  { number: "5", label: "wellbeing scores" },
  { number: "100+", label: "local habits mapped" },
  { number: "4", label: "provider lead paths" },
];

const scoreCards = [
  { label: "Physical Health", value: 82, tone: "bg-[#C5D86D]" },
  { label: "Mental Wellbeing", value: 68, tone: "bg-[#F0B86E]" },
  { label: "Social Wellbeing", value: 74, tone: "bg-[#92B6A5]" },
  { label: "Growth", value: 79, tone: "bg-[#E2F0D9]" },
];

const platformFeatures = [
  {
    icon: Brain,
    title: "AI Lifestyle Coach",
    text: "Turns sleep, stress, work type, movement, and goals into daily routines, weekly plans, and risk alerts.",
  },
  {
    icon: Activity,
    title: "Fitness & Nutrition Planner",
    text: "Creates BMI-aware workout plans with local foods like injera, shiro, lentils, chickpeas, and teff meals.",
  },
  {
    icon: Users,
    title: "Social Wellness Engine",
    text: "Recommends church groups, volunteer circles, youth communities, sports groups, and book clubs.",
  },
];

const marketplaceItems = [
  "Nearby spa and massage offers for high-stress users",
  "Water park and recreation recommendations for burnout recovery",
  "Gym, yoga, retreat, and community partners with qualified leads",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FBF9F6] text-[#1E1E1E]">
      <header className="sticky top-0 z-20 border-b border-[#2C401F]/10 bg-[#FBF9F6]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-[6px] bg-[#2C401F] text-white">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <span>Tenadam</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-[#2C401F] md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.url} className="transition hover:text-[#7A4F2A]">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-[6px] px-4 py-2 text-sm font-semibold text-[#2C401F] transition hover:bg-[#E2F0D9] sm:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-[6px] bg-[#C5D86D] px-4 py-2 text-sm font-bold text-[#1E1E1E] shadow-sm transition hover:bg-[#b8cd5c]"
            >
              Start
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-[#2C401F] text-white">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-[4px] bg-white/10 px-3 py-1 text-xs font-bold uppercase text-[#C5D86D]">
              African Wellness Intelligence Ecosystem
            </p>
            <h1 className="text-5xl font-black leading-[0.95] md:text-7xl lg:text-8xl">
              know your body.
              <span className="mt-2 block font-serif italic text-[#C5D86D]">live more alive.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 md:text-xl">
              A wellness platform that connects people, AI coaching, local foods, social support, and nearby
              wellness providers into one intelligent journey.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#C5D86D] px-6 py-4 text-sm font-black uppercase text-[#1E1E1E] transition hover:bg-[#b8cd5c]"
              >
                Start Wellness DNA
                <Sparkles className="size-4" aria-hidden="true" />
              </Link>
              <a
                href="#marketplace"
                className="inline-flex items-center justify-center rounded-[6px] border border-white/25 px-6 py-4 text-sm font-black uppercase text-white transition hover:bg-white/10"
              >
                Explore Marketplace
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[8px] border border-white/14 bg-[#FBF9F6] p-4 text-[#1E1E1E] shadow-2xl md:p-5">
              <div className="flex items-center justify-between border-b border-[#2C401F]/10 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[#7A4F2A]">Live Wellness Score</p>
                  <h2 className="mt-1 text-2xl font-black">Wellness DNA</h2>
                </div>
                <div className="flex size-20 items-center justify-center rounded-[8px] bg-[#2C401F] text-3xl font-black text-[#C5D86D]">
                  76
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {scoreCards.map((score) => (
                  <div key={score.label} className="rounded-[8px] border border-[#2C401F]/10 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between text-sm font-bold">
                      <span>{score.label}</span>
                      <span>{score.value}/100</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-[3px] bg-[#E8E1D8]">
                      <div className={`h-full ${score.tone}`} style={{ width: `${score.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[8px] bg-[#E2F0D9] p-4">
                <p className="text-xs font-bold uppercase text-[#2C401F]">AI Coach Insight</p>
                <p className="mt-2 leading-7">
                  You sit 9 hours/day, sleep 5 hours, and report high stress. Start with a 15-minute evening walk,
                  reduce caffeine after 4 PM, and target 7 hours of sleep.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-10 bg-[#FBF9F6] [clip-path:polygon(0_58%,100%_0,100%_100%,0_100%)]" />
      </section>

      <section id="wellness-dna" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-8 rounded-[8px] bg-[#E2F0D9] p-5 md:grid-cols-[0.85fr_1.15fr] md:p-8">
          <div>
            <p className="text-xs font-black uppercase text-[#7A4F2A]">Guide yourself back to health</p>
            <h2 className="mt-3 max-w-xl text-4xl font-black leading-tight md:text-6xl">
              wellness intelligence school
            </h2>
          </div>
          <div className="grid gap-5">
            <p className="max-w-2xl text-xl font-semibold leading-8">
              Users answer a simple assessment about work, sleep, stress, exercise, nutrition, social life, and goals.
              Tenadam turns it into scores, coach plans, and next best actions.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {STATISTICS.map((stat) => (
                <div key={stat.label} className="rounded-[8px] bg-[#FBF9F6] p-4">
                  <p className="text-4xl font-black text-[#2C401F]">{stat.number}</p>
                  <p className="mt-2 text-sm font-semibold text-[#4D4D4D]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="ai-coach" className="bg-[#FBF9F6] px-5 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase text-[#7A4F2A]">Live more vibrantly</p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              A wellness routine that works with your life, not against it.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#4D4D4D]">
              Tenadam helps users ditch guesswork by translating real-life patterns into practical routines, local
              food choices, social support, and measurable growth.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {platformFeatures.map((feature) => (
              <article key={feature.title} className="rounded-[8px] border border-[#2C401F]/10 bg-white p-5">
                <feature.icon className="size-8 text-[#2C401F]" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
                <p className="mt-3 leading-7 text-[#4D4D4D]">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="marketplace" className="mt-12 bg-[#2C401F] px-5 py-16 text-white md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-center">
          <div>
            <p className="text-xs font-black uppercase text-[#C5D86D]">Sponsor-ready feature</p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              Wellness marketplace that sends qualified leads to local providers.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/78">
              If a user shows high stress, poor sleep, and no recreation, Tenadam can recommend recovery experiences
              nearby and turn interest into provider leads.
            </p>
          </div>

          <div className="rounded-[8px] bg-[#FBF9F6] p-5 text-[#1E1E1E]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[#7A4F2A]">Nearby offers</p>
                <h3 className="text-2xl font-black">Addis Ababa</h3>
              </div>
              <MapPin className="size-7 text-[#2C401F]" aria-hidden="true" />
            </div>
            <div className="grid gap-3">
              {marketplaceItems.map((item) => (
                <div key={item} className="flex gap-3 rounded-[8px] border border-[#2C401F]/10 bg-white p-4">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-[#2C401F]" aria-hidden="true" />
                  <p className="font-semibold leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#2C401F]/10 bg-[#FBF9F6] px-5 py-10 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex size-9 items-center justify-center rounded-[6px] bg-[#2C401F] text-white">
                <Leaf className="size-5" aria-hidden="true" />
              </span>
              <span>Tenadam</span>
            </Link>
            <p className="mt-4 max-w-md leading-7 text-[#4D4D4D]">
              African wellness intelligence for personalized coaching, local nutrition, social wellbeing, and
              sponsor-ready wellness provider recommendations.
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase text-[#7A4F2A]">Platform</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-[#2C401F]">
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.url} className="transition hover:text-[#7A4F2A]">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase text-[#7A4F2A]">Get Started</p>
            <div className="mt-4 grid gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 font-black text-[#2C401F]">
                Create your account
                <HandHeart className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/login" className="font-semibold text-[#4D4D4D] transition hover:text-[#2C401F]">
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-[#2C401F]/10 pt-5 text-sm font-semibold text-[#4D4D4D] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Tenadam Wellness Intelligence.</p>
          <p>Built for people, communities, and local wellness providers.</p>
        </div>
      </footer>
    </main>
  );
}
