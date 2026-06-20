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
-- Code format: MW-HBF-<STRAIN_CODE>-<NN> (grower then strain, matching the
-- physical cards). Add more rows (…-02, -03, …) as physical jars are printed —
-- this table is the source of truth for redemption.
INSERT INTO public.order_tokens (token, drop_id, tier, square_index) VALUES
  ('MW-HBF-TOG-01',  'hilltop-budz-farm', 'EXCLUSIVE', NULL), -- Tenderism OG (F&F)
  ('MW-HBF-PLCG-01', 'hilltop-budz-farm', 'EXO', NULL),       -- Platinum Lemon Cherry Gelato
  ('MW-HBF-CB-01',   'hilltop-budz-farm', 'EXO', NULL),       -- Crunch Berriez
  ('MW-HBF-SB-01',   'hilltop-budz-farm', 'EXO', NULL),       -- Super Boof
  ('MW-HBF-G41-01',  'hilltop-budz-farm', 'EXO', NULL),       -- Gelato 41
  ('MW-HBF-SLP-01',  'hilltop-budz-farm', 'EXO', NULL),       -- Slapz
  ('MW-HBF-HB-01',   'hilltop-budz-farm', 'AAA', NULL),       -- Honey Banana
  ('MW-HBF-LCG-01',  'hilltop-budz-farm', 'AAA', NULL),       -- Lemon Cherry Gelato
  ('MW-HBF-OC-01',   'hilltop-budz-farm', 'AAA', NULL),       -- Oreo Cake
  ('MW-HBF-WR-01',   'hilltop-budz-farm', 'AAA', NULL)        -- White Runtz
ON CONFLICT (token) DO NOTHING;
