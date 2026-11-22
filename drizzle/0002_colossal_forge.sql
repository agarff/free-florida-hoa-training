CREATE TABLE `self_paced_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`version` text NOT NULL,
	`state` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`, `version`)
);
