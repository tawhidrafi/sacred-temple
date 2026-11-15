-- Quick patch to apply migration 0013 changes to Cloudflare D1
-- Run this if you encounter:
-- "Failed query: select ... from puja_bookings left join pujas ... order by puja_bookings.created_at desc"

-- 1. Add missing custom puja columns to puja_bookings
ALTER TABLE `puja_bookings` ADD `puja_type` text DEFAULT 'standard' NOT NULL;
ALTER TABLE `puja_bookings` ADD `custom_puja_name` text;
ALTER TABLE `puja_bookings` ADD `custom_dakshina` integer;
ALTER TABLE `puja_bookings` ADD `special_instructions` text;
CREATE INDEX IF NOT EXISTS `puja_bookings_type_idx` ON `puja_bookings` (`puja_type`);

-- 2. Create visitations table (devotee darshan passes)
CREATE TABLE IF NOT EXISTS `visitations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ref` text NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`visit_date` text NOT NULL,
	`time_slot` text DEFAULT 'morning' NOT NULL,
	`visitor_count` integer DEFAULT 1 NOT NULL,
	`purpose` text DEFAULT 'general_darshan' NOT NULL,
	`special_needs` text,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`check_in_at` integer,
	`handled_by` text,
	`admin_notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE UNIQUE INDEX IF NOT EXISTS `visitations_ref_unique` ON `visitations` (`ref`);
CREATE INDEX IF NOT EXISTS `visitations_ref_idx` ON `visitations` (`ref`);
CREATE INDEX IF NOT EXISTS `visitations_user_id_idx` ON `visitations` (`user_id`);
CREATE INDEX IF NOT EXISTS `visitations_date_idx` ON `visitations` (`visit_date`);
CREATE INDEX IF NOT EXISTS `visitations_status_idx` ON `visitations` (`status`);
CREATE INDEX IF NOT EXISTS `visitations_slot_idx` ON `visitations` (`time_slot`);
