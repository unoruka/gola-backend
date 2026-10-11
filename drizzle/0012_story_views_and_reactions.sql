DELETE FROM `notifications`
WHERE `recipient_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka')
   OR `actor_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka')
   OR `post_id` IN (SELECT `id` FROM `posts` WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka'));
--> statement-breakpoint
DELETE FROM `follows`
WHERE `follower_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka')
   OR `following_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka');
--> statement-breakpoint
DELETE FROM `likes`
WHERE `profile_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka')
   OR `post_id` IN (SELECT `id` FROM `posts` WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka'));
--> statement-breakpoint
DELETE FROM `reposts`
WHERE `profile_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka')
   OR `post_id` IN (SELECT `id` FROM `posts` WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka'));
--> statement-breakpoint
DELETE FROM `bookmarks`
WHERE `profile_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka')
   OR `post_id` IN (SELECT `id` FROM `posts` WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka'));
--> statement-breakpoint
DELETE FROM `reports`
WHERE `reporter_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka')
   OR (`target_type` = 'post' AND `target_id` IN (SELECT `id` FROM `posts` WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka')))
   OR (`target_type` = 'comment' AND `target_id` IN (SELECT `id` FROM `comments` WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka')));
--> statement-breakpoint
DELETE FROM `comments`
WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka')
   OR `post_id` IN (SELECT `id` FROM `posts` WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka'));
--> statement-breakpoint
DELETE FROM `stories`
WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka');
--> statement-breakpoint
DELETE FROM `sessions`
WHERE `profile_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka');
--> statement-breakpoint
DELETE FROM `post_images`
WHERE `post_id` IN (SELECT `id` FROM `posts` WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka'));
--> statement-breakpoint
DELETE FROM `posts`
WHERE `author_id` IN (SELECT `id` FROM `profiles` WHERE `handle` <> 'unoruka');
--> statement-breakpoint
DELETE FROM `profiles`
WHERE `handle` <> 'unoruka'
  AND EXISTS (SELECT 1 FROM `profiles` WHERE `handle` = 'unoruka');
--> statement-breakpoint
DELETE FROM `likes`
WHERE `profile_id` NOT IN (SELECT `id` FROM `profiles`)
   OR `post_id` NOT IN (SELECT `id` FROM `posts`);
--> statement-breakpoint
DELETE FROM `reposts`
WHERE `profile_id` NOT IN (SELECT `id` FROM `profiles`)
   OR `post_id` NOT IN (SELECT `id` FROM `posts`);
--> statement-breakpoint
DELETE FROM `bookmarks`
WHERE `profile_id` NOT IN (SELECT `id` FROM `profiles`)
   OR `post_id` NOT IN (SELECT `id` FROM `posts`);
--> statement-breakpoint
DELETE FROM `comments`
WHERE `author_id` NOT IN (SELECT `id` FROM `profiles`)
   OR `post_id` NOT IN (SELECT `id` FROM `posts`)
   OR `post_id` IN (SELECT `id` FROM `posts` WHERE `author_id` NOT IN (SELECT `id` FROM `profiles`));
--> statement-breakpoint
DELETE FROM `stories`
WHERE `author_id` NOT IN (SELECT `id` FROM `profiles`);
--> statement-breakpoint
DELETE FROM `sessions`
WHERE `profile_id` NOT IN (SELECT `id` FROM `profiles`);
--> statement-breakpoint
DELETE FROM `post_images`
WHERE `post_id` NOT IN (SELECT `id` FROM `posts`)
   OR `post_id` IN (SELECT `id` FROM `posts` WHERE `author_id` NOT IN (SELECT `id` FROM `profiles`));
--> statement-breakpoint
DELETE FROM `reports`
WHERE `reporter_id` NOT IN (SELECT `id` FROM `profiles`)
   OR (`target_type` = 'post' AND `target_id` NOT IN (SELECT `id` FROM `posts`))
   OR (`target_type` = 'comment' AND `target_id` NOT IN (SELECT `id` FROM `comments`));
--> statement-breakpoint
DELETE FROM `posts`
WHERE `author_id` NOT IN (SELECT `id` FROM `profiles`);
--> statement-breakpoint
DELETE FROM `follows`
WHERE `follower_id` NOT IN (SELECT `id` FROM `profiles`)
   OR `following_id` NOT IN (SELECT `id` FROM `profiles`)
   OR `follower_id` = `following_id`;
--> statement-breakpoint
DELETE FROM `notifications`
WHERE `recipient_id` NOT IN (SELECT `id` FROM `profiles`)
   OR `actor_id` NOT IN (SELECT `id` FROM `profiles`)
   OR (`post_id` IS NOT NULL AND `post_id` NOT IN (SELECT `id` FROM `posts`));
--> statement-breakpoint
CREATE TABLE `story_views` (
  `story_id` integer NOT NULL,
  `viewer_id` integer NOT NULL,
  `viewed_at` integer NOT NULL,
  PRIMARY KEY (`story_id`, `viewer_id`),
  FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`viewer_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `story_reactions` (
  `story_id` integer NOT NULL,
  `reactor_id` integer NOT NULL,
  `emoji` text NOT NULL,
  `created_at` integer NOT NULL,
  PRIMARY KEY (`story_id`, `reactor_id`),
  FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`reactor_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
