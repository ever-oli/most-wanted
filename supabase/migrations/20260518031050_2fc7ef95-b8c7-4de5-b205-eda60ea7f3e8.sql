-- Fix rating constraints to allow 1-10 (UI and edge function use 1-10)
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_nose_check;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_structure_check;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_cure_check;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_burn_check;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_experience_check;

ALTER TABLE public.reviews ADD CONSTRAINT reviews_nose_check CHECK (nose BETWEEN 1 AND 10);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_structure_check CHECK (structure BETWEEN 1 AND 10);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_cure_check CHECK (cure BETWEEN 1 AND 10);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_burn_check CHECK (burn BETWEEN 1 AND 10);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_experience_check CHECK (experience BETWEEN 1 AND 10);

-- One review per order_token
CREATE UNIQUE INDEX IF NOT EXISTS reviews_order_token_unique ON public.reviews (order_token);

-- Seed the Belgium drop's first code
INSERT INTO public.order_tokens (token, drop_id, tier, square_index)
VALUES ('MW-OC-BEL-01', 'belgium', 'EXO', NULL)
ON CONFLICT (token) DO NOTHING;