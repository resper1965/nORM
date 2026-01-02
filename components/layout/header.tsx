"use client";

import { Bell, MessageSquare, Search } from "lucide-react";

export function Header() {
  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-glass-border backdrop-blur-sm bg-background-dark/50 sticky top-0 z-30">
      <div className="flex flex-col justify-center">
        <h2 className="text-white text-lg font-bold tracking-tight">
          Welcome back, Commander
        </h2>
        <p className="text-xs text-primary/80 font-mono uppercase tracking-wider">
          System Status: Online
        </p>
      </div>
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="hidden md:flex items-center h-10 w-64 bg-surface-dark/50 border border-white/10 rounded-xl px-3 focus-within:border-primary/50 focus-within:bg-surface-dark transition-all group">
          <Search className="text-slate-500 group-focus-within:text-primary w-5 h-5 mr-2" />
          <input
            className="bg-transparent border-none text-sm text-white placeholder-slate-500 focus:ring-0 focus:outline-none w-full h-full"
            placeholder="Search intelligence..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="size-10 flex items-center justify-center rounded-xl bg-surface-dark/50 border border-white/10 text-slate-400 hover:text-white hover:border-primary/30 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <button className="size-10 flex items-center justify-center rounded-xl bg-surface-dark/50 border border-white/10 text-slate-400 hover:text-white hover:border-primary/30 transition-all">
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
