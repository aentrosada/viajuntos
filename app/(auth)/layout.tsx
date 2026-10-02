import type { Metadata } from "next";
import Link from "next/link";
import { Plane } from "lucide-react";

export const metadata: Metadata = {
  title: "ViaJuntos — Acesse sua conta",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-100/50 blur-2xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center py-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-300 transition-shadow">
            <Plane className="w-5 h-5 text-white fill-white" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
            ViaJuntos
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-sm text-slate-400">
        © {new Date().getFullYear()} ViaJuntos · Planeje. Junte. Viaje.
      </footer>
    </div>
  );
}
