"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { clearSession } from "@/lib/session";
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

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

const STUDENT_NAV: NavItem[] = [
  { key: "home", label: "Home", href: "/dashboard", icon: IconHome },
  { key: "practice", label: "Practice", href: "/practice", icon: IconBookOpen },
  { key: "revision", label: "Revision", href: "/revision", icon: IconFileText },
  { key: "progress", label: "My Progress", href: "/dashboard", icon: IconTrendingUp },
  { key: "profile", label: "Profile", href: "/dashboard", icon: IconUser },
];

const TEACHER_NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/teacher", icon: IconHome },
  { key: "students", label: "Students", href: "/teacher", icon: IconUsers },
  { key: "insights", label: "Class Insights", href: "/teacher", icon: IconBarChart },
  { key: "resources", label: "Resources", href: "/teacher", icon: IconLightbulb },
];

export function Sidebar({ variant, activeItem }: { variant: SidebarVariant; activeItem: string }) {
  const router = useRouter();
  const items = variant === "student" ? STUDENT_NAV : TEACHER_NAV;

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  return (
    <aside className="hidden lg:flex flex-col w-[220px] shrink-0 bg-dark min-h-screen sticky top-0 py-6 px-4">
      <div className="px-2 mb-8">
        <Logo light />
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {items.map((item) => {
          const isActive = item.key === activeItem;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-white/10 text-white border-l-4 border-accent pl-2.5"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors"
      >
        <IconLogOut className="w-4.5 h-4.5 shrink-0" />
        Log out
      </button>
    </aside>
  );
}
