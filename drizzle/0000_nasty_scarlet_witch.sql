CREATE TABLE `training_attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`version` text NOT NULL,
	`session_date` text NOT NULL,
	`live_minutes` integer NOT NULL,
	`prep_minutes` integer NOT NULL,
	`recorded_by` text NOT NULL,
	`recorded_at` text NOT NULL,
	`voided_at` text
);
--> statement-breakpoint
CREATE TABLE `learning_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`version` text NOT NULL,
	`score` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`, `version`)
);
