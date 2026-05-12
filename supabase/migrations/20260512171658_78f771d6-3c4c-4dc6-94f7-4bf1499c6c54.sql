
CREATE TABLE public.mind_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nova conversa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mind_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own threads" ON public.mind_threads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own threads" ON public.mind_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own threads" ON public.mind_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own threads" ON public.mind_threads FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER mind_threads_updated_at BEFORE UPDATE ON public.mind_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.mind_messages ADD COLUMN thread_id UUID REFERENCES public.mind_threads(id) ON DELETE CASCADE;
CREATE INDEX mind_messages_thread_id_idx ON public.mind_messages(thread_id);
CREATE INDEX mind_threads_user_updated_idx ON public.mind_threads(user_id, updated_at DESC);
