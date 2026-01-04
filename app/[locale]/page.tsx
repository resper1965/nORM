import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-background-dark font-display text-slate-200 antialiased overflow-x-hidden selection:bg-primary selection:text-white min-h-screen">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[100px] rounded-full opacity-20"></div>
        <div className="absolute inset-0 bg-grid-pattern [background-size:40px_40px] opacity-[0.03]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl">
                shield_lock
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              nORM
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              href="#how-it-works"
            >
              How it Works
            </a>
            <a
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              href="#enterprise"
            >
              Enterprise
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              className="hidden sm:block text-sm font-bold text-white hover:text-primary transition-colors"
              href="/login"
            >
              Log In
            </Link>
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-blue-600 text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-all shadow-[0_0_20px_rgba(19,55,236,0.3)] hover:shadow-[0_0_30px_rgba(19,55,236,0.5)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center w-full pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl w-full px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-8 mb-24">
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left pt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-primary/30 w-fit mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                AI Defense Active
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Control the Narrative.
              <br />
              <span className="text-gradient-primary">Master Your Legacy.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              nORM uses advanced AI to monitor, manage, and protect your
              personal and enterprise reputation in real-time. Stop reacting.
              Start dominating.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
              <Link
                href="/dashboard"
                className="bg-primary hover:bg-blue-600 text-white text-base font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(19,55,236,0.3)] hover:scale-105"
              >
                Start Free Trial
              </Link>
              <button className="glass-panel hover:bg-white/5 text-white text-base font-bold py-4 px-8 rounded-xl border border-white/10 transition-all hover:scale-105 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">play_circle</span>
                View Demo
              </button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-6 text-sm text-slate-500">
              <div className="flex -space-x-2">
                <div
                  className="size-8 rounded-full bg-slate-700 border-2 border-background-dark bg-cover"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(13, 162, 231, 0.1) 0%, rgba(13, 162, 231, 0.05) 100%)",
                  }}
                ></div>
                <div
                  className="size-8 rounded-full bg-slate-700 border-2 border-background-dark bg-cover"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(13, 162, 231, 0.1) 0%, rgba(13, 162, 231, 0.05) 100%)",
                  }}
                ></div>
                <div
                  className="size-8 rounded-full bg-slate-700 border-2 border-background-dark bg-cover"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(13, 162, 231, 0.1) 0%, rgba(13, 162, 231, 0.05) 100%)",
                  }}
                ></div>
              </div>
              <p>Trusted by 2,000+ executives</p>
            </div>
          </div>
          <div className="flex-1 w-full perspective-container flex justify-center lg:justify-end relative">
            {/* Decorative Glow behind dashboard */}
            <div className="absolute inset-0 bg-primary/30 blur-[80px] rounded-full z-0 transform translate-x-10 translate-y-10"></div>
            {/* 3D Glass Dashboard Mockup */}
            <div className="tilted-dashboard relative z-10 w-full max-w-lg aspect-[4/3] rounded-xl glass-panel-strong overflow-hidden border border-white/20">
              {/* Fake UI Header */}
              <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2 bg-white/5">
                <div className="size-3 rounded-full bg-red-500/50"></div>
                <div className="size-3 rounded-full bg-yellow-500/50"></div>
                <div className="size-3 rounded-full bg-green-500/50"></div>
                <div className="ml-4 h-4 w-32 bg-white/10 rounded-full"></div>
              </div>
              {/* Fake UI Body */}
              <div className="p-6 grid grid-cols-3 gap-4 h-full">
                {/* Sidebar */}
                <div className="col-span-1 flex flex-col gap-3 border-r border-white/5 pr-4">
                  <div className="h-8 w-full bg-primary/20 rounded-lg"></div>
                  <div className="h-4 w-3/4 bg-white/5 rounded-lg"></div>
                  <div className="h-4 w-2/3 bg-white/5 rounded-lg"></div>
                  <div className="h-4 w-4/5 bg-white/5 rounded-lg"></div>
                  <div className="mt-auto h-24 w-full bg-gradient-to-t from-primary/10 to-transparent rounded-lg border border-primary/20 flex flex-col items-center justify-center p-2">
                    <span className="text-3xl font-bold text-white">98</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">
                      Trust Score
                    </span>
                  </div>
                </div>
                {/* Main Content */}
                <div className="col-span-2 flex flex-col gap-4">
                  {/* Chart Area */}
                  <div className="h-32 w-full glass-panel rounded-lg border border-white/5 p-3 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/20 to-transparent"></div>
                    {/* Simple SVG Chart Line */}
                    <svg
                      className="w-full h-full"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 40"
                    >
                      <path
                        d="M0 30 Q 10 25, 20 28 T 40 20 T 60 15 T 80 10 T 100 5"
                        fill="none"
                        stroke="#1337ec"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </div>
                  {/* List Items */}
                  <div className="flex flex-col gap-2">
                    <div className="h-10 w-full bg-white/5 rounded-lg flex items-center px-3 gap-3">
                      <div className="size-6 rounded bg-green-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-400 text-xs">
                          check
                        </span>
                      </div>
                      <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                    </div>
                    <div className="h-10 w-full bg-white/5 rounded-lg flex items-center px-3 gap-3">
                      <div className="size-6 rounded bg-green-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-400 text-xs">
                          check
                        </span>
                      </div>
                      <div className="h-2 w-1/3 bg-white/10 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Alert Badge */}
              <div className="absolute bottom-6 right-6 glass-panel-strong px-4 py-3 rounded-lg border border-primary/50 shadow-lg shadow-primary/20 flex items-center gap-3 animate-bounce">
                <span className="material-symbols-outlined text-primary">
                  security
                </span>
                <div>
                  <p className="text-xs text-slate-400 uppercase">
                    Threat Detected
                  </p>
                  <p className="text-sm font-bold text-white">Neutralized</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="w-full border-y border-white/5 bg-white/[0.01] py-10 mb-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-8">
              Trusted by elite teams at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-xl font-bold font-display">
                <span className="material-symbols-outlined">diamond</span> ONYX
              </div>
              <div className="flex items-center gap-2 text-xl font-bold font-display">
                <span className="material-symbols-outlined">
                  change_history
                </span>{" "}
                DELTA
              </div>
              <div className="flex items-center gap-2 text-xl font-bold font-display">
                <span className="material-symbols-outlined">hexagon</span> HEXA
              </div>
              <div className="flex items-center gap-2 text-xl font-bold font-display">
                <span className="material-symbols-outlined">all_inclusive</span>{" "}
                INFINITY
              </div>
              <div className="flex items-center gap-2 text-xl font-bold font-display">
                <span className="material-symbols-outlined">language</span>{" "}
                GLOBEX
              </div>
            </div>
          </div>
        </section>

        {/* Problem vs Solution */}
        <section className="max-w-7xl w-full px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              The Old Way <span className="text-slate-500">vs.</span> The nORM
              Way
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Stop relying on reactive, manual processes. Switch to proactive,
              AI-automated defense.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="glass-panel p-8 rounded-2xl border-red-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-red-500 text-8xl">
                  cancel
                </span>
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">close</span>{" "}
                Reactive Chaos
              </h3>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 shrink-0">
                    sentiment_dissatisfied
                  </span>
                  <span>Manually Googling yourself every week.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 shrink-0">
                    hourglass_empty
                  </span>
                  <span>Hours wasted drafting crisis responses.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-500 shrink-0">
                    visibility_off
                  </span>
                  <span>Invisible threats on the dark web.</span>
                </li>
              </ul>
            </div>
            {/* The nORM Way */}
            <div className="glass-panel-strong p-8 rounded-2xl border-primary/50 relative overflow-hidden group shadow-[0_0_50px_-20px_rgba(19,55,236,0.3)]">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-primary text-8xl">
                  check_circle
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  verified
                </span>{" "}
                Proactive Control
              </h3>
              <ul className="space-y-4 text-slate-200">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary shrink-0">
                    bolt
                  </span>
                  <span>
                    Real-time alerts the second your name is mentioned.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary shrink-0">
                    auto_awesome
                  </span>
                  <span>AI-generated responses ready to deploy instantly.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary shrink-0">
                    radar
                  </span>
                  <span>24/7 Deep Web scanning & sentiment analysis.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="max-w-7xl w-full px-6 mb-32" id="features">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                Intelligence Suite
              </h2>
              <p className="text-slate-400 text-lg">
                Everything you need to secure your digital presence.
              </p>
            </div>
            <button className="text-primary font-bold hover:text-white transition-colors flex items-center gap-2 group">
              View all features{" "}
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors group">
              <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">speed</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Reputation Score
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Live algorithmic gauge of your digital trust score aggregated
                across 50+ platforms.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors group">
              <div className="size-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">edit_note</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                AI Content Studio
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate crisis press releases, tweets, and blog posts in
                seconds with context-aware AI.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors group">
              <div className="size-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-6 text-red-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">
                  travel_explore
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Crisis Watchtower
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                24/7 dark web and social listening to catch threats before they
                go viral.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="glass-panel p-6 rounded-2xl hover:bg-white/5 transition-colors group">
              <div className="size-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Agency Hub</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Manage multiple client portfolios from a single glass dashboard
                with granular permissions.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="max-w-7xl w-full px-6 mb-32" id="pricing">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Investment Plans
            </h2>
            <p className="text-slate-400">
              Choose the level of protection your reputation demands.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Starter */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-400">Starter</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold text-white">$49</span>
                  <span className="text-slate-500">/mo</span>
                </div>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-500">
                    check
                  </span>{" "}
                  1 Personal Brand
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-500">
                    check
                  </span>{" "}
                  Weekly Scans
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-500">
                    check
                  </span>{" "}
                  Basic Email Alerts
                </li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors font-bold text-white mt-auto">
                Choose Starter
              </button>
            </div>
            {/* Professional */}
            <div className="glass-panel-strong p-8 rounded-2xl flex flex-col gap-6 border-primary/60 shadow-[0_0_40px_-10px_rgba(19,55,236,0.3)] relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recommended
              </div>
              <div>
                <h3 className="text-lg font-medium text-primary">
                  Professional
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-5xl font-bold text-white">$199</span>
                  <span className="text-slate-500">/mo</span>
                </div>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-slate-200">
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">
                    check_circle
                  </span>{" "}
                  Up to 5 Profiles
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">
                    check_circle
                  </span>{" "}
                  Real-Time Monitoring
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">
                    check_circle
                  </span>{" "}
                  AI Content Generator
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">
                    check_circle
                  </span>{" "}
                  Crisis Alerts (SMS)
                </li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-primary hover:bg-blue-600 transition-colors font-bold text-white shadow-lg shadow-primary/25 mt-auto">
                Get Professional
              </button>
            </div>
            {/* Agency */}
            <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-400">Agency</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold text-white">$499</span>
                  <span className="text-slate-500">/mo</span>
                </div>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-500">
                    check
                  </span>{" "}
                  Unlimited Profiles
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-500">
                    check
                  </span>{" "}
                  White-label Reports
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-500">
                    check
                  </span>{" "}
                  API Access
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-500">
                    check
                  </span>{" "}
                  Dedicated Manager
                </li>
              </ul>
              <button className="w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors font-bold text-white mt-auto">
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/10 pt-16 pb-8 px-6 bg-[#02050a]">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col lg:flex-row justify-between gap-12">
              <div className="flex flex-col gap-6 max-w-sm">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">
                      shield_lock
                    </span>
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white">
                    nORM
                  </span>
                </div>
                <p className="text-slate-500 text-sm">
                  The advanced operating system for your digital reputation.
                  Don't let the internet define you. Define yourself.
                </p>
              </div>
              <div className="flex gap-16 flex-wrap">
                <div className="flex flex-col gap-4">
                  <h4 className="text-white font-bold">Product</h4>
                  <a
                    className="text-slate-500 hover:text-primary text-sm"
                    href="#"
                  >
                    Features
                  </a>
                  <a
                    className="text-slate-500 hover:text-primary text-sm"
                    href="#"
                  >
                    Integration
                  </a>
                  <a
                    className="text-slate-500 hover:text-primary text-sm"
                    href="#"
                  >
                    Enterprise
                  </a>
                  <a
                    className="text-slate-500 hover:text-primary text-sm"
                    href="#"
                  >
                    Changelog
                  </a>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-white font-bold">Company</h4>
                  <a
                    className="text-slate-500 hover:text-primary text-sm"
                    href="#"
                  >
                    About
                  </a>
                  <a
                    className="text-slate-500 hover:text-primary text-sm"
                    href="#"
                  >
                    Careers
                  </a>
                  <a
                    className="text-slate-500 hover:text-primary text-sm"
                    href="#"
                  >
                    Legal
                  </a>
                  <a
                    className="text-slate-500 hover:text-primary text-sm"
                    href="#"
                  >
                    Contact
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-4 min-w-[300px]">
                <h4 className="text-white font-bold">Stay Updated</h4>
                <div className="flex gap-2">
                  <input
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary w-full placeholder:text-slate-600"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <button className="bg-white/10 hover:bg-primary text-white p-2 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  We care about your data in our privacy policy.
                </p>
              </div>
            </div>
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-600">
                © 2024 nORM Inc. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a
                  className="text-slate-600 hover:text-white transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-lg">
                    public
                  </span>
                </a>
                <a
                  className="text-slate-600 hover:text-white transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-lg">
                    alternate_email
                  </span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
