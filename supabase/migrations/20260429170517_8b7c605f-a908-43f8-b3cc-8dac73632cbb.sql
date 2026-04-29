
CREATE TABLE public.wanted_list_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wanted_list_signups ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public signup)
CREATE POLICY "Anyone can sign the wanted list"
  ON public.wanted_list_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read (so we can show the count)
CREATE POLICY "Anyone can view signups"
  ON public.wanted_list_signups
  FOR SELECT
  TO anon, authenticated
  USING (true);
