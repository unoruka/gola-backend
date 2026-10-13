-- 0021: close the 30-day Gola-color cooldown hole for pre-existing accounts.
--
-- theme_changed_at was added NULLABLE by 0009 with no backfill, and
-- setColorTheme skips the 30-day check when it is NULL. Any account whose
-- color was set before the column existed (or via any path that did not
-- stamp it) can therefore change colors without limit.
--
-- Policy: accounts holding a NON-default color with NULL theme_changed_at
-- evidently picked a color before the rule existed, so their 30-day clock
-- starts at deploy time. Accounts still on the default 'teal' with NULL keep
-- the "first change is free, the clock starts at lock-in" behavior.
UPDATE `profiles`
SET `theme_changed_at` = CAST(strftime('%s', 'now') AS INTEGER) * 1000
WHERE `theme_changed_at` IS NULL AND `theme_color` != 'teal';
