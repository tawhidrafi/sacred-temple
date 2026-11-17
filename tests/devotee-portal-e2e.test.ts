import { describe, it, expect, beforeEach } from "vitest";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../server/db/schema";
import { UserProfileService } from "../server/services/user-profile";
import { PujasService } from "../server/services/pujas";
import { BookingsService } from "../server/services/bookings";
import { DonationsService } from "../server/services/donations";
import {
  devoteeRegisterSchema,
  devoteeLoginSchema,
  devoteeProfileUpdateSchema,
  devoteeChangePasswordSchema,
  devoteePujaBookingCreateSchema,
  devoteeDonationCreateSchema,
} from "../shared/schemas/user-portal";

describe("Task 9 — Comprehensive End-to-End Devotee Portal Validation", () => {
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

      CREATE TABLE user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
        profile_image TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT NOT NULL DEFAULT 'Bangladesh',
        phone_verified INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE pujas (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        significance TEXT,
        requirements TEXT,
        offered TEXT,
        price_bdt INTEGER NOT NULL DEFAULT 0,
        duration TEXT,
        image TEXT,
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

      CREATE TABLE donation_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        min_amount INTEGER NOT NULL DEFAULT 10,
        sort_order INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
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
        payment_method TEXT NOT NULL DEFAULT 'offline_cash',
        transaction_reference TEXT,
        payment_proof TEXT,
        message TEXT,
        is_anonymous INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending_verification',
        handled_by TEXT,
        admin_note TEXT,
        verified_at INTEGER,
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

    // Seed 2 devotees
    sqlite.run(
      "INSERT INTO user (id, name, email, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'user', ?, ?)",
      ["dev_101", "Gaurav Chakraborty", "gaurav@example.com", "01711223344", now, now]
    );
    sqlite.run(
      "INSERT INTO user (id, name, email, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'user', ?, ?)",
      ["dev_102", "Priyanka Roy", "priyanka@example.com", "01811223344", now, now]
    );

    // Seed admin
    sqlite.run(
      "INSERT INTO user (id, name, email, phone, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', ?, ?)",
      ["admin_1", "Mandir Head Priest", "admin@temple.org", "01911223344", now, now]
    );

    // Seed Puja
    sqlite.run(
      `INSERT INTO pujas (id, slug, name, description, price_bdt, duration, bookable, active, sort_order, created_at, updated_at)
       VALUES (1, 'shyama-kali-puja', '{"en":"Shyama Kali Special Puja","bn":"শ্যামা কালী বিশেষ পূজা"}', '{"en":"Full evening ritual","bn":"সম্পূর্ণ সন্ধ্যা অর্চনা"}', 1000, '60 mins', 1, 1, 1, ?, ?)`,
      [now, now]
    );

    // Seed Addons
    sqlite.run(
      `INSERT INTO puja_addons (id, puja_id, name, description, price, status, created_at, updated_at)
       VALUES (1, 1, '{"en":"Mahaprasad Bhog","bn":"মহাপ্রসাদ ভোগ"}', 'Special consecrated prasad', 500, 'active', ?, ?)`,
      [now, now]
    );

    // Seed Time Slot
    sqlite.run(
      `INSERT INTO puja_time_slots (id, puja_id, name, start_time, end_time, capacity, status, created_at, updated_at)
       VALUES (1, 1, '{"en":"Evening Aarti","bn":"সন্ধ্যা আরতি"}', '18:00', '19:30', 10, 'active', ?, ?)`,
      [now, now]
    );

    // Seed Donation Category
    sqlite.run(
      `INSERT INTO donation_categories (id, slug, name, description, min_amount, sort_order, status, created_at, updated_at)
       VALUES (1, 'annadan-seva', '{"en":"Annadan Seva","bn":"অন্নদান সেবা"}', 'Feed pilgrims and sadhus', 100, 1, 'active', ?, ?)`,
      [now, now]
    );
  });

  it("Step 1 & 2: validates devotee registration, login, and dynamic profile completion", async () => {
    // 1. Devotee registration schema validation
    const validRegistration = devoteeRegisterSchema.safeParse({
      name: "Debabrata Das",
      email: "debabrata@example.com",
      phone: "01712345678",
      password: "StrongPassword123",
      confirmPassword: "StrongPassword123",
    });
    expect(validRegistration.success).toBe(true);

    const invalidMismatch = devoteeRegisterSchema.safeParse({
      name: "Debabrata Das",
      email: "debabrata@example.com",
      phone: "01712345678",
      password: "Password123",
      confirmPassword: "DifferentPassword123",
    });
    expect(invalidMismatch.success).toBe(false);

    // 2. Devotee profile completion calculation
    const initialProfile = await UserProfileService.getProfile(db, "dev_101");
    expect(initialProfile).toBeDefined();
    expect(initialProfile?.completionPercentage).toBeGreaterThanOrEqual(40);

    // 3. Update devotee profile with address & picture
    await UserProfileService.updateProfile(db, "dev_101", {
      address: "123 Temple Road",
      city: "Chattogram",
      state: "Chattogram",
      postalCode: "4000",
      country: "Bangladesh",
      profileImage: "https://example.com/avatar.jpg",
    });

    const updatedProfile = await UserProfileService.getProfile(db, "dev_101");
    expect(updatedProfile?.city).toBe("Chattogram");
    expect(updatedProfile?.completionPercentage).toBe(100);
  });

  it("Step 3 & 4: creates puja booking, enforces server pricing, and verifies devotee isolation", async () => {
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    const bookingInput = {
      pujaSlug: "shyama-kali-puja",
      preferredDate: tomorrowStr,
      timeSlot: "Evening Aarti (18:00 - 19:30)",
      devoteeName: "Gaurav Chakraborty",
      phone: "01711223344",
      email: "gaurav@example.com",
      gotra: "Kashyapa",
      address: "123 Temple Road, Chattogram",
      specialInstructions: "Family health prayers",
      selectedAddons: [
        { id: "1", name: "Mahaprasad Bhog", priceBdt: 500 },
      ],
      paymentMethod: "offline_cash" as const,
    };

    // 1. Devotee 1 creates booking
    const bookingResult = await BookingsService.createDevoteeBooking(db, "dev_101", bookingInput);
    expect(bookingResult.success).toBe(true);
    expect(bookingResult.ref).toMatch(/^KM-2026-[A-Z0-9]{5}$/);
    expect(bookingResult.baseAmount).toBe(1000);
    expect(bookingResult.addonAmount).toBe(500);
    expect(bookingResult.totalAmount).toBe(1500); // 1000 + 500

    // 2. Devotee 1 can access their own booking
    const dev1Booking = await BookingsService.getDevoteeBooking(db, bookingResult.ref, "dev_101");
    expect(dev1Booking).toBeDefined();
    expect(dev1Booking?.ref).toBe(bookingResult.ref);
    expect(dev1Booking?.status).toBe("new");
    expect(dev1Booking?.meta?.totalAmount).toBe(1500);

    // 3. Devotee 2 CANNOT access Devotee 1's booking (Strict user isolation!)
    const dev2Access = await BookingsService.getDevoteeBooking(db, bookingResult.ref, "dev_102");
    expect(dev2Access).toBeNull();

    // 4. Devotee 2 CANNOT cancel Devotee 1's booking
    await expect(
      BookingsService.cancelUserBooking(db, bookingResult.ref, "dev_102")
    ).rejects.toThrow();

    // 5. Devotee 1 cancels their own booking
    const cancelOutcome = await BookingsService.cancelUserBooking(db, bookingResult.ref, "dev_101");
    expect(cancelOutcome.success).toBe(true);

    const cancelledBooking = await BookingsService.getDevoteeBooking(db, bookingResult.ref, "dev_101");
    expect(cancelledBooking?.status).toBe("cancelled");

    // 6. Cannot cancel an already cancelled booking
    await expect(
      BookingsService.cancelUserBooking(db, bookingResult.ref, "dev_101")
    ).rejects.toThrow("Only 'new' requests can be cancelled");
  });

  it("Step 5 & 6: processes offline donation lifecycle, receipt issuance, and receipt query gating", async () => {
    // 1. Devotee 1 creates an offline donation record
    const donationOutcome = await DonationsService.createDonation(db, "dev_101", {
      categoryId: 1,
      amount: 2500,
      donorName: "Gaurav Chakraborty",
      phone: "01711223344",
      email: "gaurav@example.com",
      paymentMethod: "offline_bank",
      transactionReference: "CITY-12345678",
      message: "For daily prasadam distribution",
      isAnonymous: false,
    });

    expect(donationOutcome.success).toBe(true);
    expect(donationOutcome.status).toBe("pending_verification");
    expect(donationOutcome.ref).toMatch(/^DON-2026-[A-Z0-9]{5}$/);

    // 2. Receipt gating: While pending, receipt must be null
    const pendingRecord = await DonationsService.getDevoteeDonation(db, donationOutcome.ref, "dev_101");
    expect(pendingRecord).toBeDefined();
    expect(pendingRecord?.status).toBe("pending_verification");
    expect(pendingRecord?.receipt).toBeNull(); // Receipt cannot be viewed/downloaded yet!

    // 3. User isolation: Devotee 2 cannot view Devotee 1's donation
    const dev2Donation = await DonationsService.getDevoteeDonation(db, donationOutcome.ref, "dev_102");
    expect(dev2Donation).toBeNull();

    // 4. Admin verifies the remittance
    const adminVerify = await DonationsService.verifyDonation(
      db,
      donationOutcome.ref,
      "admin_1",
      "confirmed",
      "Bank slip verified and deposited into City Bank A/C"
    );

    expect(adminVerify.success).toBe(true);
    expect(adminVerify.status).toBe("confirmed");
    expect(adminVerify.receiptNumber).toMatch(/^REC-2026-[A-Z0-9]{5}$/);

    // 5. Confirmed donation now provides official receipt to Devotee 1
    const confirmedRecord = await DonationsService.getDevoteeDonation(db, donationOutcome.ref, "dev_101");
    expect(confirmedRecord?.status).toBe("confirmed");
    expect(confirmedRecord?.receipt).toBeDefined();
    expect(confirmedRecord?.receipt?.receiptNumber).toBe(adminVerify.receiptNumber);

    // 6. User donations list aggregates stats
    const userList = await DonationsService.listUserDonations(db, "dev_101");
    expect(userList.totalConfirmedCount).toBe(1);
    expect(userList.totalConfirmedAmount).toBe(2500);
    expect(userList.totalPendingCount).toBe(0);
    expect(userList.items[0].receipt?.receiptNumber).toBe(adminVerify.receiptNumber);
  });

  it("Step 7: aggregates accurate devotee dashboard overview metrics", async () => {
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    // Create 1 confirmed donation of 5,000
    const don = await DonationsService.createDonation(db, "dev_101", {
      categoryId: 1,
      amount: 5000,
      donorName: "Gaurav Chakraborty",
      phone: "01711223344",
      paymentMethod: "offline_cash",
    });
    await DonationsService.verifyDonation(db, don.ref, "admin_1", "confirmed");

    // Create 1 upcoming puja booking
    await BookingsService.createDevoteeBooking(db, "dev_101", {
      pujaSlug: "shyama-kali-puja",
      preferredDate: tomorrowStr,
      timeSlot: "Evening Aarti",
      devoteeName: "Gaurav Chakraborty",
      phone: "01711223344",
      paymentMethod: "offline_cash",
    });

    const stats = await DonationsService.getDevoteeDashboardStats(db, "dev_101");
    expect(stats.totalBookings).toBe(1);
    expect(stats.upcomingBookings).toBe(1);
    expect(stats.totalDonations).toBe(1);
    expect(stats.totalDonationAmount).toBe(5000);
    expect(stats.upcomingBookingsList.length).toBe(1);
    expect(stats.upcomingBookingsList[0].bookingDate).toBe(tomorrowStr);
  });
});
