import { describe, it, expect } from "vitest";
import { Database } from "bun:sqlite";
import {
  initialPujas,
  initialDonationCategories,
  initialTimeSlots,
  initialAddons,
} from "../shared/constants/initial-data";

describe("Task 1 — Database Schemas & Initial Seed Data", () => {
  it("verifies initial seed data constants have required structure", () => {
    expect(initialPujas.length).toBe(12);
    expect(initialDonationCategories.length).toBe(7);
    expect(initialTimeSlots.length).toBeGreaterThanOrEqual(4);
    expect(initialAddons.length).toBeGreaterThanOrEqual(4);

    for (const p of initialPujas) {
      expect(p.slug).toBeTruthy();
      expect(p.name.en).toBeTruthy();
      expect(p.name.bn).toBeTruthy();
      expect(p.priceBdt).toBeGreaterThanOrEqual(0);
      expect(typeof p.bookable).toBe("boolean");
    }

    for (const c of initialDonationCategories) {
      expect(c.slug).toBeTruthy();
      expect(c.name.en).toBeTruthy();
      expect(c.name.bn).toBeTruthy();
    }
  });

  it("creates user_profiles, donations, and puja addon tables in SQLite cleanly", () => {
    const sqlite = new Database(":memory:");
    sqlite.run("PRAGMA foreign_keys = ON;");

    // Base user & pujas tables
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

      CREATE TABLE user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
        profile_image TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'Bangladesh',
        phone_verified INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE donation_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        ref TEXT NOT NULL UNIQUE,
        user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
        category_id INTEGER NOT NULL REFERENCES donation_categories(id) ON DELETE RESTRICT,
        donor_name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        amount INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        transaction_reference TEXT,
        payment_proof TEXT,
        message TEXT,
        is_anonymous INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending_verification',
        verified_at INTEGER,
        handled_by TEXT,
        admin_note TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE donation_receipts (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        donation_id INTEGER NOT NULL UNIQUE REFERENCES donations(id) ON DELETE CASCADE,
        receipt_number TEXT NOT NULL UNIQUE,
        issued_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
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

    // Insert user & profile
    const now = Date.now();
    sqlite.run(
      "INSERT INTO user (id, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      ["usr_123", "Amit Sharma", "amit@example.com", now, now]
    );

    sqlite.run(
      `INSERT INTO user_profiles (user_id, address, city, state, postal_code, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["usr_123", "12 Prabortok Circle", "Chittagong", "Chittagong Division", "4000", now, now]
    );

    // Insert category & donation
    sqlite.run(
      `INSERT INTO donation_categories (name, slug, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      ['{"en":"Annadanam","bn":"অন্নদান"}', "annadanam", "Food distribution", now, now]
    );

    sqlite.run(
      `INSERT INTO donations (ref, user_id, category_id, donor_name, phone, amount, payment_method, status, created_at, updated_at)
       VALUES (?, ?, 1, ?, ?, 2500, 'offline_bank', 'confirmed', ?, ?)`,
      ["DON-2026-9A1F2", "usr_123", "Amit Sharma", "01711234567", now, now]
    );

    // Insert receipt
    sqlite.run(
      `INSERT INTO donation_receipts (donation_id, receipt_number, issued_at, created_at)
       VALUES (1, 'REC-2026-00001', ?, ?)`,
      [now, now]
    );

    // Insert puja booking & devotee booking meta
    sqlite.run(
      `INSERT INTO puja_bookings (ref, user_id, name, phone, preferred_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["KM-2026-AB123", "usr_123", "Amit Sharma", "01711234567", "2026-11-25", now, now]
    );

    sqlite.run(
      `INSERT INTO devotee_booking_meta (booking_ref, time_slot, base_amount, total_amount, payment_status, payment_method, created_at, updated_at)
       VALUES (?, ?, 501, 501, 'unpaid', 'offline_cash', ?, ?)`,
      ["KM-2026-AB123", "07:30 - 09:00", now, now]
    );

    const donationRow: any = sqlite.query("SELECT * FROM donations WHERE id = 1").get();
    expect(donationRow.amount).toBe(2500);
    expect(donationRow.status).toBe("confirmed");

    const receiptRow: any = sqlite.query("SELECT * FROM donation_receipts WHERE donation_id = 1").get();
    expect(receiptRow.receipt_number).toBe("REC-2026-00001");

    const metaRow: any = sqlite.query("SELECT * FROM devotee_booking_meta WHERE booking_ref = 'KM-2026-AB123'").get();
    expect(metaRow.total_amount).toBe(501);
    expect(metaRow.payment_method).toBe("offline_cash");
  });
});
