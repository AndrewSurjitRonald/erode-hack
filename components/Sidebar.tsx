"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { clearSession } from "@/lib/session";
import { useI18n, LanguageToggle } from "@/lib/i18n";
import {
  IconHome,
  IconBookOpen,
  IconFileText,
  IconTrendingUp,
  IconUser,
  IconUsers,
  IconBarChart,
  IconLightbulb,
  IconLogOut,
} from "@/lib/icons";

export type SidebarVariant = "student" | "teacher";

export function Sidebar({ variant, activeItem }: { variant: SidebarVariant; activeItem: string }) {
  const router = useRouter();
  const { t } = useI18n();

  const studentNav = [
    { key: "home", label: t("home"), href: "/dashboard", icon: IconHome },
    { key: "practice", label: t("practice"), href: "/practice", icon: IconBookOpen },
    { key: "revision", label: t("revision"), href: "/revision", icon: IconFileText },
    { key: "progress", label: t("my_progress"), href: "/progress", icon: IconTrendingUp },
    { key: "profile", label: t("profile"), href: "/profile", icon: IconUser },
  ];

  const teacherNav = [
    { key: "dashboard", label: t("dashboard"), href: "/teacher", icon: IconHome },
    { key: "students", label: t("students"), href: "/teacher#students", icon: IconUsers },
    { key: "insights", label: t("class_insights"), href: "/teacher/class-insights", icon: IconBarChart },
    { key: "resources", label: t("resources"), href: "/teacher/resources", icon: IconLightbulb },
  ];

  const items = variant === "student" ? studentNav : teacherNav;

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 bg-white border-r border-slate-200 min-h-screen sticky top-0 py-6 px-4">
      <div className="px-3 mb-8">
        <Logo />
      </div>

      <nav className="flex-1 flex flex-col gap-1.5">
        {items.map((item) => {
          const isActive = item.key === activeItem;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Language Switcher & Logout */}
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
        <div className="px-2">
          <LanguageToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <IconLogOut className="w-4.5 h-4.5 shrink-0 text-slate-400" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
