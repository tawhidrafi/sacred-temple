CREATE TABLE `puja_addons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`puja_id` integer,
	`name` text NOT NULL,
	`description` text,
	`price` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`puja_id`) REFERENCES `pujas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `puja_addons_puja_id_idx` ON `puja_addons` (`puja_id`);--> statement-breakpoint
CREATE TABLE `puja_time_slots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`puja_id` integer,
	`date` text,
	`name` text,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`capacity` integer DEFAULT 10 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`puja_id`) REFERENCES `pujas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `puja_time_slots_puja_id_idx` ON `puja_time_slots` (`puja_id`);--> statement-breakpoint
CREATE INDEX `puja_time_slots_date_idx` ON `puja_time_slots` (`date`);--> statement-breakpoint
CREATE TABLE `devotee_booking_meta` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_ref` text NOT NULL,
	`time_slot` text,
	`address` text,
	`base_amount` integer DEFAULT 0 NOT NULL,
	`addon_amount` integer DEFAULT 0 NOT NULL,
	`total_amount` integer DEFAULT 0 NOT NULL,
	`addons_snapshot` text,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`payment_method` text DEFAULT 'offline_cash' NOT NULL,
	`transaction_reference` text,
	`payment_proof` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`booking_ref`) REFERENCES `puja_bookings`(`ref`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `devotee_booking_meta_booking_ref_unique` ON `devotee_booking_meta` (`booking_ref`);--> statement-breakpoint
CREATE INDEX `devotee_booking_meta_ref_idx` ON `devotee_booking_meta` (`booking_ref`);--> statement-breakpoint
CREATE INDEX `devotee_booking_meta_payment_idx` ON `devotee_booking_meta` (`payment_status`);--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`profile_image` text,
	`address` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country` text DEFAULT 'Bangladesh' NOT NULL,
	`phone_verified` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_user_id_unique` ON `user_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_profiles_user_id_idx` ON `user_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `donation_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `donation_categories_slug_unique` ON `donation_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `donation_categories_slug_idx` ON `donation_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `donation_categories_sort_order_idx` ON `donation_categories` (`sort_order`);--> statement-breakpoint
CREATE TABLE `donation_receipts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`donation_id` integer NOT NULL,
	`receipt_number` text NOT NULL,
	`issued_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`donation_id`) REFERENCES `donations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `donation_receipts_donation_id_unique` ON `donation_receipts` (`donation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `donation_receipts_receipt_number_unique` ON `donation_receipts` (`receipt_number`);--> statement-breakpoint
CREATE INDEX `donation_receipts_receipt_no_idx` ON `donation_receipts` (`receipt_number`);--> statement-breakpoint
CREATE INDEX `donation_receipts_donation_id_idx` ON `donation_receipts` (`donation_id`);--> statement-breakpoint
CREATE TABLE `donations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ref` text NOT NULL,
	`user_id` text,
	`category_id` integer NOT NULL,
	`donor_name` text NOT NULL,
	`email` text,
	`phone` text NOT NULL,
	`amount` integer NOT NULL,
	`payment_method` text NOT NULL,
	`transaction_reference` text,
	`payment_proof` text,
	`message` text,
	`is_anonymous` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'pending_verification' NOT NULL,
	`verified_at` integer,
	`handled_by` text,
	`admin_note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category_id`) REFERENCES `donation_categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `donations_ref_unique` ON `donations` (`ref`);--> statement-breakpoint
CREATE INDEX `donations_ref_idx` ON `donations` (`ref`);--> statement-breakpoint
CREATE INDEX `donations_user_id_idx` ON `donations` (`user_id`);--> statement-breakpoint
CREATE INDEX `donations_category_id_idx` ON `donations` (`category_id`);--> statement-breakpoint
CREATE INDEX `donations_status_idx` ON `donations` (`status`);--> statement-breakpoint
CREATE INDEX `donations_created_at_idx` ON `donations` (`created_at`);--> statement-breakpoint
CREATE INDEX `pujas_active_idx` ON `pujas` (`active`);