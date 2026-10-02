"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import {
  formatCurrency,
  calcProgress,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Globe,
  Lock,
  ChevronLeft,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Smile,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  "✈️", "🏖️", "🏔️", "🌴", "🗺️", "🧳", "🚀", "🌍", "🏝️", "🎒",
  "🚢", "🏕️", "🌅", "🗼", "🎡", "🍷", "🎭", "🤿", "🛵", "🚂",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberField {
  email: string;
  target_amount: string;
}

interface FormValues {
  name: string;
  destination: string;
  emoji: string;
  start_date: string;
  end_date: string;
  total_budget: string;
  is_public: boolean;
  members: MemberField[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateTripForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      destination: "",
      emoji: "✈️",
      start_date: "",
      end_date: "",
      total_budget: "",
      is_public: false,
      members: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  const watchedEmoji = watch("emoji");
  const watchedBudget = watch("total_budget");
  const watchedMembers = watch("members");
  const watchedPublic = watch("is_public");

  // Computed: per-person split
  const totalPeople = 1 + fields.length; // +1 for self
  const budget = parseFloat(watchedBudget) || 0;
  const perPerson = totalPeople > 0 ? budget / totalPeople : 0;

  // Progress preview (sum of target amounts vs budget)
  const totalTargeted = watchedMembers.reduce(
    (s, m) => s + (parseFloat(m.target_amount) || 0),
    0
  );
  const previewPct = calcProgress(totalTargeted, budget);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        destination: data.destination,
        emoji: data.emoji,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        total_budget: parseFloat(data.total_budget) || 0,
        is_public: data.is_public,
        members: data.members.map((m) => ({
          email: m.email,
          target_amount: parseFloat(m.target_amount) || null,
        })),
      };

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Erro ao criar viagem");
      }

      const trip = await res.json();
      toast.success("Viagem criada! 🎉");
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">{watchedEmoji}</span>
            <h1 className="text-lg font-bold text-zinc-900">Nova viagem</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        {/* ── Basic Info Card ─────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Informações básicas
          </h2>

          {/* Emoji picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5" /> Emoji
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 hover:border-indigo-300 transition-colors bg-zinc-50"
              >
                <span className="text-2xl">{watchedEmoji}</span>
                <span className="text-xs text-zinc-500">Alterar</span>
              </button>

              {showEmojiPicker && (
                <div className="absolute top-12 left-0 z-20 bg-white rounded-2xl shadow-xl border border-zinc-100 p-3 grid grid-cols-10 gap-1">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setValue("emoji", em);
                        setShowEmojiPicker(false);
                      }}
                      className={cn(
                        "text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 transition-colors",
                        watchedEmoji === em && "bg-indigo-100 ring-2 ring-indigo-400"
                      )}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">
              Nome da viagem <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("name", { required: "Nome obrigatório" })}
              placeholder="Ex: Férias em Florianópolis"
              className={cn(
                "w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white outline-none transition-colors",
                "placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                errors.name ? "border-rose-400" : "border-zinc-200"
              )}
            />
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Destino{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("destination", { required: "Destino obrigatório" })}
              placeholder="Ex: Florianópolis, SC"
              className={cn(
                "w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white outline-none transition-colors",
                "placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                errors.destination ? "border-rose-400" : "border-zinc-200"
              )}
            />
            {errors.destination && (
              <p className="text-xs text-rose-500">{errors.destination.message}</p>
            )}
          </div>

          {/* Privacy toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              {watchedPublic ? (
                <Globe className="w-4 h-4 text-indigo-600" />
              ) : (
                <Lock className="w-4 h-4 text-zinc-500" />
              )}
              <div>
                <p className="text-sm font-medium text-zinc-700">
                  {watchedPublic ? "Viagem pública" : "Viagem privada"}
                </p>
                <p className="text-xs text-zinc-500">
                  {watchedPublic
                    ? "Qualquer pessoa pode ver"
                    : "Somente membros convidados"}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={watchedPublic}
              onClick={() => setValue("is_public", !watchedPublic)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none",
                watchedPublic ? "bg-indigo-600" : "bg-zinc-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                  watchedPublic ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* ── Dates & Budget Card ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Datas e orçamento
          </h2>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Início
              </label>
              <input
                type="date"
                {...register("start_date")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Fim
              </label>
              <input
                type="date"
                {...register("end_date")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Orçamento total (R$){" "}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium select-none">
                R$
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("total_budget", {
                  required: "Orçamento obrigatório",
                  min: { value: 0.01, message: "Informe um valor maior que 0" },
                })}
                placeholder="0,00"
                className={cn(
                  "w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm bg-white outline-none transition-colors",
                  "placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                  errors.total_budget ? "border-rose-400" : "border-zinc-200"
                )}
              />
            </div>
            {errors.total_budget && (
              <p className="text-xs text-rose-500">{errors.total_budget.message}</p>
            )}
          </div>

          {/* Per-person preview */}
          {budget > 0 && totalPeople > 1 && (
            <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl">🧮</span>
              <div>
                <p className="text-xs text-indigo-600 font-medium">
                  Divisão igualitária entre {totalPeople} pessoas:
                </p>
                <p className="text-base font-extrabold text-indigo-900">
                  {formatCurrency(perPerson)}{" "}
                  <span className="text-xs font-normal text-indigo-500">por pessoa</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Members Card ────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Convidar membros
              </h2>
            </div>
            <button
              type="button"
              onClick={() => append({ email: "", target_amount: "" })}
              className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-zinc-500">Nenhum membro adicionado ainda.</p>
              <p className="text-xs text-zinc-400 mt-1">
                Você pode convidar pessoas pelo e-mail.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {fields.map((field, idx) => (
                <li key={field.id} className="flex items-start gap-2">
                  <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      {...register(`members.${idx}.email`, {
                        required: "E-mail obrigatório",
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: "E-mail inválido",
                        },
                      })}
                      type="email"
                      placeholder="email@exemplo.com"
                      className={cn(
                        "w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white outline-none transition-colors",
                        "placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                        errors.members?.[idx]?.email
                          ? "border-rose-400"
                          : "border-zinc-200"
                      )}
                    />
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 select-none">
                        R$
                      </span>
                      <input
                        {...register(`members.${idx}.target_amount`)}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Meta (opcional)"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors placeholder:text-zinc-400"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="mt-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Progress preview if targets are set */}
          {budget > 0 && totalTargeted > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-zinc-100">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Metas definidas</span>
                <span>{previewPct}% do orçamento</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${previewPct}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400">
                {formatCurrency(totalTargeted)} definidos de{" "}
                {formatCurrency(budget)}
              </p>
            </div>
          )}
        </div>

        {/* ── Submit ──────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full py-4 rounded-2xl text-white text-sm font-bold shadow-lg transition-all duration-200",
            "bg-gradient-to-r from-indigo-600 to-violet-600",
            "hover:shadow-indigo-500/40 hover:scale-[1.01]",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          )}
        >
          {loading ? "Criando viagem..." : `Criar viagem ${watchedEmoji}`}
        </button>
      </form>
    </div>
  );
}
