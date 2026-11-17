import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const donationCategories = sqliteTable(
  "donation_categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(), // JSON: Localized { en, bn }
    description: text("description"), // JSON: Localized { en, bn }
    status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    slugIdx: index("donation_categories_slug_idx").on(table.slug),
    sortOrderIdx: index("donation_categories_sort_order_idx").on(table.sortOrder),
  })
);

export const donations = sqliteTable(
  "donations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ref: text("ref").notNull().unique(), // Unique public code e.g. DON-2026-7A1B2
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => donationCategories.id, { onDelete: "restrict" }),
    donorName: text("donor_name").notNull(),
    email: text("email"),
    phone: text("phone").notNull(),
    amount: integer("amount").notNull(), // BDT integer
    paymentMethod: text("payment_method", {
      enum: ["offline_cash", "offline_bank", "offline_mfs"],
    }).notNull(),
    transactionReference: text("transaction_reference"),
    paymentProof: text("payment_proof"),
    message: text("message"),
    isAnonymous: integer("is_anonymous", { mode: "boolean" }).notNull().default(false),
    status: text("status", {
      enum: ["pending_verification", "confirmed", "rejected"],
    })
      .notNull()
      .default("pending_verification"),
    verifiedAt: integer("verified_at"),
    handledBy: text("handled_by"),
    adminNote: text("admin_note"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    refIdx: index("donations_ref_idx").on(table.ref),
    userIdIdx: index("donations_user_id_idx").on(table.userId),
    categoryIdIdx: index("donations_category_id_idx").on(table.categoryId),
    statusIdx: index("donations_status_idx").on(table.status),
    createdAtIdx: index("donations_created_at_idx").on(table.createdAt),
  })
);

export const donationReceipts = sqliteTable(
  "donation_receipts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    donationId: integer("donation_id")
      .notNull()
      .unique()
      .references(() => donations.id, { onDelete: "cascade" }),
    receiptNumber: text("receipt_number").notNull().unique(), // e.g. REC-2026-00042
    issuedAt: integer("issued_at").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    receiptNumberIdx: index("donation_receipts_receipt_no_idx").on(table.receiptNumber),
    donationIdIdx: index("donation_receipts_donation_id_idx").on(table.donationId),
  })
);
