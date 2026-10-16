-- F-11: persistent fixed-window rate limits.
-- One row per active key; rows self-expire (window_start + window <= now)
-- and are deleted opportunistically by the limiter. IF NOT EXISTS makes
-- half-applied retries safe (the runner has no transaction wrapper).
CREATE TABLE IF NOT EXISTS `rate_limits` (`key` text PRIMARY KEY, `window_start` integer NOT NULL, `count` integer NOT NULL);
