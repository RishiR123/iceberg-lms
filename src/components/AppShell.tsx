"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  BarChart3,
  ShieldCheck,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { logoutAction } from "@/app/actions/authActions";

type ShellUser = { id: string; name: string; email: string; role: string } | null;

// Routes that render on their own (no global shell): public pages, the two
// portals, the admin workspace (its own sidebar), and the focused learn view
// (its own module sidebar).
function isBareRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/adminlogin" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/learn/")
  );
}

// Friendly labels for the breadcrumb, keyed by the first path segment.
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Home",
  courses: "My Courses",
  progress: "Progress",
  profile: "Profile",
  course: "Course",
};

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  if (isBareRoute(pathname)) {
    return <main className="flex-1 flex flex-col min-h-screen">{children}</main>;
  }

  const nav = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/courses", label: "My Courses", icon: BookOpen },
    { href: "/progress", label: "Progress", icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const initial = user?.name ? user.name.slice(0, 1).toUpperCase() : "U";
  const segments = pathname.split("/").filter(Boolean);

  const handleLogout = async () => {
    const res = await logoutAction();
    if (res?.success) {
      router.push("/login");
      router.refresh();
    }
  };

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Home }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`flex items-center gap-2.5 rounded-lg text-xs font-semibold transition-colors !no-underline hover:!no-underline ${
          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
        } ${active ? "bg-[#0F172A] text-white" : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"}`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col h-full transition-all ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className={`h-14 flex items-center border-b border-[#E2E8F0] flex-shrink-0 ${collapsed ? "justify-center px-2" : "px-5"}`}>
          <Link href="/dashboard" className="text-[#0F172A] !no-underline hover:!no-underline">
            {collapsed ? <LogoMark className="w-5 h-5" /> : <Logo markClassName="w-5 h-5" className="text-base" />}
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}

          {user?.role === "ADMIN" && (
            <>
              <div className={`pt-4 pb-1.5 ${collapsed ? "px-0" : "px-3"}`}>
                {!collapsed && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Admin</span>
                )}
              </div>
              <Link
                href="/admin"
                title={collapsed ? "Admin workspace" : undefined}
                className={`flex items-center gap-2.5 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors !no-underline hover:!no-underline ${
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                }`}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>Admin workspace</span>}
              </Link>
            </>
          )}
        </nav>

        {/* User + collapse */}
        <div className="p-3 border-t border-[#E2E8F0] flex-shrink-0 space-y-2">
          <Link
            href="/profile"
            title={collapsed ? user?.name : undefined}
            className={`flex items-center gap-2.5 rounded-lg hover:bg-[#F1F5F9] transition-colors !no-underline hover:!no-underline ${
              collapsed ? "justify-center p-2" : "p-2"
            }`}
          >
            <div className="w-7 h-7 flex-shrink-0 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-black text-[11px]">
              {initial}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[#0F172A] truncate">{user?.name}</p>
                <p className="text-[9px] text-[#64748B] font-semibold">
                  {user?.role === "ADMIN" ? "Administrator" : "Student"}
                </p>
              </div>
            )}
          </Link>

          <div className={`flex ${collapsed ? "flex-col gap-1" : "items-center gap-1"}`}>
            <button
              onClick={handleLogout}
              title="Sign out"
              className={`flex items-center gap-1.5 rounded-lg text-[10px] font-bold text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer ${
                collapsed ? "justify-center p-2" : "flex-1 px-2 py-1.5"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              {!collapsed && <span>Sign out</span>}
            </button>
            <button
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expand" : "Collapse"}
              className="flex items-center justify-center p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              {collapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top bar with breadcrumb */}
        <header className="h-14 flex-shrink-0 border-b border-[#E2E8F0] bg-white flex items-center px-6">
          <nav className="flex items-center gap-1.5 text-xs font-semibold min-w-0" aria-label="Breadcrumb">
            <Link href="/dashboard" className="text-[#64748B] hover:text-[#0F172A] !no-underline hover:!no-underline">
              Home
            </Link>
            {segments.map((seg, i) => {
              const label = SEGMENT_LABELS[seg] ?? (seg.length > 12 ? "Detail" : seg);
              const last = i === segments.length - 1;
              if (seg === "dashboard") return null; // already shown as Home root
              return (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                  <span className={last ? "text-[#0F172A] truncate" : "text-[#64748B]"}>{label}</span>
                </span>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
