CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  season TEXT CHECK (season IN (
    'summer','christmas','easter','harvest','valentines','mothers_day',
    'fathers_day','back_to_school','custom'
  )),
  theme_colour TEXT DEFAULT '#C9A84C',
  theme_colour_lt TEXT DEFAULT '#E8C97A',
  bg_colour TEXT DEFAULT '#1A1000',
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  original_price NUMERIC(10,2),
  promo_price NUMERIC(10,2),
  saving_pct INTEGER,
  currency TEXT DEFAULT 'GBP',
  total_stock INTEGER DEFAULT 100,
  remaining_stock INTEGER DEFAULT 100,
  is_limited BOOLEAN DEFAULT TRUE,
  low_stock_threshold INTEGER DEFAULT 20,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  banner_image_url TEXT,
  card_image_url TEXT,
  badge_text TEXT DEFAULT 'Limited Edition',
  is_featured BOOLEAN DEFAULT FALSE,
  show_countdown BOOLEAN DEFAULT TRUE,
  show_stock_count BOOLEAN DEFAULT TRUE,
  promo_code TEXT,
  promo_code_discount_pct INTEGER,
  meta_title TEXT,
  meta_desc TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotion_signature_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  short_desc TEXT,
  story TEXT,
  scripture TEXT,
  scripture_quote TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  is_included BOOLEAN DEFAULT FALSE,
  is_addon BOOLEAN DEFAULT TRUE,
  scene_position TEXT CHECK (scene_position IN (
    'left','right','top-left','top-right','top-centre',
    'bottom-left','bottom-right','bottom-centre','centre','figure'
  )),
  material TEXT,
  dimensions TEXT,
  is_wearable BOOLEAN DEFAULT FALSE,
  glow_in_dark BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  stock_qty INTEGER DEFAULT 50,
  sort_order INTEGER DEFAULT 0,
  badge_text TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS promo_sig_slug_idx
  ON promotion_signature_items(promotion_id, slug);

CREATE INDEX IF NOT EXISTS idx_promotions_active_dates
  ON promotions(is_active, starts_at, ends_at, sort_order);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS promo_code_used TEXT,
  ADD COLUMN IF NOT EXISTS promo_discount_amount NUMERIC(10,2);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_signature_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promotions' AND policyname = 'Anyone can view active promotions') THEN
    CREATE POLICY "Anyone can view active promotions"
      ON promotions FOR SELECT
      USING (is_active = TRUE AND NOW() BETWEEN starts_at AND ends_at);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promotions' AND policyname = 'Admins full access promotions') THEN
    CREATE POLICY "Admins full access promotions"
      ON promotions FOR ALL
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promotion_signature_items' AND policyname = 'Anyone can view active promo items') THEN
    CREATE POLICY "Anyone can view active promo items"
      ON promotion_signature_items FOR SELECT
      USING (is_active = TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promotion_signature_items' AND policyname = 'Admins full access promo items') THEN
    CREATE POLICY "Admins full access promo items"
      ON promotion_signature_items FOR ALL
      USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      ));
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION decrement_promo_stock(
  promo_id UUID,
  qty INTEGER
)
RETURNS void AS $$
  UPDATE promotions
  SET remaining_stock = GREATEST(0, remaining_stock - qty)
  WHERE id = promo_id;
$$ LANGUAGE SQL SECURITY DEFINER;

WITH david AS (
  SELECT id FROM characters WHERE name = 'David' LIMIT 1
)
INSERT INTO promotions (
  name, slug, tagline, description, season, theme_colour, theme_colour_lt,
  bg_colour, character_id, original_price, promo_price, saving_pct,
  total_stock, remaining_stock, is_limited, low_stock_threshold,
  starts_at, ends_at, badge_text, is_featured, show_countdown,
  show_stock_count, promo_code, promo_code_discount_pct, sort_order
)
SELECT
  'David Summer Edition',
  'david-summer-2025',
  'The Shepherd Boy Who Sang to God',
  'Before David faced Goliath, before he wore the crown, before he ruled Israel, he was a boy alone in the fields with his sheep, his sling, and his God.',
  'summer', '#E8A830', '#F5C842', '#1A0D00',
  david.id,
  34.99, 27.99, 20,
  200, 200, TRUE, 20,
  '2025-06-01 00:00:00+00',
  '2026-08-31 23:59:59+00',
  'Summer Limited Edition', TRUE, TRUE,
  TRUE, 'SHEPHERD10', 10, 1
FROM david
ON CONFLICT (slug) DO NOTHING;

WITH promo AS (
  SELECT id FROM promotions WHERE slug = 'david-summer-2025' LIMIT 1
)
INSERT INTO promotion_signature_items (
  promotion_id, name, slug, short_desc, story, scripture, scripture_quote,
  price, is_included, is_addon, scene_position, material, dimensions,
  is_wearable, glow_in_dark, stock_qty, sort_order, badge_text
)
SELECT promo.id, v.* FROM promo, (VALUES
  ('The Kinnor', 'kinnor-lyre', 'Miniature hand-carved wooden lyre, David''s instrument of worship', 'Before David was a warrior or a king, he was a worshipper.', '1 Samuel 16:23', 'David would take up his lyre and play.', 0.00, TRUE, FALSE, 'figure', 'wood + gold wire', '5cm x 4cm x 1.5cm', TRUE, FALSE, 200, 1, 'Included - Summer Exclusive'),
  ('Woolly Sheep', 'woolly-sheep', 'Chibi white resin sheep with fluffy texture, David''s flock', 'David was a shepherd before he was anything else.', 'Psalm 23:1', 'The Lord is my shepherd, I lack nothing.', 3.99, FALSE, TRUE, 'left', 'textured resin', '4cm x 3cm x 3cm', FALSE, FALSE, 100, 2, 'Most Popular'),
  ('Hillside Stage Base', 'hillside-base', 'Wide oval green hillside base with wildflowers', 'The fields of Bethlehem were the training ground for David''s worship.', 'Psalm 23:2', 'He makes me lie down in green pastures.', 5.99, FALSE, TRUE, 'bottom-centre', 'resin + paint', '13cm x 10cm x 3cm', FALSE, FALSE, 100, 3, 'Scene Builder'),
  ('Shepherd''s Staff', 'shepherds-staff', 'Miniature carved wooden staff with crook top', 'The staff was used to guide sheep, lift them, and hold them close.', 'Psalm 23:4', 'Your rod and your staff, they comfort me.', 2.99, FALSE, TRUE, 'right', 'real wood', '10cm length', FALSE, FALSE, 100, 4, 'Essential'),
  ('Starlit Sky Backdrop', 'starlit-backdrop', 'Curved resin backdrop with painted night sky and gold stars', 'David looked up at the night sky and sang of the God who made it.', 'Psalm 19:1', 'The heavens declare the glory of God.', 4.99, FALSE, TRUE, 'top-centre', 'resin + paint', '15cm wide x 10cm tall curved', FALSE, FALSE, 80, 5, 'Scene Centrepiece')
) AS v(
  name, slug, short_desc, story, scripture, scripture_quote, price,
  is_included, is_addon, scene_position, material, dimensions,
  is_wearable, glow_in_dark, stock_qty, sort_order, badge_text
)
ON CONFLICT (promotion_id, slug) DO NOTHING;
