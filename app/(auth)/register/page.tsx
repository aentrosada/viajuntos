"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Schema ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(80, "Nome muito longo"),
  email: z
    .string()
    .min(1, "E-mail obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Inclua ao menos um número"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Password strength helper ─────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Fraca", color: "bg-rose-500" };
  if (score <= 2) return { score, label: "Média", color: "bg-amber-500" };
  if (score <= 3) return { score, label: "Boa", color: "bg-yellow-400" };
  return { score, label: "Forte", color: "bg-emerald-500" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const strength = getPasswordStrength(passwordValue);

  async function onSubmit(data: RegisterFormData) {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        toast.error("E-mail já cadastrado", {
          description: "Tente entrar ou recupere sua senha.",
        });
      } else {
        toast.error("Falha ao criar conta", { description: error.message });
      }
      return;
    }

    setDone(true);
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-100/60 border border-white/60 p-10">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Conta criada! 🎉
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Enviamos um e-mail de confirmação. Verifique sua caixa de entrada e
            clique no link para ativar sua conta.
          </p>
          <Link
            href="/login"
            className={cn(
              "inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white",
              "bg-gradient-to-r from-indigo-600 to-blue-500",
              "hover:from-indigo-700 hover:to-blue-600",
              "shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300",
              "transition-all duration-200"
            )}
          >
            Ir para o login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-indigo-100/60 border border-white/60 p-8 sm:p-10">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-1.5">
            Crie sua conta ✈️
          </h1>
          <p className="text-sm text-slate-500">
            Comece a planejar suas viagens em grupo gratuitamente
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Full name */}
          <div className="space-y-1.5">
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-slate-700"
            >
              Nome completo
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Maria Silva"
                {...register("fullName")}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400",
                  "transition-colors duration-150",
                  errors.fullName
                    ? "border-rose-400 focus:ring-rose-400/30 focus:border-rose-400"
                    : "border-slate-200"
                )}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                {...register("email")}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400",
                  "transition-colors duration-150",
                  errors.email
                    ? "border-rose-400 focus:ring-rose-400/30 focus:border-rose-400"
                    : "border-slate-200"
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                {...register("password", {
                  onChange: (e) => setPasswordValue(e.target.value),
                })}
                className={cn(
                  "w-full pl-10 pr-12 py-3 rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400",
                  "transition-colors duration-150",
                  errors.password
                    ? "border-rose-400 focus:ring-rose-400/30 focus:border-rose-400"
                    : "border-slate-200"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Password strength bar */}
            {passwordValue.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        i <= strength.score ? strength.color : "bg-slate-100"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Força da senha:{" "}
                  <span
                    className={cn(
                      "font-medium",
                      strength.score <= 1 && "text-rose-500",
                      strength.score === 2 && "text-amber-500",
                      strength.score === 3 && "text-yellow-600",
                      strength.score >= 4 && "text-emerald-600"
                    )}
                  >
                    {strength.label}
                  </span>
                </p>
              </div>
            )}

            {errors.password && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white",
              "bg-gradient-to-r from-indigo-600 to-blue-500",
              "hover:from-indigo-700 hover:to-blue-600",
              "shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300",
              "transition-all duration-200 mt-1",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando conta…
              </>
            ) : (
              <>
                Criar conta grátis
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            Ao criar uma conta você concorda com nossos{" "}
            <Link href="/termos" className="underline hover:text-slate-600 transition-colors">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="/privacidade" className="underline hover:text-slate-600 transition-colors">
              Política de Privacidade
            </Link>
            .
          </p>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">ou</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-slate-500">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Entrar →
          </Link>
        </p>
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
        <span>🔒 Seguro & Criptografado</span>
        <span>✈️ 100% Gratuito</span>
        <span>🌍 pt-BR</span>
      </div>
    </div>
  );
}
