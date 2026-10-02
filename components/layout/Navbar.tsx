"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import {
  LayoutDashboard,
  Plane,
  Wallet,
  Users,
  Bell,
  Plus,
} from "lucide-react";

interface NavbarProps {
  user: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const navItems = [
  { href: "/dashboard", label: "Início",  Icon: LayoutDashboard },
  { href: "/trips",     label: "Viagens", Icon: Plane },
  { href: "/wallet",   label: "Carteira", Icon: Wallet },
  { href: "/groups",   label: "Grupos",   Icon: Users },
];

/** Top bar (desktop) + bottom tab bar (mobile) */
export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop top bar ─────────────────────────────────── */}
      <header className="hidden md:flex items-center justify-between h-14 px-6 bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
        <div />

        <div className="flex items-center gap-2">
          {/* New trip CTA */}
          <Link
            href="/trips/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus className="size-3.5" />
            Nova Viagem
          </Link>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-rose-500" />
          </button>

          {/* Avatar */}
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt={user.full_name ?? "Avatar"}
              className="size-8 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="size-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(user.full_name)}
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile bottom tab bar ────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100">
        <div className="flex items-center">
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors",
                  active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium">{label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-indigo-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
