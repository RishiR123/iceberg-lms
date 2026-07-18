"use client";

import Link from "next/link";
import { BookOpen, Users, Eye, UserCircle, LogOut } from "lucide-react";

export type AdminSection = "courses" | "people";

export function AdminSidebar({
  section,
  onSelect,
  courseCount,
  userCount,
  userName,
}: {
  section: AdminSection;
  onSelect: (s: AdminSection) => void;
  courseCount: number;
  userCount: number;
  userName: string;
}) {
  const items: { id: AdminSection; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "courses", label: "Courses", icon: <BookOpen className="w-4 h-4" />, count: courseCount },
    { id: "people", label: "People", icon: <Users className="w-4 h-4" />, count: userCount },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0B012C] text-white flex flex-col h-full select-none">
      {/* Brand */}
      <div className="px-5 h-14 flex items-center gap-2 border-b border-white/10 flex-shrink-0">
        <span className="text-lg">🧊</span>
        <span className="font-black text-sm tracking-tight">Iceberg</span>
        <span className="ml-auto text-[8px] font-black uppercase tracking-wider bg-white/15 px-1.5 py-0.5 rounded">
          Admin
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-black uppercase tracking-wider text-white/35 px-2 pt-2 pb-1.5">Manage</p>
        {items.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-current={active ? "page" : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                active ? "bg-white text-[#0B012C] shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              <span
                className={`ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  active ? "bg-[#0B012C]/10 text-[#0B012C]" : "bg-white/10 text-white/50"
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}

        <p className="text-[9px] font-black uppercase tracking-wider text-white/35 px-2 pt-5 pb-1.5">Elsewhere</p>
        <Link
          href="/dashboard"
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all !no-underline hover:!no-underline"
        >
          <Eye className="w-4 h-4" /> View as learner
        </Link>
        <Link
          href="/profile"
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all !no-underline hover:!no-underline"
        >
          <UserCircle className="w-4 h-4" /> My account
        </Link>
      </nav>

      {/* Who's signed in */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/5">
          <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-[#FEF08A] text-[#0B012C] flex items-center justify-center font-black text-[11px]">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold truncate">{userName}</p>
            <p className="text-[9px] text-white/40 font-semibold">Administrator</p>
          </div>
          <Link href="/profile" title="Account" className="text-white/40 hover:text-white transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
