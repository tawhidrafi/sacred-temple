import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

export const pujas = sqliteTable(
  "pujas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(), // JSON: Localized { en, bn }
    description: text("description").notNull(), // JSON: Localized { en, bn }
    offered: text("offered"), // JSON: Localized { en, bn } (samagri / offerings included)
    priceBdt: integer("price_bdt").notNull().default(0), // Integer BDT
    duration: text("duration"), // e.g. "45 minutes", "2 hours"
    bookable: integer("bookable", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    slugIdx: index("pujas_slug_idx").on(table.slug),
    sortOrderIdx: index("pujas_sort_order_idx").on(table.sortOrder),
    activeIdx: index("pujas_active_idx").on(table.active),
  })
);

export const pujaAddons = sqliteTable(
  "puja_addons",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pujaId: integer("puja_id").references(() => pujas.id, { onDelete: "cascade" }), // nullable for general addons
    name: text("name").notNull(), // JSON: Localized { en, bn }
    description: text("description"), // JSON: Localized { en, bn }
    price: integer("price").notNull().default(0), // BDT
    status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    pujaIdIdx: index("puja_addons_puja_id_idx").on(table.pujaId),
  })
);

export const pujaTimeSlots = sqliteTable(
  "puja_time_slots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pujaId: integer("puja_id").references(() => pujas.id, { onDelete: "cascade" }), // nullable for general slots
    date: text("date"), // YYYY-MM-DD or null for daily recurring slot
    name: text("name"), // JSON: Localized e.g. "Morning Aarti"
    startTime: text("start_time").notNull(), // HH:mm
    endTime: text("end_time").notNull(),   // HH:mm
    capacity: integer("capacity").notNull().default(10),
    status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    pujaIdIdx: index("puja_time_slots_puja_id_idx").on(table.pujaId),
    dateIdx: index("puja_time_slots_date_idx").on(table.date),
  })
);
