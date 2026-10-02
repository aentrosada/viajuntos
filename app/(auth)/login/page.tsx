"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Schema ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Form Content ─────────────────────────────────────────────────────────────

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error("Falha ao entrar", {
        description:
          error.message === "Invalid login credentials"
            ? "E-mail ou senha incorretos."
            : error.message,
      });
      return;
    }

    toast.success("Bem-vindo de volta! ✈️");
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Entrar na sua conta
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acesse suas viagens e acompanhe suas metas
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                disabled={isSubmitting}
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all",
                  "bg-slate-50/50 text-slate-900 placeholder:text-slate-400",
                  "focus:outline-none focus:ring-2 focus:bg-white",
                  errors.email
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Senha
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isSubmitting}
                className={cn(
                  "w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all",
                  "bg-slate-50/50 text-slate-900 placeholder:text-slate-400",
                  "focus:outline-none focus:ring-2 focus:bg-white",
                  errors.password
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white",
              "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500",
              "shadow-lg shadow-indigo-200 transition-all duration-150",
              "flex items-center justify-center gap-2",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">ou</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-slate-500">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Criar conta grátis →
          </Link>
        </p>
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">🔒 Seguro & Criptografado</span>
        <span className="flex items-center gap-1.5">✈️ 100% Gratuito</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
