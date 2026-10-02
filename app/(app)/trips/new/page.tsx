import { CreateTripForm } from "@/components/trips/CreateTripForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nova Viagem · ViaJuntos",
  description: "Crie uma nova viagem em grupo e comece a juntar dinheiro.",
};

export default function NewTripPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <CreateTripForm />
    </main>
  );
}
