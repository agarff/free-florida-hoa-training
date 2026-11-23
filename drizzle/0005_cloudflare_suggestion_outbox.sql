CREATE TABLE `course_suggestion_pull_outbox` (
	`suggestion_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`lease` text,
	`lease_until` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`provider_id` text,
	`accepted_at` integer,
	`reviewed_at` integer,
	`reviewed_by` text,
	FOREIGN KEY (`suggestion_id`) REFERENCES `course_suggestions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `course_suggestion_pull_claim` ON `course_suggestion_pull_outbox` (`status`,`lease_until`);
