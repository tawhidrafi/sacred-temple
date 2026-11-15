-- Full SQLite / Cloudflare D1 Schema for sacred-project

CREATE TABLE IF NOT EXISTS `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`done` integer DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS `home_cms` (
	`key` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`phone` text
);
CREATE UNIQUE INDEX IF NOT EXISTS `user_email_unique` ON `user` (`email`);

CREATE TABLE IF NOT EXISTS `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX IF NOT EXISTS `session_token_unique` ON `session` (`token`);

CREATE TABLE IF NOT EXISTS `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);

CREATE TABLE IF NOT EXISTS `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`date` text NOT NULL,
	`kind` text DEFAULT 'special_puja' NOT NULL,
	`title` text NOT NULL,
	`label` text,
	`time` text,
	`description` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `events_slug_unique` ON `events` (`slug`);
CREATE INDEX IF NOT EXISTS `events_date_idx` ON `events` (`date`);
CREATE INDEX IF NOT EXISTS `events_slug_idx` ON `events` (`slug`);

CREATE TABLE IF NOT EXISTS `notices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`category` text DEFAULT 'general' NOT NULL,
	`date` text NOT NULL,
	`body` text NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `notices_slug_unique` ON `notices` (`slug`);
CREATE INDEX IF NOT EXISTS `notices_slug_idx` ON `notices` (`slug`);
CREATE INDEX IF NOT EXISTS `notices_date_idx` ON `notices` (`date`);
CREATE INDEX IF NOT EXISTS `notices_pinned_idx` ON `notices` (`pinned`);

CREATE TABLE IF NOT EXISTS `pujas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`offered` text,
	`price_bdt` integer DEFAULT 0 NOT NULL,
	`duration` text,
	`bookable` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `pujas_slug_unique` ON `pujas` (`slug`);
CREATE INDEX IF NOT EXISTS `pujas_slug_idx` ON `pujas` (`slug`);
CREATE INDEX IF NOT EXISTS `pujas_sort_order_idx` ON `pujas` (`sort_order`);

CREATE TABLE IF NOT EXISTS `deities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`subtitle` text,
	`description` text NOT NULL,
	`image_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `deities_slug_unique` ON `deities` (`slug`);
CREATE INDEX IF NOT EXISTS `deities_slug_idx` ON `deities` (`slug`);
CREATE INDEX IF NOT EXISTS `deities_sort_order_idx` ON `deities` (`sort_order`);

CREATE TABLE IF NOT EXISTS `daily_schedule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`time` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
CREATE INDEX IF NOT EXISTS `daily_schedule_time_idx` ON `daily_schedule` (`time`);
CREATE INDEX IF NOT EXISTS `daily_schedule_sort_order_idx` ON `daily_schedule` (`sort_order`);

CREATE TABLE IF NOT EXISTS `pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `pages_slug_unique` ON `pages` (`slug`);
CREATE INDEX IF NOT EXISTS `pages_slug_idx` ON `pages` (`slug`);
CREATE INDEX IF NOT EXISTS `pages_published_idx` ON `pages` (`published`);

CREATE TABLE IF NOT EXISTS `albums` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`cover` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `albums_slug_unique` ON `albums` (`slug`);
CREATE INDEX IF NOT EXISTS `albums_slug_idx` ON `albums` (`slug`);
CREATE INDEX IF NOT EXISTS `albums_sort_order_idx` ON `albums` (`sort_order`);

CREATE TABLE IF NOT EXISTS `album_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`album_id` integer NOT NULL,
	`media_id` text NOT NULL,
	`caption` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `album_items_album_id_idx` ON `album_items` (`album_id`);
CREATE INDEX IF NOT EXISTS `album_items_sort_order_idx` ON `album_items` (`sort_order`);

CREATE TABLE IF NOT EXISTS `puja_bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ref` text NOT NULL,
	`user_id` text,
	`puja_id` integer,
	`puja_type` text DEFAULT 'standard' NOT NULL,
	`custom_puja_name` text,
	`custom_dakshina` integer,
	`special_instructions` text,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`gotra` text,
	`preferred_date` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'new' NOT NULL,
	`handled_by` text,
	`admin_note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`puja_id`) REFERENCES `pujas`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE UNIQUE INDEX IF NOT EXISTS `puja_bookings_ref_unique` ON `puja_bookings` (`ref`);
CREATE INDEX IF NOT EXISTS `puja_bookings_ref_idx` ON `puja_bookings` (`ref`);
CREATE INDEX IF NOT EXISTS `puja_bookings_user_id_idx` ON `puja_bookings` (`user_id`);
CREATE INDEX IF NOT EXISTS `puja_bookings_type_idx` ON `puja_bookings` (`puja_type`);
CREATE INDEX IF NOT EXISTS `puja_bookings_status_idx` ON `puja_bookings` (`status`);
CREATE INDEX IF NOT EXISTS `puja_bookings_pref_date_idx` ON `puja_bookings` (`preferred_date`);

CREATE TABLE IF NOT EXISTS `contact_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`admin_note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
CREATE INDEX IF NOT EXISTS `contact_messages_status_idx` ON `contact_messages` (`status`);
CREATE INDEX IF NOT EXISTS `contact_messages_created_at_idx` ON `contact_messages` (`created_at`);

CREATE TABLE IF NOT EXISTS `volunteers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`area` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'new' NOT NULL,
	`admin_note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
CREATE INDEX IF NOT EXISTS `volunteers_status_idx` ON `volunteers` (`status`);
CREATE INDEX IF NOT EXISTS `volunteers_area_idx` ON `volunteers` (`area`);
CREATE INDEX IF NOT EXISTS `volunteers_created_at_idx` ON `volunteers` (`created_at`);

CREATE TABLE IF NOT EXISTS `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt` text NOT NULL,
	`uploaded_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE UNIQUE INDEX IF NOT EXISTS `media_key_unique` ON `media` (`key`);
CREATE INDEX IF NOT EXISTS `media_key_idx` ON `media` (`key`);
CREATE INDEX IF NOT EXISTS `media_created_at_idx` ON `media` (`created_at`);

CREATE TABLE IF NOT EXISTS `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text,
	`details` text,
	`at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE INDEX IF NOT EXISTS `audit_logs_at_idx` ON `audit_logs` (`at`);
CREATE INDEX IF NOT EXISTS `audit_logs_user_id_idx` ON `audit_logs` (`user_id`);
CREATE INDEX IF NOT EXISTS `audit_logs_entity_idx` ON `audit_logs` (`entity`);

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
