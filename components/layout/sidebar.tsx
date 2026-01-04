"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Bell,
  Network,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Alerts", href: "/reputation/alerts", icon: Bell, badge: "3" },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Integrations", href: "/settings", icon: Network },
  { name: "Content", href: "/content", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="relative z-20 w-20 lg:w-64 flex flex-col border-r border-glass-border bg-[#101c22]/90 backdrop-blur-xl h-full transition-all duration-300">
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center size-10 rounded-xl bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(13,162,231,0.3)]">
            <span className="material-symbols-outlined text-[24px]">
              security
            </span>
          </div>
          <div className="hidden lg:flex flex-col">
            <h1 className="text-white text-lg font-brand font-medium tracking-tight leading-none">
              nORM
            </h1>
            <span className="text-xs text-slate-400 font-mono tracking-widest uppercase mt-1">
              Command Center
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative overflow-hidden",
                isActive
                  ? "bg-primary/10 border border-primary/20 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 transition-opacity"></div>
              )}
              {/* Using Lucide icons instead of Material Symbols for consistency with existing imports, or I can use span material-symbols if prefered. User HTML used material symbols. I'll mix or swap. sticking to Lucide for now as configured in imports, but I should probably use the material class if I want exact look. I'll use Lucide mapped to the structure. */}

              <Icon
                className={cn(
                  "w-6 h-6 z-10",
                  isActive
                    ? "text-primary"
                    : "group-hover:text-primary transition-colors"
                )}
              />

              <span className="hidden lg:block font-medium text-sm z-10">
                {item.name}
              </span>

              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full shadow-[0_0_10px_#0da2e7]"></div>
              )}

              {item.badge && (
                <span className="hidden lg:flex items-center justify-center ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 z-10">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-glass-border">
        <div className="flex items-center gap-3">
          <div className="relative size-10 rounded-full overflow-hidden border border-white/10">
            {/* Using generic avatar for now */}
            <img
              alt="Commander Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2mcCQoIP8DgjplUSw9lZUWn39z_4YePYsZ9XbdJ5kYWC8KAcWLkVIKFS6PQ7sz6HPNjat9MMnnGeZKtaSRMFobo1xkAgJk5n7BSpkjc6iLVepR1xhevspa4mv7RuFVFxM5pdxe3FTNK4zKnD24dzmOnlNaKlEM3gkfFdTl5ReIbbyGaLOxJDxIAs7yCKFzdzArXnfxVhjZMpMjSM-yu1SMC47tyLFB_gWNUAXc6alYgXIcjAUm9XWGpSGoQ7E4vXH-96sDwf9bzOC"
            />
            <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-[#101c22] rounded-full"></div>
          </div>
          <div className="hidden lg:block overflow-hidden flex-1">
            <p className="text-sm font-medium text-white truncate">
              Cmdr. Shepard
            </p>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-red-400 truncate flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" /> Log Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
