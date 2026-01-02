"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from 'next-intl';

export function Sidebar() {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const pathname = usePathname();

  const menuItems = [
    {
      titleKey: "dashboard",
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      titleKey: "clients",
      href: `/${locale}/clients`,
      icon: Users,
    },
    {
      titleKey: "content",
      href: `/${locale}/content`,
      icon: FileText,
    },
    {
      titleKey: "social",
      href: `/${locale}/social`,
      icon: MessageSquare,
    },
    {
      titleKey: "settings",
      href: `/${locale}/settings`,
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-6">
          <h2 className="text-lg font-semibold">Ness Theme</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.titleKey)}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
