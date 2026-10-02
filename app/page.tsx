import Link from "next/link";
import {
  Plane,
  Users,
  TrendingUp,
  Wallet,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

// ─── Mini progress bar ─────────────────────────────────────────────────────────
function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/20">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Mock trip card ────────────────────────────────────────────────────────────
function MockTripCard({
  emoji,
  name,
  destination,
  pct,
  color,
  days,
}: {
  emoji: string;
  name: string;
  destination: string;
  pct: number;
  color: string;
  days: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">{name}</p>
            <p className="text-xs text-gray-500">{destination}</p>
          </div>
        </div>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
          {days} dias
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Progresso</span>
          <span className={`font-bold ${color.replace("bg-", "text-")}`}>{pct}%</span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
        <Icon className="h-6 w-6 text-indigo-600" />
      </div>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✈️</span>
          <span className="text-xl font-bold text-gray-900">ViaJuntos</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Começar grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 px-6">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-violet-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
            <Star className="h-4 w-4" />
            Planejador colaborativo de viagens
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Planeje.{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Junte.
            </span>{" "}
            Viaje.
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Crie sua viagem, convide o grupo, defina metas e acompanhe o progresso do cofrinho coletivo. 
            A viagem começa antes do aeroporto — começa quando o grupo cria a meta.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all"
            >
              Começar gratuitamente
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm ring-1 ring-black/5 hover:bg-gray-50 transition-colors"
            >
              Já tenho uma conta
            </Link>
          </div>

          {/* Mock viagem progress */}
          <div className="max-w-sm mx-auto mt-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-2xl shadow-indigo-300">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🇨🇱</span>
              <div>
                <p className="font-bold text-lg">Chile 2027</p>
                <p className="text-indigo-200 text-sm">10–17 jul 2027 • 4 pessoas</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-200">R$ 8.640 / R$ 12.000</span>
                <span className="font-bold">72%</span>
              </div>
              <ProgressBar pct={72} color="bg-white" />
              <p className="text-indigo-200 text-xs">
                🎉 Faltam R$ 3.360 — guarde R$ 560/mês
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trip cards mockup ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Todas as suas viagens em um lugar
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Acompanhe o progresso de cada viagem com barras de progresso coloridas e dados financeiros em tempo real.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <MockTripCard
              emoji="🇦🇷"
              name="Buenos Aires"
              destination="Amigos • 4 pessoas"
              pct={72}
              color="bg-emerald-500"
              days={142}
            />
            <MockTripCard
              emoji="🇮🇹"
              name="Roma & Florença"
              destination="A dois • 2 pessoas"
              pct={43}
              color="bg-amber-500"
              days={280}
            />
            <MockTripCard
              emoji="🇺🇸"
              name="Orlando"
              destination="Família • 5 pessoas"
              pct={18}
              color="bg-rose-500"
              days={365}
            />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Tudo que você precisa para planejar
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Plane}
              title="Cards de despesa"
              description="Adicione passagem, hotel, passeios com foto, link e valor. Visualize o progresso de cada item."
            />
            <FeatureCard
              icon={Users}
              title="Cofrinho coletivo"
              description="Cada pessoa acompanha sua meta individual e o progresso do grupo em tempo real."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Calculadora financeira"
              description="'Se guardar R$ 650/mês, você atinge a meta em 8 meses.' Transforme sonho em plano concreto."
            />
            <FeatureCard
              icon={Wallet}
              title="Pagamentos reais"
              description="Contribua diretamente pela plataforma via Pix ou cartão. O progresso atualiza automaticamente."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Como funciona
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Crie a viagem",
                description: "Defina destino, datas, orçamento e convide os amigos com um link.",
              },
              {
                step: "02",
                title: "Monte o orçamento",
                description: "Adicione passagem, hotel e passeios como cards visuais com fotos e links.",
              },
              {
                step: "03",
                title: "Junte e viaje",
                description: "Cada pessoa contribui no seu ritmo. Progresso atualiza em tempo real para o grupo.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-xl font-black shadow-lg shadow-indigo-200">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-extrabold text-white">
            Pronto para planejar sua próxima aventura?
          </h2>
          <p className="text-indigo-200 text-lg">
            Gratuito para começar. Sem cartão de crédito.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-indigo-700 shadow-lg hover:bg-indigo-50 transition-colors"
            >
              Criar minha primeira viagem
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 pt-4">
            {["100% gratuito", "Sem cartão", "Grupos ilimitados"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-indigo-200 text-sm">
                <CheckCircle className="h-4 w-4" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 bg-gray-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">✈️</span>
          <span className="text-white font-bold">ViaJuntos</span>
        </div>
        <p className="text-gray-500 text-sm">
          Planeje. Junte. Viaje.
        </p>
      </footer>
    </div>
  );
}
