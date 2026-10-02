-- ============================================================
-- ViaJuntos — Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIPS
-- ============================================================
CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  destination text NOT NULL,
  cover_image_url text,
  emoji text DEFAULT '✈️',
  start_date date,
  end_date date,
  total_budget numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  is_public boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'active', 'completed', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Owner full access on trips" ON trips
  FOR ALL USING (auth.uid() = owner_id);

-- Members can view trips they belong to
CREATE POLICY "Members can view their trips" ON trips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trips.id
      AND trip_members.user_id = auth.uid()
    )
  );

-- Public trips are viewable by anyone
CREATE POLICY "Public trips are viewable" ON trips
  FOR SELECT USING (is_public = true);

-- ============================================================
-- TRIP MEMBERS
-- ============================================================
CREATE TABLE trip_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'member')),
  target_amount numeric(12,2),           -- meta individual (NULL = usa divisão automática)
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_id, user_id)
);

ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view trip members" ON trip_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = trip_members.trip_id
      AND tm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM trips t
      WHERE t.id = trip_members.trip_id
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can manage members" ON trip_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_members.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own membership" ON trip_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- TRIP ITEMS (Expense Cards)
-- ============================================================
CREATE TABLE trip_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other'
    CHECK (category IN ('flight', 'hotel', 'transport', 'food', 'activity', 'shopping', 'insurance', 'other')),
  amount numeric(12,2) NOT NULL DEFAULT 0,
  paid_amount numeric(12,2) NOT NULL DEFAULT 0,
  image_url text,
  external_url text,
  description text,
  priority integer NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  split_equally boolean NOT NULL DEFAULT true,
  item_date date,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'partial', 'paid')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trip_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view items" ON trip_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trip_items.trip_id
      AND trip_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_items.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can insert items" ON trip_items
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trip_items.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Creator or owner can update items" ON trip_items
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_items.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Creator or owner can delete items" ON trip_items
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_items.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

-- ============================================================
-- ITEM SPLITS (divisão customizada por pessoa)
-- ============================================================
CREATE TABLE item_splits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES trip_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  UNIQUE (item_id, user_id)
);

ALTER TABLE item_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view item splits" ON item_splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_items ti
      JOIN trip_members tm ON tm.trip_id = ti.trip_id
      WHERE ti.id = item_splits.item_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage splits" ON item_splits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trip_items ti
      JOIN trip_members tm ON tm.trip_id = ti.trip_id
      WHERE ti.id = item_splits.item_id
      AND tm.user_id = auth.uid()
    )
  );

-- ============================================================
-- CONTRIBUTIONS (pagamentos feitos pelos membros)
-- ============================================================
CREATE TABLE contributions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid REFERENCES trip_items(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'approved', 'failed', 'refunded')),
  -- InfinitePay fields
  order_nsu text,
  transaction_nsu text,
  payment_url text,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);

ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contributions" ON contributions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Trip owner can view all contributions" ON contributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = contributions.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Members can view trip contributions" ON contributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = contributions.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own contributions" ON contributions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can update contributions" ON contributions
  FOR UPDATE USING (true); -- webhook usa service role

-- ============================================================
-- PAYMENTS (detalhes InfinitePay)
-- ============================================================
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contribution_id uuid NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  payment_method text,
  status text NOT NULL,
  receipt_url text,
  gateway_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contributions
      WHERE contributions.id = payments.contribution_id
      AND contributions.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert payments" ON payments
  FOR INSERT WITH CHECK (true); -- webhook usa service role

-- ============================================================
-- TRIP INVITES
-- ============================================================
CREATE TABLE trip_invites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  target_amount numeric(12,2),
  accepted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days'
);

ALTER TABLE trip_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip owner can manage invites" ON trip_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_invites.trip_id
      AND trips.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read invite by token" ON trip_invites
  FOR SELECT USING (true); -- filtrado na API pelo token

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  type text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- VIEWS úteis
-- ============================================================

-- Progresso de cada membro em cada viagem
CREATE OR REPLACE VIEW member_progress AS
SELECT
  tm.trip_id,
  tm.user_id,
  p.full_name,
  p.avatar_url,
  tm.target_amount,
  COALESCE(SUM(c.amount) FILTER (WHERE c.status = 'approved'), 0) AS contributed_amount,
  CASE
    WHEN tm.target_amount > 0
    THEN ROUND(COALESCE(SUM(c.amount) FILTER (WHERE c.status = 'approved'), 0) / tm.target_amount * 100, 1)
    ELSE 0
  END AS progress_pct
FROM trip_members tm
JOIN profiles p ON p.id = tm.user_id
LEFT JOIN contributions c ON c.user_id = tm.user_id AND c.trip_id = tm.trip_id
GROUP BY tm.trip_id, tm.user_id, p.full_name, p.avatar_url, tm.target_amount;

-- Resumo financeiro de cada viagem
CREATE OR REPLACE VIEW trip_summary AS
SELECT
  t.id AS trip_id,
  t.name,
  t.destination,
  t.total_budget,
  t.start_date,
  t.end_date,
  t.status,
  t.cover_image_url,
  t.emoji,
  COALESCE(SUM(c.amount) FILTER (WHERE c.status = 'approved'), 0) AS total_contributed,
  CASE
    WHEN t.total_budget > 0
    THEN ROUND(COALESCE(SUM(c.amount) FILTER (WHERE c.status = 'approved'), 0) / t.total_budget * 100, 1)
    ELSE 0
  END AS progress_pct,
  COUNT(DISTINCT tm.user_id) AS member_count
FROM trips t
LEFT JOIN contributions c ON c.trip_id = t.id
LEFT JOIN trip_members tm ON tm.trip_id = t.id
GROUP BY t.id, t.name, t.destination, t.total_budget, t.start_date, t.end_date, t.status, t.cover_image_url, t.emoji;

-- ============================================================
-- REALTIME
-- ============================================================
-- Habilitar realtime nas tabelas críticas
ALTER PUBLICATION supabase_realtime ADD TABLE contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_items;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_members;
