CREATE TABLE `course_suggestion_mail` (
	`suggestion_id` text PRIMARY KEY NOT NULL,
	`submission_key` text,
	`synthetic` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`first_attempt_at` integer,
	`last_attempt_at` integer,
	`claim_token` text,
	`envelope_hash` text,
	`failure` text,
	`accepted_at` integer,
	`provider_id` text,
	FOREIGN KEY (`suggestion_id`) REFERENCES `course_suggestions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_suggestion_mail_submission_key_unique` ON `course_suggestion_mail` (`submission_key`);
