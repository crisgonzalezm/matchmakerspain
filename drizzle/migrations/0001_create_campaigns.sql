CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brief jsonb NOT NULL DEFAULT '{}'::jsonb,
  ranking jsonb NOT NULL DEFAULT '[]'::jsonb,
  shortlist uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO anon, authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "public insert" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "public update" ON public.campaigns FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete" ON public.campaigns FOR DELETE USING (true);