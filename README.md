# ViaJuntos 🌍

**Planeje. Junte. Viaje.**

Planejador colaborativo de viagens com cofrinho coletivo, divisão automática de despesas e pagamentos integrados via InfinitePay.

---

## ✨ Funcionalidades (V1)

- 🔐 **Autenticação** com email + senha (Supabase Auth)
- ✈️ **Criar viagens** com destino, datas, orçamento e emoji
- 👥 **Grupos colaborativos** — convide amigos por link/email
- 💰 **Metas individuais** — cada pessoa com sua meta
- 🃏 **Cards de despesas** — categorias, fotos, links, prioridade
- 📊 **Dashboard de progresso** — "Sua viagem está 72% financiada"
- 💳 **Pagamentos reais** via InfinitePay Checkout
- 🔄 **Webhook InfinitePay** — atualização automática do progresso
- ⚡ **Realtime** — progresso do grupo atualiza ao vivo
- 🧮 **Calculadora** — "Guarde R$ 650/mês para atingir a meta em 8 meses"

---

## 🚀 Setup

### 1. Clone e instale

```bash
git clone https://github.com/seu-usuario/viajuntos
cd viajuntos
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

INFINITEPAY_API_KEY=sua_chave_aqui
INFINITEPAY_WEBHOOK_SECRET=seu_secret_aqui

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o arquivo `supabase/migrations/001_initial_schema.sql`
3. No **Storage**, crie um bucket público chamado `viajuntos`
4. Em **Authentication > URL Configuration**, adicione `http://localhost:3000` como Site URL

### 4. Rode o projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 💳 Integração InfinitePay

Em desenvolvimento (sem `INFINITEPAY_API_KEY`), o app usa uma página mock que simula o checkout e o webhook.

Para produção:
1. Configure `INFINITEPAY_API_KEY` com sua chave da InfinitePay
2. Configure `INFINITEPAY_WEBHOOK_SECRET` 
3. No painel InfinitePay, configure o webhook para `https://seu-dominio.com/api/webhooks/infinitepay`

---

## 🌐 Deploy (Vercel + Supabase)

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure as variáveis de ambiente no painel Vercel
# ou via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add INFINITEPAY_API_KEY
vercel env add INFINITEPAY_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_APP_URL
```

---

## 🏗️ Arquitetura

```
Frontend + API    → Next.js 15 (App Router) no Vercel
Banco de dados    → Supabase (PostgreSQL) 
Autenticação      → Supabase Auth
Imagens           → Supabase Storage
Pagamentos        → InfinitePay Checkout API
Realtime          → Supabase Realtime
```

---

## 📁 Estrutura

```
app/
├── (auth)/          # Login e cadastro
├── (app)/           # App autenticado
│   ├── dashboard/   # Dashboard com todas as viagens
│   ├── trips/       # Viagens: criar, ver, gerenciar
│   └── wallet/      # Histórico de pagamentos
├── api/             # API Routes (Next.js)
│   ├── trips/       # CRUD de viagens e itens
│   ├── webhooks/    # InfinitePay webhook
│   ├── invites/     # Sistema de convites
│   └── wallet/      # Histórico financeiro
├── invite/          # Página de aceite de convite
└── payment/mock/    # Checkout mock (dev only)

lib/
├── supabase/        # Clients server e browser
└── utils.ts         # Utilitários: formatação, cálculos

components/
├── trips/           # TripCard, TripProgress, etc.
├── items/           # ItemCard, AddItemForm
├── payments/        # ContributeModal, PaymentHistory
├── group/           # MemberProgress, GroupSummary
└── layout/          # Sidebar, Navbar

types/
└── database.ts      # Tipos TypeScript do Supabase

supabase/
└── migrations/      # SQL migrations
```

---

## 🗺️ Roadmap

### V1 (atual) — MVP
- ✅ Auth, viagens, itens, grupos, pagamentos InfinitePay

### V2
- 📸 Scanner de comprovante
- 🔔 Notificações por email
- 🏆 Conquistas e gamificação
- 📤 Compartilhar card bonito
- 🎁 "Presenteie minha viagem"

### V3
- 🤖 IA planejadora
- 🗺️ Mapa financeiro
- 📌 Viagens públicas / explorar
- 💍 Modo lua de mel / formatura

---

## 🛠️ Stack

| | Tecnologia |
|---|---|
| Frontend | Next.js 15 + TypeScript |
| Estilo | Tailwind CSS v4 + shadcn/ui |
| Banco | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Pagamentos | InfinitePay Checkout API |
| Deploy | Vercel |
