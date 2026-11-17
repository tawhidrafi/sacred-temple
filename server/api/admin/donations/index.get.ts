import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { donations, donationCategories, donationReceipts } from "../../../db/schema/donations";
import { requireRole } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  // Requires staff or admin role
  await requireRole(event, ["admin", "editor"]);
  const db = getDb(event);

  const rows = await db
    .select()
    .from(donations)
    .orderBy(desc(donations.createdAt))
    .limit(100);

  const categories = await db.select().from(donationCategories).all();
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const receipts = await db.select().from(donationReceipts).all();
  const receiptMap = new Map(receipts.map((r) => [r.donationId, r]));

  const items = rows.map((r) => ({
    ...r,
    category: catMap.get(r.categoryId) || null,
    receipt: receiptMap.get(r.id) || null,
  }));

  return { items };
});
