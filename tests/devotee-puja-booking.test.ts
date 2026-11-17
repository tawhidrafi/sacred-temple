import { describe, it, expect, beforeEach } from "vitest";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../server/db/schema";
import { PujasService } from "../server/services/pujas";
import { BookingsService } from "../server/services/bookings";
import { devoteePujaBookingCreateSchema } from "../shared/schemas/user-portal";

describe("Task 3 — Puja Catalog & Devotee Booking Service", () => {
  let sqlite: Database;
  let db: any;

  beforeEach(() => {
    sqlite = new Database(":memory:");
    sqlite.run("PRAGMA foreign_keys = ON;");
    sqlite.run(`
      CREATE TABLE user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified INTEGER NOT NULL DEFAULT 0,
        image TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        phone TEXT
      );

      CREATE TABLE pujas (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        offered TEXT,
        price_bdt INTEGER NOT NULL DEFAULT 0,
        duration TEXT,
        bookable INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE puja_addons (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        puja_id INTEGER REFERENCES pujas(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE puja_time_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        puja_id INTEGER REFERENCES pujas(id) ON DELETE CASCADE,
        date TEXT,
        name TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 10,
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE puja_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        ref TEXT NOT NULL UNIQUE,
        user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
        puja_id INTEGER REFERENCES pujas(id) ON DELETE SET NULL,
        puja_type TEXT NOT NULL DEFAULT 'standard',
        custom_puja_name TEXT,
        custom_dakshina INTEGER,
        special_instructions TEXT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        gotra TEXT,
        preferred_date TEXT NOT NULL,
        note TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        handled_by TEXT,
        admin_note TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE devotee_booking_meta (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        booking_ref TEXT NOT NULL UNIQUE REFERENCES puja_bookings(ref) ON DELETE CASCADE,
        time_slot TEXT,
        address TEXT,
        base_amount INTEGER NOT NULL DEFAULT 0,
        addon_amount INTEGER NOT NULL DEFAULT 0,
        total_amount INTEGER NOT NULL DEFAULT 0,
        addons_snapshot TEXT,
        payment_status TEXT NOT NULL DEFAULT 'unpaid',
        payment_method TEXT NOT NULL DEFAULT 'offline_cash',
        transaction_reference TEXT,
        payment_proof TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    db = drizzle(sqlite, { schema });

    const now = Date.now();
    // Seed user
    sqlite.run(
      "INSERT INTO user (id, name, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      ["dev_1", "Biplob Sen", "biplob@example.com", "01711223344", now, now]
    );

    // Seed puja
    sqlite.run(
      `INSERT INTO pujas (id, slug, name, description, offered, price_bdt, duration, bookable, active, sort_order, created_at, updated_at)
       VALUES (1, 'special-puja', '{"en":"Special Puja","bn":"বিশেষ পূজা"}', '{"en":"Detailed puja with bhog","bn":"বিশেষ ভোগ ও পূজা"}', '{"en":"Flowers & prasad","bn":"পুষ্প ও প্রসাদ"}', 501, '45 minutes', 1, 1, 1, ?, ?)`,
      [now, now]
    );

    // Seed addon
    sqlite.run(
      `INSERT INTO puja_addons (id, puja_id, name, description, price, status, created_at, updated_at)
       VALUES (1, 1, '{"en":"Special Garland","bn":"বিশেষ মালা"}', 'Fresh lotus garland', 150, 'active', ?, ?)`,
      [now, now]
    );

    // Seed time slot
    sqlite.run(
      `INSERT INTO puja_time_slots (id, puja_id, name, start_time, end_time, capacity, status, created_at, updated_at)
       VALUES (1, 1, '{"en":"Morning Aarti","bn":"প্রাতঃ আরতি"}', '07:30', '09:00', 10, 'active', ?, ?)`,
      [now, now]
    );
  });

  describe("Puja Catalog", () => {
    it("lists active bookable pujas with fallback to initial data if empty", async () => {
      const items = await PujasService.listPublicPujas(db);
      expect(items.length).toBeGreaterThanOrEqual(1);
      const special = items.find((p: any) => p.slug === "special-puja");
      expect(special).toBeDefined();
      expect(special.priceBdt).toBe(501);
    });

    it("fetches single puja with available addons and time slots", async () => {
      const result = await PujasService.getPublicPujaBySlug(db, "special-puja");
      expect(result).not.toBeNull();
      expect(result.puja.slug).toBe("special-puja");
      expect(result.addons.length).toBeGreaterThanOrEqual(1);
      expect(result.timeSlots.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Devotee Booking Flow", () => {
    it("validates input, calculates total amount server-side, and stores booking with metadata", async () => {
      // 10 days in future
      const futureDate = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);

      const bookingInput = {
        pujaSlug: "special-puja",
        preferredDate: futureDate,
        timeSlot: "07:30 - 09:00",
        devoteeName: "Biplob Sen",
        phone: "01711223344",
        email: "biplob@example.com",
        gotra: "Sandilya",
        address: "Prabortok Circle, Chittagong",
        specialInstructions: "Offer prayers for family health and well-being",
        selectedAddons: [
          {
            id: "addon-1",
            name: "Special Garland",
            priceBdt: 150,
          },
        ],
        paymentMethod: "offline_cash" as const,
      };

      const parsed = devoteePujaBookingCreateSchema.safeParse(bookingInput);
      expect(parsed.success).toBe(true);

      const bookingRes = await BookingsService.createDevoteeBooking(
        db,
        "dev_1",
        parsed.data!
      );

      expect(bookingRes.ref).toMatch(/^KM-2026-[A-Z0-9]{5}$/);
      expect(bookingRes.baseAmount).toBe(501);
      expect(bookingRes.addonAmount).toBe(150);
      expect(bookingRes.totalAmount).toBe(651);
      expect(bookingRes.paymentStatus).toBe("unpaid");

      // Verify booking retrieval with metadata
      const single = await BookingsService.getDevoteeBooking(db, bookingRes.ref, "dev_1");
      expect(single).not.toBeNull();
      expect(single?.name).toBe("Biplob Sen");
      expect(single?.gotra).toBe("Sandilya");
      expect(single?.meta?.totalAmount).toBe(651);
      expect(single?.meta?.timeSlot).toBe("07:30 - 09:00");

      // Devotee isolation: user dev_2 cannot access dev_1's booking
      const unauthorized = await BookingsService.getDevoteeBooking(db, bookingRes.ref, "dev_2");
      expect(unauthorized).toBeNull();
    });

    it("rejects bookings for past dates", async () => {
      const pastDate = "2020-01-01";
      await expect(
        BookingsService.createDevoteeBooking(db, "dev_1", {
          pujaSlug: "special-puja",
          preferredDate: pastDate,
          timeSlot: "07:30 - 09:00",
          devoteeName: "Biplob Sen",
          phone: "01711223344",
          email: "biplob@example.com",
          selectedAddons: [],
          paymentMethod: "offline_cash",
        })
      ).rejects.toThrow("Cannot book for past dates");
    });
  });
});
