CREATE TABLE `course_suggestion_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`suggestion_id` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`details` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`suggestion_id`) REFERENCES `course_suggestions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `course_suggestion_audit_parent` ON `course_suggestion_audit` (`suggestion_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `course_suggestion_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`suggestion_id` text NOT NULL,
	`body` text NOT NULL,
	`display_name` text NOT NULL,
	`moderation` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`action_id` text,
	FOREIGN KEY (`suggestion_id`) REFERENCES `course_suggestions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `course_suggestion_comments_parent` ON `course_suggestion_comments` (`suggestion_id`,`moderation`,`created_at`);--> statement-breakpoint
CREATE TABLE `course_contribution_limits` (
	`bucket` integer NOT NULL,
	`client_key` text NOT NULL,
	`hits` integer NOT NULL,
	PRIMARY KEY(`bucket`, `client_key`)
);
--> statement-breakpoint
CREATE TABLE `course_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`edition` text NOT NULL,
	`track` text NOT NULL,
	`issue` text NOT NULL,
	`proposal` text NOT NULL,
	`source` text NOT NULL,
	`display_name` text NOT NULL,
	`private_contact` text NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`public_note` text DEFAULT '' NOT NULL,
	`visible` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`action_id` text,
	`approved_text` text,
	`approved_at` text,
	`published_edition` text,
	`published_at` text
);
--> statement-breakpoint
CREATE INDEX `course_suggestions_public` ON `course_suggestions` (`visible`,`created_at`);
