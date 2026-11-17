import { describe, it, expect, beforeEach } from "vitest";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../server/db/schema";
import { DonationsService } from "../server/services/donations";
import { BookingsService } from "../server/services/bookings";

describe("Task 4 — Offline Donations, Receipts & Dashboard Stats", () => {
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

      CREATE TABLE puja_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        ref TEXT NOT NULL UNIQUE,
        user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
        puja_id INTEGER,
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

      CREATE TABLE audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id TEXT,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT,
        details TEXT,
        at INTEGER NOT NULL
      );
    `);
    db = drizzle(sqlite, { schema });

    const now = Date.now();
    sqlite.run(
      "INSERT INTO user (id, name, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      ["dev_donor_1", "Gaurav Roy", "gaurav@example.com", "01811223344", now, now]
    );

    sqlite.run(
      `INSERT INTO donation_categories (id, name, slug, description, status, sort_order, created_at, updated_at)
       VALUES (1, '{"en":"Annadanam Food Seva","bn":"অন্নদান মহাপ্রসাদ সেবা"}', 'annadanam', 'Daily food distribution', 'active', 1, ?, ?)`,
      [now, now]
    );
  });

  describe("Donations Service", () => {
    it("submits offline donation with pending_verification status and reference code", async () => {
      const res = await DonationsService.createDonation(db, "dev_donor_1", {
        categoryId: 1,
        amount: 2500,
        donorName: "Gaurav Roy",
        phone: "01811223344",
        email: "gaurav@example.com",
        paymentMethod: "offline_bank",
        transactionReference: "TXN-EBL-992144",
        message: "Dedicated to ancestors on Mahalaya",
        isAnonymous: false,
      });

      expect(res.success).toBe(true);
      expect(res.ref).toMatch(/^DON-2026-[A-Z0-9]{5}$/);
      expect(res.status).toBe("pending_verification");

      // Verify donation query for user
      const userDonations = await DonationsService.listUserDonations(db, "dev_donor_1");
      expect(userDonations.items.length).toBe(1);
      expect(userDonations.items[0].ref).toBe(res.ref);
      expect(userDonations.items[0].receipt).toBeNull(); // Not verified yet, so no receipt
    });

    it("verifies donation as admin, generates official receipt, and updates confirmed totals", async () => {
      const created = await DonationsService.createDonation(db, "dev_donor_1", {
        categoryId: 1,
        amount: 5000,
        donorName: "Gaurav Roy",
        phone: "01811223344",
        paymentMethod: "offline_mfs",
        transactionReference: "bKash-9X8K7L",
      });

      // Admin verifies donation
      const verified = await DonationsService.verifyDonation(
        db,
        created.id,
        "admin_staff_1",
        "confirmed",
        "Verified against bKash merchant statement"
      );

      expect(verified.status).toBe("confirmed");
      expect(verified.receiptNumber).toMatch(/^REC-2026-[A-Z0-9]{5}$/);

      // Now devotee fetches single donation details
      const detail = await DonationsService.getDevoteeDonation(db, created.ref, "dev_donor_1");
      expect(detail).not.toBeNull();
      expect(detail?.status).toBe("confirmed");
      expect(detail?.receipt).not.toBeNull();
      expect(detail?.receipt?.receiptNumber).toBe(verified.receiptNumber);

      // Devotee isolation: another user dev_2 cannot fetch Gaurav's donation
      const forbidden = await DonationsService.getDevoteeDonation(db, created.ref, "other_user_2");
      expect(forbidden).toBeNull();
    });

    it("aggregates dashboard metrics accurately", async () => {
      const now = Date.now();
      const futureDate = new Date(now + 5 * 86400000).toISOString().slice(0, 10);

      // Create a booking
      await db.run(`
        INSERT INTO puja_bookings (ref, user_id, name, phone, preferred_date, status, created_at, updated_at)
        VALUES ('KM-2026-TEST1', 'dev_donor_1', 'Gaurav Roy', '01811223344', '${futureDate}', 'new', ${now}, ${now})
      `);

      await db.run(`
        INSERT INTO devotee_booking_meta (booking_ref, time_slot, base_amount, total_amount, payment_status, payment_method, created_at, updated_at)
        VALUES ('KM-2026-TEST1', '07:30 - 09:00', 501, 501, 'unpaid', 'offline_cash', ${now}, ${now})
      `);

      // Create a confirmed donation
      const donation = await DonationsService.createDonation(db, "dev_donor_1", {
        categoryId: 1,
        amount: 3000,
        donorName: "Gaurav Roy",
        phone: "01811223344",
        paymentMethod: "offline_cash",
      });

      await DonationsService.verifyDonation(db, donation.id, "admin_1", "confirmed");

      // Fetch dashboard
      const dashboard = await DonationsService.getDevoteeDashboardStats(db, "dev_donor_1");
      expect(dashboard.totalBookings).toBe(1);
      expect(dashboard.upcomingBookings).toBe(1);
      expect(dashboard.totalDonations).toBe(1);
      expect(dashboard.totalDonationAmount).toBe(3000);
      expect(dashboard.upcomingBookingsList.length).toBe(1);
      expect(dashboard.upcomingBookingsList[0].ref).toBe("KM-2026-TEST1");
    });
  });
});
