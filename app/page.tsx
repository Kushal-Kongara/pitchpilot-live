import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Upload your visual",
    description:
      "Drop in a slide, demo screenshot, or product mockup. PitchPilot reads the visual context alongside your words.",
  },
  {
    number: "02",
    title: "Paste your pitch",
    description:
      "Dump your draft script or talking points. Rough is fine — that's exactly what we're here to fix.",
  },
  {
    number: "03",
    title: "Get coached",
    description:
      "Receive a scored report: clarity, demo flow, missing elements, an improved pitch, and the questions judges will ask.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-white tracking-tight">
          PitchPilot{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Live
          </span>
        </span>
        <Link
          href="/practice"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Practice →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-300">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          AI-Powered Demo Coaching
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Pitch better.{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Demo sharper.
          </span>{" "}
          Win the room.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-lg text-slate-400 leading-relaxed">
          Upload your slide or demo screenshot, paste your pitch, and get
          instant AI coaching on story clarity, demo flow, and judge readiness —
          in seconds.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/practice"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 hover:shadow-blue-500/30 hover:scale-[1.02]"
          >
            Start Practice
          </Link>
          <span className="text-sm text-slate-500">No sign-up required</span>
        </div>
      </section>

      {/* 3-step section */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500 mb-12">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-200"
              >
                <div className="mb-4 text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {step.number}
                </div>
                <h3 className="mb-2 font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6 text-center text-xs text-slate-600">
        PitchPilot Live — built for hackathons
      </footer>
    </main>
  );
}
