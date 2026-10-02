"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  X,
  Upload,
  Loader2,
  ImagePlus,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
} from "lucide-react";
import { cn, CATEGORY_CONFIG, type ItemCategory } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [
  ItemCategory,
  (typeof CATEGORY_CONFIG)[ItemCategory],
][];

interface AddItemFormProps {
  tripId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormState {
  name: string;
  category: ItemCategory;
  amount: string;
  external_url: string;
  description: string;
  item_date: string;
  split_equally: boolean;
  member_count: string;
}

const DEFAULT_STATE: FormState = {
  name: "",
  category: "other",
  amount: "",
  external_url: "",
  description: "",
  item_date: "",
  split_equally: true,
  member_count: "2",
};

export function AddItemForm({
  tripId,
  open,
  onClose,
  onSuccess,
}: AddItemFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setForm(DEFAULT_STATE);
    setImageFile(null);
    setImagePreview(null);
    onClose();
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecione uma imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return null;
    setIsUploading(true);
    try {
      const supabase = createClient();
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const path = `${tripId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("trip-items")
        .upload(path, imageFile, { upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("trip-items")
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Erro ao enviar imagem.");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Informe o nome do item.");
      return;
    }
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }

    startTransition(async () => {
      const image_url = await uploadImage();

      const payload = {
        name: form.name.trim(),
        category: form.category,
        amount,
        image_url,
        external_url: form.external_url.trim() || null,
        description: form.description.trim() || null,
        item_date: form.item_date || null,
        split_equally: form.split_equally,
        quantity: form.split_equally ? parseInt(form.member_count) || 1 : 1,
      };

      const res = await fetch(`/api/trips/${tripId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Erro ao adicionar item.");
        return;
      }

      toast.success(`"${form.name}" adicionado! 🎉`);
      handleClose();
      onSuccess?.();
      router.refresh();
    });
  }

  if (!open) return null;

  const selectedCategory = CATEGORY_CONFIG[form.category];
  const isLoading = isPending || isUploading;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet panel — slides from right on desktop, bottom on mobile */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-item-title"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl",
          "sm:rounded-l-3xl",
          // Mobile: bottom sheet
          "max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:h-[92dvh] max-sm:rounded-t-3xl",
        )}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2
              id="add-item-title"
              className="text-xl font-bold text-gray-900"
            >
              Novo item
            </h2>
            <p className="text-xs text-gray-400">Adicionar despesa à viagem</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form
          id="add-item-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Image upload */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Foto <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            {imagePreview ? (
              <div className="relative h-40 w-full overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-40 w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-500"
              >
                <ImagePlus className="size-6" />
                <span className="text-sm font-medium">Escolher imagem</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="item-name"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Nome <span className="text-rose-500">*</span>
            </label>
            <input
              id="item-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Passagem São Paulo → Lisboa"
              className={cn(
                "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all",
                "focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100",
                "placeholder:text-gray-300",
              )}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="item-category"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Categoria
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">
                {selectedCategory.emoji}
              </span>
              <select
                id="item-category"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as ItemCategory,
                  }))
                }
                className={cn(
                  "w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm font-medium text-gray-800 outline-none transition-all",
                  "focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100",
                )}
              >
                {CATEGORIES.map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.emoji} {cfg.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="item-amount"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Valor <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                R$
              </span>
              <input
                id="item-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="0,00"
                className={cn(
                  "w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-xl font-bold text-gray-900 outline-none transition-all",
                  "focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100",
                  "placeholder:text-gray-300",
                )}
                required
              />
            </div>
          </div>

          {/* Split equally toggle */}
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Dividir igualmente
                </p>
                <p className="text-xs text-gray-400">
                  Divide o valor entre os participantes
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    split_equally: !f.split_equally,
                  }))
                }
                className="text-indigo-500 transition-transform active:scale-95"
              >
                {form.split_equally ? (
                  <ToggleRight className="size-8 fill-indigo-500 text-white" />
                ) : (
                  <ToggleLeft className="size-8 text-gray-300" />
                )}
              </button>
            </div>

            {form.split_equally && (
              <div className="mt-3 border-t border-gray-200 pt-3">
                <label
                  htmlFor="member-count"
                  className="mb-1.5 block text-xs font-medium text-gray-500"
                >
                  Número de pessoas
                </label>
                <input
                  id="member-count"
                  type="number"
                  min="2"
                  max="50"
                  value={form.member_count}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, member_count: e.target.value }))
                  }
                  className={cn(
                    "w-28 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-sm font-bold text-gray-800 outline-none transition-all",
                    "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
                  )}
                />
                {form.amount && parseInt(form.member_count) > 0 && (
                  <p className="mt-1.5 text-xs text-indigo-600">
                    ≈{" "}
                    <span className="font-bold">
                      R${" "}
                      {(
                        parseFloat(form.amount) /
                        parseInt(form.member_count)
                      ).toFixed(2)}
                    </span>{" "}
                    por pessoa
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Link */}
          <div>
            <label
              htmlFor="item-url"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Link{" "}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              id="item-url"
              type="url"
              value={form.external_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, external_url: e.target.value }))
              }
              placeholder="https://..."
              className={cn(
                "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all",
                "focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100",
                "placeholder:text-gray-300",
              )}
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="item-date"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Data <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              id="item-date"
              type="date"
              value={form.item_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, item_date: e.target.value }))
              }
              className={cn(
                "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all",
                "focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100",
              )}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="item-desc"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              Descrição{" "}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              id="item-desc"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Notas sobre este item…"
              className={cn(
                "w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all",
                "focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100",
                "placeholder:text-gray-300",
              )}
            />
          </div>
        </form>

        {/* Sticky footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            type="submit"
            form="add-item-form"
            disabled={isLoading}
            className={cn(
              "flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-sm font-bold text-white shadow-lg transition-all",
              "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-indigo-200",
              "hover:from-indigo-600 hover:to-violet-600 hover:shadow-indigo-300 hover:shadow-xl",
              "active:scale-[0.98]",
              "disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isUploading ? "Enviando imagem…" : "Salvando…"}
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Adicionar item
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
