-- ============================================================
-- HillTop Budz Farm drop — adds the EXCLUSIVE tier and seeds the
-- first jar/review code for each strain.
-- Tiers are now: EXCLUSIVE, EXO, AAA.
-- ============================================================

-- Widen the tier CHECK constraints to include EXCLUSIVE.
ALTER TABLE public.order_tokens DROP CONSTRAINT IF EXISTS order_tokens_tier_check;
ALTER TABLE public.order_tokens
  ADD CONSTRAINT order_tokens_tier_check CHECK (tier IN ('EXCLUSIVE','EXO','AAA'));

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_tier_check;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_tier_check CHECK (tier IN ('EXCLUSIVE','EXO','AAA'));

-- Seed the first jar code per strain for the HillTop Budz Farm drop.
-- Code format: MW-<STRAIN_CODE>-HBF-<NN>. Add more rows (…-02, -03, …) as
-- physical jars are printed — this table is the source of truth for redemption.
INSERT INTO public.order_tokens (token, drop_id, tier, square_index) VALUES
  ('MW-TOG-HBF-01', 'hilltop-budz-farm', 'EXCLUSIVE', NULL), -- Tendernism OG
  ('MW-PLG-HBF-01', 'hilltop-budz-farm', 'EXO', NULL),       -- Platinum Lemon Cherry Gelato
  ('MW-CB-HBF-01',  'hilltop-budz-farm', 'EXO', NULL),       -- Crunch Berriez
  ('MW-SB-HBF-01',  'hilltop-budz-farm', 'EXO', NULL),       -- Superboof
  ('MW-G41-HBF-01', 'hilltop-budz-farm', 'EXO', NULL),       -- Gelato 41
  ('MW-SLP-HBF-01', 'hilltop-budz-farm', 'EXO', NULL),       -- Slapz
  ('MW-HB-HBF-01',  'hilltop-budz-farm', 'AAA', NULL),       -- Honey Banana
  ('MW-LCB-HBF-01', 'hilltop-budz-farm', 'AAA', NULL),       -- Lemon Cherry Gelato BX
  ('MW-LCG-HBF-01', 'hilltop-budz-farm', 'AAA', NULL),       -- Lemon Cherry Gelato
  ('MW-OCK-HBF-01', 'hilltop-budz-farm', 'AAA', NULL),       -- Oreo Cake
  ('MW-WR-HBF-01',  'hilltop-budz-farm', 'AAA', NULL)        -- White Runtz
ON CONFLICT (token) DO NOTHING;
