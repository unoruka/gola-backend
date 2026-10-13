-- Add unique slug for shareable post links (e.g. hix-20261013-a7f2).
ALTER TABLE posts ADD COLUMN slug TEXT;
-- Backfill existing posts with a slug based on ID (unique).
UPDATE posts SET slug = 'post-' || id WHERE slug IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
