DROP TABLE `activityLog`;--> statement-breakpoint
DROP TABLE `applicationCompliance`;--> statement-breakpoint
DROP TABLE `applications`;--> statement-breakpoint
DROP TABLE `complianceControls`;--> statement-breakpoint
DROP TABLE `vulnerabilities`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';