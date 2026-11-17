import { and, desc, eq, gte, ne, or, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { donations, donationCategories, donationReceipts } from "../db/schema/donations";
import { pujaBookings, devoteeBookingMeta } from "../db/schema/bookings";
import { pujas } from "../db/schema/pujas";
import { AuditService } from "./audit";
import { initialDonationCategories, initialPujas } from "../../shared/constants/initial-data";
import type { DevoteeDonationCreateInput } from "../../shared/schemas/user-portal";

function generateDonationRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DON-2026-${rand}`;
}

function generateReceiptNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REC-2026-${rand}`;
}

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export class DonationsService {
  /**
   * List active donation categories
   */
  static async listCategories(db: DrizzleD1Database<typeof schema>) {
    try {
      const rows = await db
        .select()
        .from(donationCategories)
        .where(eq(donationCategories.status, "active"))
        .orderBy(donationCategories.sortOrder, donationCategories.id);

      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          name: parseJson(r.name, { en: "", bn: "" }),
          description: r.description ? parseJson(r.description, { en: "", bn: "" }) : null,
          status: r.status,
          sortOrder: r.sortOrder,
        }));
      }
    } catch {
      // ignore
    }
    return initialDonationCategories.map((c, i) => ({
      id: i + 1,
      ...c,
    }));
  }

  /**
   * Devotee creates an offline donation record
   */
  static async createDonation(
    db: DrizzleD1Database<typeof schema>,
    userId: string | null,
    data: DevoteeDonationCreateInput
  ) {
    if (data.amount < 10) {
      throw new Error("Minimum donation amount is BDT 10");
    }

    const ref = generateDonationRef();
    const now = Date.now();

    const result = await db
      .insert(donations)
      .values({
        ref,
        userId: userId || null,
        categoryId: data.categoryId,
        donorName: data.donorName.trim(),
        email: data.email?.trim() || null,
        phone: data.phone.trim(),
        amount: Math.round(data.amount),
        paymentMethod: data.paymentMethod,
        transactionReference: data.transactionReference?.trim() || null,
        message: data.message?.trim() || null,
        isAnonymous: Boolean(data.isAnonymous),
        status: "pending_verification",
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: donations.id });

    const insertedId = result[0]?.id;

    if (userId) {
      await AuditService.record(db, {
        userId,
        action: "create",
        entity: "donations",
        entityId: ref,
        details: { amount: data.amount, paymentMethod: data.paymentMethod },
      }).catch((err) => console.warn("Audit record error:", err));
    }

    return {
      success: true,
      id: insertedId,
      ref,
      amount: data.amount,
      status: "pending_verification",
      message: "Donation record submitted successfully. It will be marked confirmed upon verification.",
    };
  }

  /**
   * Admin verifies or rejects an offline donation
   */
  static async verifyDonation(
    db: DrizzleD1Database<typeof schema>,
    idOrRef: number | string,
    adminUserId: string,
    status: "confirmed" | "rejected",
    adminNote?: string
  ) {
    const now = Date.now();
    const condition =
      typeof idOrRef === "number" || /^\d+$/.test(String(idOrRef))
        ? eq(donations.id, Number(idOrRef))
        : eq(donations.ref, String(idOrRef));

    const existing = await db.select().from(donations).where(condition).get();
    if (!existing) {
      throw new Error("Donation record not found");
    }

    await db
      .update(donations)
      .set({
        status,
        handledBy: adminUserId,
        verifiedAt: now,
        adminNote: adminNote || null,
        updatedAt: now,
      })
      .where(condition)
      .run();

    let receiptNumber: string | null = null;

    if (status === "confirmed") {
      receiptNumber = generateReceiptNumber();
      try {
        await db
          .insert(donationReceipts)
          .values({
            donationId: existing.id,
            receiptNumber,
            issuedAt: now,
            createdAt: now,
          })
          .run();
      } catch {
        // If receipt already existed, retrieve it
        const r = await db
          .select()
          .from(donationReceipts)
          .where(eq(donationReceipts.donationId, existing.id))
          .get();
        receiptNumber = r?.receiptNumber || receiptNumber;
      }
    }

    await AuditService.record(db, {
      userId: adminUserId,
      action: "verify",
      entity: "donations",
      entityId: existing.ref,
      details: { status, receiptNumber, adminNote },
    }).catch((err) => console.warn("Audit record error:", err));

    return {
      success: true,
      status,
      receiptNumber,
    };
  }

  /**
   * List donations for a logged-in devotee with summary stats
   */
  static async listUserDonations(
    db: DrizzleD1Database<typeof schema>,
    userId: string,
    statusFilter?: string
  ) {
    const conditions = [eq(donations.userId, userId)];
    if (statusFilter && statusFilter !== "all") {
      conditions.push(eq(donations.status, statusFilter as any));
    }

    const rows = await db
      .select()
      .from(donations)
      .where(and(...conditions))
      .orderBy(desc(donations.createdAt));

    // Fetch receipts for confirmed rows
    const confirmedIds = rows
      .filter((r) => r.status === "confirmed")
      .map((r) => r.id);

    let receipts: any[] = [];
    if (confirmedIds.length > 0) {
      try {
        receipts = await db.select().from(donationReceipts).all();
      } catch {
        // ignore
      }
    }
    const receiptMap = new Map(receipts.map((r) => [r.donationId, r]));

    // Fetch categories
    let categories: any[] = [];
    try {
      categories = await db.select().from(donationCategories).all();
    } catch {
      // ignore
    }
    const catMap = new Map(categories.map((c) => [c.id, c]));

    // Compute stats over all user donations (regardless of current table filter)
    const allUserDonations = await db
      .select({
        status: donations.status,
        amount: donations.amount,
      })
      .from(donations)
      .where(eq(donations.userId, userId));

    let totalConfirmedCount = 0;
    let totalConfirmedAmount = 0;
    let totalPendingCount = 0;

    for (const d of allUserDonations) {
      if (d.status === "confirmed") {
        totalConfirmedCount++;
        totalConfirmedAmount += d.amount;
      } else if (d.status === "pending_verification") {
        totalPendingCount++;
      }
    }

    const items = rows.map((r) => {
      const cat = catMap.get(r.categoryId);
      const receipt = receiptMap.get(r.id);
      return {
        ...r,
        category: cat
          ? {
              id: cat.id,
              name: parseJson(cat.name, { en: "", bn: "" }),
              slug: cat.slug,
            }
          : { id: r.categoryId, name: { en: "General Donation", bn: "সাধারণ দান" }, slug: "general" },
        receipt: receipt
          ? {
              receiptNumber: receipt.receiptNumber,
              issuedAt: receipt.issuedAt,
            }
          : null,
      };
    });

    return {
      items,
      totalConfirmedCount,
      totalConfirmedAmount,
      totalPendingCount,
    };
  }

  /**
   * Retrieve single donation for devotee, enforcing user isolation
   */
  static async getDevoteeDonation(
    db: DrizzleD1Database<typeof schema>,
    refOrId: string | number,
    userId: string
  ) {
    let donationRow: any = null;

    if (typeof refOrId === "number" || /^\d+$/.test(String(refOrId))) {
      donationRow = await db
        .select()
        .from(donations)
        .where(and(eq(donations.id, Number(refOrId)), eq(donations.userId, userId)))
        .get();
    } else {
      donationRow = await db
        .select()
        .from(donations)
        .where(and(eq(donations.ref, String(refOrId)), eq(donations.userId, userId)))
        .get();
    }

    if (!donationRow) return null;

    let receiptRow: any = null;
    if (donationRow.status === "confirmed") {
      try {
        receiptRow = await db
          .select()
          .from(donationReceipts)
          .where(eq(donationReceipts.donationId, donationRow.id))
          .get();
      } catch {
        // ignore
      }
    }

    let categoryRow: any = null;
    try {
      categoryRow = await db
        .select()
        .from(donationCategories)
        .where(eq(donationCategories.id, donationRow.categoryId))
        .get();
    } catch {
      // ignore
    }

    return {
      ...donationRow,
      category: categoryRow
        ? {
            id: categoryRow.id,
            slug: categoryRow.slug,
            name: parseJson(categoryRow.name, { en: "", bn: "" }),
          }
        : { id: donationRow.categoryId, slug: "general", name: { en: "General Donation", bn: "সাধারণ দান" } },
      receipt: receiptRow
        ? {
            receiptNumber: receiptRow.receiptNumber,
            issuedAt: receiptRow.issuedAt,
          }
        : null,
    };
  }

  /**
   * Aggregates devotee dashboard statistics and upcoming bookings
   */
  static async getDevoteeDashboardStats(
    db: DrizzleD1Database<typeof schema>,
    userId: string
  ) {
    const todayStr = new Date().toISOString().slice(0, 10);

    // Bookings summary
    const userBookings = await db
      .select({
        id: pujaBookings.id,
        ref: pujaBookings.ref,
        pujaId: pujaBookings.pujaId,
        customPujaName: pujaBookings.customPujaName,
        preferredDate: pujaBookings.preferredDate,
        status: pujaBookings.status,
      })
      .from(pujaBookings)
      .where(eq(pujaBookings.userId, userId))
      .orderBy(pujaBookings.preferredDate);

    const totalBookings = userBookings.length;
    const upcoming = userBookings.filter(
      (b) => b.preferredDate >= todayStr && b.status !== "cancelled"
    );
    const upcomingBookings = upcoming.length;

    // Fetch meta for next 5 upcoming bookings
    const nextFive = upcoming.slice(0, 5);
    const upcomingBookingsList: any[] = [];

    for (const b of nextFive) {
      let meta: any = null;
      try {
        meta = await db
          .select()
          .from(devoteeBookingMeta)
          .where(eq(devoteeBookingMeta.bookingRef, b.ref))
          .get();
      } catch {
        // ignore
      }

      let pujaName = "Temple Puja";
      if (b.pujaId) {
        try {
          const p = await db.select().from(pujas).where(eq(pujas.id, b.pujaId)).get();
          if (p) {
            const parsedName = parseJson(p.name, { en: "Temple Puja", bn: "" });
            pujaName = parsedName.en || pujaName;
          }
        } catch {
          // ignore
        }
      } else if (b.customPujaName) {
        pujaName = b.customPujaName;
      }

      upcomingBookingsList.push({
        id: b.id,
        ref: b.ref,
        pujaName,
        bookingDate: b.preferredDate,
        timeSlot: meta?.timeSlot || "Scheduled Aarti",
        status: b.status,
      });
    }

    // Donations summary
    const userDonations = await db
      .select({
        status: donations.status,
        amount: donations.amount,
      })
      .from(donations)
      .where(eq(donations.userId, userId));

    let totalDonations = 0;
    let totalDonationAmount = 0;

    for (const d of userDonations) {
      if (d.status === "confirmed") {
        totalDonations++;
        totalDonationAmount += d.amount;
      }
    }

    return {
      totalBookings,
      upcomingBookings,
      totalDonations,
      totalDonationAmount,
      upcomingBookingsList,
    };
  }
}
