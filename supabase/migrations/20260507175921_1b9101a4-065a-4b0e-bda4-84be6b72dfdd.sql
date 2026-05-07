-- ============ order_tokens ============
CREATE TABLE public.order_tokens (
  token TEXT PRIMARY KEY,
  drop_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('EXO','AAA')),
  square_index INT,
  email TEXT,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_tokens ENABLE ROW LEVEL SECURITY;
-- No public policies — service role only via edge functions.

-- ============ reviews ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_token TEXT NOT NULL,
  drop_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('EXO','AAA')),
  square_index INT,
  nose SMALLINT NOT NULL CHECK (nose BETWEEN 1 AND 5),
  structure SMALLINT NOT NULL CHECK (structure BETWEEN 1 AND 5),
  cure SMALLINT NOT NULL CHECK (cure BETWEEN 1 AND 5),
  burn SMALLINT NOT NULL CHECK (burn BETWEEN 1 AND 5),
  experience SMALLINT NOT NULL CHECK (experience BETWEEN 1 AND 5),
  average NUMERIC(3,2) NOT NULL,
  notes TEXT,
  display_name TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  early_access_optin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reviews are readable by anyone"
  ON public.reviews
  FOR SELECT
  USING (is_public = true);

-- No INSERT/UPDATE/DELETE policies — writes go through the edge function with service role.

CREATE INDEX idx_reviews_drop_id ON public.reviews (drop_id);
CREATE INDEX idx_reviews_created_at ON public.reviews (created_at DESC);
CREATE INDEX idx_order_tokens_drop_id ON public.order_tokens (drop_id);
