import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

// GET /invite/[token] — aceitar convite via link
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirecionar para login com redirect de volta ao convite
    redirect(`/login?redirect=/invite/${token}`);
  }

  // Aceitar o convite automaticamente
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/invites/${token}`,
    {
      method: "POST",
      headers: { Cookie: "" }, // será passado pelo middleware
    }
  );

  if (res.ok) {
    const data = await res.json();
    redirect(`/trips/${data.trip_id}`);
  }

  // Buscar dados do convite para mostrar erro
  const inviteRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/invites/${token}`
  );
  const invite = await inviteRes.json();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
        <div className="text-4xl">❌</div>
        <h1 className="text-xl font-bold text-gray-900">Convite inválido</h1>
        <p className="text-gray-500">{invite?.error ?? "Este convite não é mais válido."}</p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
        >
          Ir para o dashboard
        </a>
      </div>
    </div>
  );
}
