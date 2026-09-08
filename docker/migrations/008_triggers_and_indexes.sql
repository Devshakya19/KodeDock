-- =============================================================================
-- KODEDOCK MIGRATION 008: TRIGGERS & HIGH-THROUGHPUT INDEXES
-- =============================================================================

-- 1. Auto-create Profile and Wallet upon new User creation
CREATE OR REPLACE FUNCTION on_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.full_name, NEW.role)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO wallets (user_id, balance_paise)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_created ON users;
CREATE TRIGGER trigger_user_created
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION on_user_created();

-- 2. Updated At Auto-Refresh Triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
          AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_trg ON %I;', t);
        EXECUTE format('CREATE TRIGGER set_updated_at_trg BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t);
    END LOOP;
END;
$$;

-- 3. Product Rating & Review Count Auto-Recalculation Trigger
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE product_id = NEW.product_id), 0.00),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_review_product_rating ON reviews;
CREATE TRIGGER trigger_review_product_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();
