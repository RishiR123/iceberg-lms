"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/Logo";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/authActions";

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const res = await logoutAction();
    if (res && res.success) {
      router.push("/login");
      router.refresh();
    }
  };

  // Hidden on the landing page, both portals, and admin (which has its own sidebar).
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/adminlogin" ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  const initial = user?.name ? user.name.slice(0, 1).toUpperCase() : "T";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E2E8F0]/40 bg-white/80 backdrop-blur-md">
      <div className="container flex h-14 items-center px-6 max-w-7xl mx-auto justify-between gap-6">
        {/* Brand → the learner's home */}
        <Link href="/dashboard" className="text-[#0F172A] !no-underline hover:!no-underline">
          <Logo markClassName="w-5 h-5" className="text-base" />
        </Link>

        <div className="flex items-center space-x-4 select-none">
          <Link
            href="/dashboard"
            className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors !no-underline hover:!no-underline inline-flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors !no-underline hover:!no-underline"
            >
              Admin
            </Link>
          )}

          {/* Profile Avatar Button */}
          <Link
            href="/profile"
            title="View profile"
            className="relative group !no-underline hover:!no-underline"
          >
            <div className="w-8 h-8 rounded-full bg-[#4F46E5] group-hover:bg-[#4338CA] text-white flex items-center justify-center font-black text-[11px] transition-all">
              {initial}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full" />
          </Link>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
