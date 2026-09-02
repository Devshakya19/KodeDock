-- =============================================================================
-- DEFAULT CATALOG CATEGORIES SEED DATA
-- =============================================================================

INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Web Templates', 'web-templates', 'layout', 1),
  ('Mobile Apps', 'mobile-apps', 'smartphone', 2),
  ('UI Kits', 'ui-kits', 'palette', 3),
  ('B.Tech Projects', 'btech-projects', 'graduation-cap', 4),
  ('Boilerplates', 'boilerplates', 'terminal', 5),
  ('API Templates', 'api-templates', 'code', 6)
ON CONFLICT (name) DO NOTHING;
