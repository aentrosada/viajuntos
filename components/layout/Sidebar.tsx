"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import {
  LayoutDashboard,
  Plane,
  Wallet,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  user: {
    full_name: string | null;
    avatar_url: string | null;
    email?: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard",      Icon: LayoutDashboard },
  { href: "/trips",     label: "Minhas Viagens", Icon: Plane },
  { href: "/wallet",   label: "Carteira",        Icon: Wallet },
  { href: "/groups",   label: "Grupos",           Icon: Users },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100 w-64">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
            <span className="text-lg">✈️</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-gray-900 text-sm tracking-tight">ViaJuntos</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Planeje. Junte. Viaje.</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-700"
                )}
              />
              <span className="flex-1">{label}</span>
              {active && (
                <ChevronRight className="size-3.5 text-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
          {/* Avatar */}
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt={user.full_name ?? "Avatar"}
              className="size-8 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="size-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {getInitials(user.full_name)}
            </div>
          )}
          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user.full_name ?? "Usuário"}
            </p>
            {user.email && (
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            )}
          </div>
          {/* Logout */}
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              title="Sair"
              className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <LogOut className="size-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
