import {
  TrendingUp,
  Globe,
  AlertTriangle,
  Megaphone,
  Sparkles,
  Star,
  Hash,
  Bot,
  Rss,
} from "lucide-react";
import { getDashboardMetrics } from "@/lib/data/dashboard";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const hasData = metrics.globalScore.value > 0 || metrics.mentionsVolume.value > 0 || metrics.recentAlerts.length > 0;

  return (
    <div className="space-y-6">
      {!hasData && <WelcomeBanner />}
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Global Reputation Score */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between glass-panel-hover transition-all min-h-[160px]">
          <div className="flex justify-between items-start">
            <p className="text-slate-400 text-sm font-medium">
              Global Reputation Score
            </p>
            <Globe className="text-primary/50 w-5 h-5" />
          </div>
          <div className="flex items-end gap-4 mt-2">
            <div className="relative size-20 rounded-full flex items-center justify-center conic-gauge shadow-[0_0_20px_rgba(13,162,231,0.15)]">
              <div className="absolute inset-[6px] rounded-full bg-[#15232b] flex items-center justify-center">
                <span className="text-white font-bold text-xl tracking-tighter">
                  {metrics.globalScore.value}
                </span>
              </div>
            </div>
            <div className="flex flex-col mb-1">
              <p className="text-2xl font-bold text-white tracking-tight">
                {metrics.globalScore.value >= 70 ? "Good" : metrics.globalScore.value >= 40 ? "Average" : "Poor"}
              </p>
              <p className="text-[#0bda57] text-xs font-mono font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +{metrics.globalScore.trend}%
              </p>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between glass-panel-hover transition-all min-h-[160px] relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] group-hover:bg-red-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <p className="text-slate-400 text-sm font-medium">
              Critical Alerts
            </p>
            <AlertTriangle className="text-red-500/70 w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col mt-2 relative z-10">
            <p className="text-5xl font-mono font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              {metrics.criticalAlerts.toString().padStart(2, '0')}
            </p>
            <p className="text-red-400 text-xs font-medium mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              Action Required Immediately
            </p>
          </div>
        </div>

        {/* Mentions Volume */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between glass-panel-hover transition-all min-h-[160px]">
          <div className="flex justify-between items-start">
            <p className="text-slate-400 text-sm font-medium">
              Mentions Volume
            </p>
            <Megaphone className="text-slate-600 w-5 h-5" />
          </div>
          <div className="flex flex-col mt-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white tracking-tight">
                {metrics.mentionsVolume.value.toLocaleString()}
              </p>
              <span className="text-[#0bda57] text-xs font-medium bg-[#0bda57]/10 px-1.5 py-0.5 rounded">
                +{metrics.mentionsVolume.trend}%
              </span>
            </div>
            {metrics.mentionsVolume.value > 0 ? (
              <div className="h-10 mt-2 w-full flex items-center justify-center text-xs text-slate-500">
                <span>Chart data will appear as mentions are collected</span>
              </div>
            ) : (
              <div className="h-10 mt-2 w-full flex items-center justify-center text-xs text-slate-500">
                <span>No data yet</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Articles Generated */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between glass-panel-hover transition-all min-h-[160px]">
          <div className="flex justify-between items-start">
            <p className="text-slate-400 text-sm font-medium">
              AI Articles Generated
            </p>
            <Sparkles className="text-purple-400/70 w-5 h-5" />
          </div>
          <div className="flex items-center gap-4 mt-auto">
            <div className="flex flex-col">
              <p className="text-3xl font-bold text-white tracking-tight">
                {metrics.aiContentGenerated.value}
              </p>
              <p className="text-slate-500 text-xs mt-1">Target: {metrics.aiContentGenerated.target}/mo</p>
            </div>
            <div className="ml-auto size-12 rounded-full border-4 border-surface-dark border-t-purple-500 border-r-purple-500 transform -rotate-45 flex items-center justify-center">
              <span className="text-[10px] font-bold text-purple-400 transform rotate-45">
                {Math.round((metrics.aiContentGenerated.value / metrics.aiContentGenerated.target) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Trend Chart */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-white text-lg font-bold tracking-tight">
                Sentiment Trend
              </h3>
              <p className="text-slate-400 text-sm">Last 30 Days Analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-primary shadow-[0_0_8px_#0da2e7]"></span>
                <span className="text-xs text-slate-300">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-slate-600"></span>
                <span className="text-xs text-slate-300">Neutral</span>
              </div>
              <button className="ml-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors text-white">
                Filter
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] w-full flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p className="text-sm">Sentiment trend chart will appear as data is collected</p>
              <p className="text-xs mt-2 text-slate-600">Data from news mentions and social posts</p>
            </div>
          </div>
        </div>

        {/* Live Intelligence Feed */}
        <div className="lg:col-span-1 glass-panel rounded-xl flex flex-col h-full max-h-[500px] lg:max-h-auto">
          <div className="p-5 border-b border-glass-border flex items-center justify-between">
            <h3 className="text-white text-base font-bold tracking-tight">
              Live Intelligence Feed
            </h3>
            <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {metrics.recentAlerts.length === 0 ? (
              <div className="text-center text-slate-500 py-4 text-sm">No recent alerts</div>
            ) : (
              metrics.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex gap-3 group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div className="size-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center border border-yellow-500/20">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex justify-between items-start w-full">
                      <p className="text-sm font-medium text-slate-200 truncate pr-2">
                        {alert.title}
                      </p>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono">
                        {alert.timeAgo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-400">
                        {alert.source}
                      </span>
                      {alert.sentiment && (
                        <span className="text-[10px] text-red-400 font-mono">
                          Neg {Math.abs(alert.sentiment)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-glass-border">
            <button className="w-full py-2 rounded-lg border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors">
              View Full Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
