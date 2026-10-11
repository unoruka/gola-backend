DROP TABLE IF EXISTS entries;
--> statement-breakpoint
CREATE TABLE profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  display_name TEXT NOT NULL,
  handle TEXT NOT NULL,
  bio TEXT,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX profiles_handle_unique ON profiles(handle);
--> statement-breakpoint
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE post_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  blob_key TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT 'Photo shared with this post',
  position INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE likes (
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY(profile_id, post_id)
);
--> statement-breakpoint
CREATE TABLE reposts (
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY(profile_id, post_id)
);