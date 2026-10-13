-- 0024: Saved collections — named folders for bookmarked posts.
CREATE TABLE `collections` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `profile_id` INTEGER NOT NULL REFERENCES `profiles`(`id`) ON DELETE CASCADE,
  `name` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collection_posts` (
  `collection_id` INTEGER NOT NULL REFERENCES `collections`(`id`) ON DELETE CASCADE,
  `post_id` INTEGER NOT NULL REFERENCES `posts`(`id`) ON DELETE CASCADE,
  `created_at` INTEGER NOT NULL,
  PRIMARY KEY (`collection_id`, `post_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_collections_profile` ON `collections` (`profile_id`);
--> statement-breakpoint
CREATE INDEX `idx_collection_posts_post` ON `collection_posts` (`post_id`);
