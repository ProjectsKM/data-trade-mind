
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Trades table
CREATE TABLE public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ativo TEXT NOT NULL,
  data TIMESTAMPTZ NOT NULL DEFAULT now(),
  dir TEXT NOT NULL CHECK (dir IN ('COMPRA','VENDA')),
  valor NUMERIC NOT NULL,
  payout NUMERIC NOT NULL,
  res TEXT NOT NULL DEFAULT 'OPEN' CHECK (res IN ('WIN','LOSS','OPEN')),
  lucro NUMERIC NOT NULL DEFAULT 0,
  obs TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own trades" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own trades" ON public.trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own trades" ON public.trades FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_trades_user_data ON public.trades(user_id, data DESC);

-- Scan history table
CREATE TABLE public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ativo TEXT,
  timeframe TEXT,
  direcao TEXT,
  confianca INTEGER,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own scans" ON public.scan_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scans" ON public.scan_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own scans" ON public.scan_history FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_scan_history_user_created ON public.scan_history(user_id, created_at DESC);

-- Mind messages (chat history)
CREATE TABLE public.mind_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mind_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own messages" ON public.mind_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own messages" ON public.mind_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages" ON public.mind_messages FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_mind_messages_user_created ON public.mind_messages(user_id, created_at);

-- User plans (subscription / trial state)
CREATE TABLE public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_pro BOOLEAN NOT NULL DEFAULT false,
  analyses_left INTEGER NOT NULL DEFAULT 5,
  trial_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_days_left INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own plan" ON public.user_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own plan" ON public.user_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own plan" ON public.user_plans FOR UPDATE USING (auth.uid() = user_id);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_trades_updated BEFORE UPDATE ON public.trades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_user_plans_updated BEFORE UPDATE ON public.user_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + plan on new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'country'
  );
  INSERT INTO public.user_plans (user_id) VALUES (NEW.id);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
