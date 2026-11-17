import { and, asc, eq, like, or, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { createError } from "h3";
import * as schema from "../db/schema";
import { pujas } from "../db/schema/pujas";
import { AuditService } from "./audit";
import { purgeCache } from "../utils/cache";
import {
  initialPujas,
  initialAddons,
  initialTimeSlots,
} from "../../shared/constants/initial-data";
import type {
  CreatePujaInput,
  UpdatePujaInput,
  ListPujasQuery,
  ReorderPujasInput,
} from "../../shared/schemas/pujas";

export interface FormattedPujaItem {
  id: number;
  slug: string;
  name: { en: string; bn: string };
  description: { en: string; bn: string };
  offered: { en: string; bn: string } | null;
  priceBdt: number;
  duration: string | null;
  bookable: boolean;
  sortOrder: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export class PujasService {
  /**
   * List pujas with optional pagination, search, bookable, and active filtering.
   */
  static async list(db: DrizzleD1Database<typeof schema>, query?: ListPujasQuery) {
    const page = query?.page || 1;
    const pageSize = Math.min(query?.pageSize || 50, 100);
    const offset = (page - 1) * pageSize;

    const conditions = [];

    if (query?.active !== undefined) {
      conditions.push(eq(pujas.active, query.active));
    }

    if (query?.bookable !== undefined) {
      conditions.push(eq(pujas.bookable, query.bookable));
    }

    if (query?.search && query.search.trim()) {
      const q = `%${query.search.trim()}%`;
      conditions.push(
        or(
          like(pujas.name, q),
          like(pujas.slug, q),
          like(pujas.description, q),
          like(pujas.offered, q)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(pujas)
        .where(whereClause)
        .orderBy(asc(pujas.sortOrder), asc(pujas.id))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(pujas)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count || 0);

    return {
      items: items.map(this.formatRow),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get single puja by integer ID.
   */
  static async getById(db: DrizzleD1Database<typeof schema>, id: number): Promise<FormattedPujaItem | null> {
    const rows = await db.select().from(pujas).where(eq(pujas.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.formatRow(row);
  }

  /**
   * Get single puja by slug.
   */
  static async getBySlug(db: DrizzleD1Database<typeof schema>, slug: string): Promise<FormattedPujaItem | null> {
    const rows = await db.select().from(pujas).where(eq(pujas.slug, slug)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.formatRow(row);
  }

  /**
   * Create new puja offering, invalidate edge cache, and record audit log.
   */
  static async create(
    db: DrizzleD1Database<typeof schema>,
    input: CreatePujaInput,
    userId?: string | null
  ): Promise<FormattedPujaItem> {
    // Check for unique slug
    const existing = await this.getBySlug(db, input.slug);
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: `A puja with slug '${input.slug}' already exists`,
      });
    }

    const now = Date.now();
    const [inserted] = await db
      .insert(pujas)
      .values({
        slug: input.slug,
        name: JSON.stringify(input.name),
        description: JSON.stringify(input.description),
        offered: input.offered ? JSON.stringify(input.offered) : null,
        priceBdt: input.priceBdt ?? 0,
        duration: input.duration || null,
        bookable: input.bookable ?? true,
        sortOrder: input.sortOrder ?? 0,
        active: input.active ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!inserted) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to insert puja",
      });
    }

    // Invalidate edge cache
    await purgeCache(["pujas"]).catch((err) =>
      console.warn("Pujas cache purge error:", err)
    );

    // Audit log
    await AuditService.record(db, {
      userId,
      action: "create",
      entity: "pujas",
      entityId: String(inserted.id),
      details: {
        slug: input.slug,
        name: input.name.en,
        priceBdt: input.priceBdt,
      },
    }).catch((err) => console.warn("Audit record error:", err));

    return this.formatRow(inserted);
  }

  /**
   * Update puja by ID, invalidate edge cache, and record audit log.
   */
  static async update(
    db: DrizzleD1Database<typeof schema>,
    input: UpdatePujaInput,
    userId?: string | null
  ): Promise<FormattedPujaItem> {
    const existing = await this.getById(db, input.id);
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: `Puja with ID ${input.id} not found`,
      });
    }

    // Check slug uniqueness if changed
    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await this.getBySlug(db, input.slug);
      if (slugConflict && slugConflict.id !== input.id) {
        throw createError({
          statusCode: 409,
          statusMessage: `A puja with slug '${input.slug}' already exists`,
        });
      }
    }

    const now = Date.now();
    const updateData: Partial<typeof pujas.$inferInsert> = {
      updatedAt: now,
    };

    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.name !== undefined) updateData.name = JSON.stringify(input.name);
    if (input.description !== undefined)
      updateData.description = JSON.stringify(input.description);
    if (input.offered !== undefined)
      updateData.offered = input.offered ? JSON.stringify(input.offered) : null;
    if (input.priceBdt !== undefined) updateData.priceBdt = input.priceBdt;
    if (input.duration !== undefined) updateData.duration = input.duration || null;
    if (input.bookable !== undefined) updateData.bookable = input.bookable;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.active !== undefined) updateData.active = input.active;

    const [updated] = await db
      .update(pujas)
      .set(updateData)
      .where(eq(pujas.id, input.id))
      .returning();

    if (!updated) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update puja ${input.id}`,
      });
    }

    // Invalidate edge cache
    await purgeCache(["pujas"]).catch((err) =>
      console.warn("Pujas cache purge error:", err)
    );

    // Audit log
    await AuditService.record(db, {
      userId,
      action: "update",
      entity: "pujas",
      entityId: String(input.id),
      details: {
        slug: input.slug ?? existing.slug,
        name: input.name?.en ?? existing.name.en,
        priceBdt: input.priceBdt ?? existing.priceBdt,
        active: input.active ?? existing.active,
        bookable: input.bookable ?? existing.bookable,
      },
    }).catch((err) => console.warn("Audit record error:", err));

    return this.formatRow(updated);
  }

  /**
   * Reorder pujas in batch, invalidate cache, and record audit log.
   */
  static async reorder(
    db: DrizzleD1Database<typeof schema>,
    input: ReorderPujasInput,
    userId?: string | null
  ) {
    const now = Date.now();
    for (const item of input.items) {
      await db
        .update(pujas)
        .set({ sortOrder: item.sortOrder, updatedAt: now })
        .where(eq(pujas.id, item.id));
    }

    // Invalidate edge cache
    await purgeCache(["pujas"]).catch((err) =>
      console.warn("Pujas cache purge error:", err)
    );

    // Audit log
    await AuditService.record(db, {
      userId,
      action: "reorder",
      entity: "pujas",
      entityId: "batch",
      details: { count: input.items.length },
    }).catch((err) => console.warn("Audit record error:", err));

    return true;
  }

  /**
   * Delete puja by ID, invalidate cache, and record audit log.
   */
  static async delete(
    db: DrizzleD1Database<typeof schema>,
    id: number,
    userId?: string | null
  ) {
    const existing = await this.getById(db, id);
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: `Puja with ID ${id} not found`,
      });
    }

    const [deleted] = await db.delete(pujas).where(eq(pujas.id, id)).returning();

    // Invalidate edge cache
    await purgeCache(["pujas"]).catch((err) =>
      console.warn("Pujas cache purge error:", err)
    );

    // Audit log
    await AuditService.record(db, {
      userId,
      action: "delete",
      entity: "pujas",
      entityId: String(id),
      details: {
        name: existing.name.en,
        slug: existing.slug,
      },
    }).catch((err) => console.warn("Audit record error:", err));

    return !!deleted;
  }

  /**
   * Public cached list: active pujas only, sorted by sortOrder asc.
   */
  static async getPublicList(db: DrizzleD1Database<typeof schema>): Promise<FormattedPujaItem[]> {
    const rows = await db
      .select()
      .from(pujas)
      .where(eq(pujas.active, true))
      .orderBy(asc(pujas.sortOrder), asc(pujas.id));

    return rows.map(this.formatRow);
  }

  /**
   * Public single puja by slug: active only.
   */
  static async getPublicBySlug(
    db: DrizzleD1Database<typeof schema>,
    slug: string
  ): Promise<FormattedPujaItem | null> {
    const rows = await db
      .select()
      .from(pujas)
      .where(and(eq(pujas.slug, slug), eq(pujas.active, true)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.formatRow(row);
  }

  /**
   * Public list of active pujas for devotee browsing and booking.
   */
  static async listPublicPujas(db: DrizzleD1Database<typeof schema>) {
    try {
      const rows = await db
        .select()
        .from(pujas)
        .where(and(eq(pujas.active, true), eq(pujas.bookable, true)))
        .orderBy(asc(pujas.sortOrder), asc(pujas.id));

      if (rows && rows.length > 0) {
        return rows.map((r) => {
          const formatted = this.formatRow(r);
          const meta = initialPujas.find((ip) => ip.slug === r.slug);
          return {
            ...formatted,
            shortDescription: meta?.shortDescription || formatted.description,
            significance: meta?.significance,
            requirements: meta?.requirements,
            image: meta?.image || "/images/deities/kali.webp",
          };
        });
      }
    } catch {
      // Fall back to initial seed data
    }
    return initialPujas;
  }

  /**
   * Public detail of a puja with associated addons and time slots.
   */
  static async getPublicPujaBySlug(db: DrizzleD1Database<typeof schema>, slug: string) {
    let pujaItem: any = null;

    try {
      const rows = await db
        .select()
        .from(pujas)
        .where(and(eq(pujas.slug, slug), eq(pujas.active, true)))
        .limit(1);

      if (rows[0]) {
        const formatted = this.formatRow(rows[0]);
        const meta = initialPujas.find((ip) => ip.slug === slug);
        pujaItem = {
          ...formatted,
          shortDescription: meta?.shortDescription || formatted.description,
          significance: meta?.significance,
          requirements: meta?.requirements,
          image: meta?.image || "/images/deities/kali.webp",
        };
      }
    } catch {
      // ignore
    }

    if (!pujaItem) {
      pujaItem = initialPujas.find((ip) => ip.slug === slug) || null;
    }

    if (!pujaItem) return null;

    // Fetch addons
    let addons: any[] = [];
    try {
      const addonRows = await db
        .select()
        .from(schema.pujaAddons)
        .where(eq(schema.pujaAddons.status, "active"));
      if (addonRows && addonRows.length > 0) {
        addons = addonRows.map((a) => ({
          id: `addon-${a.id}`,
          name: parseJson(a.name, { en: "", bn: "" }),
          description: a.description ? parseJson(a.description, { en: "", bn: "" }) : null,
          priceBdt: a.price,
        }));
      }
    } catch {
      // ignore
    }
    if (addons.length === 0) {
      addons = initialAddons;
    }

    // Fetch time slots
    let timeSlots: any[] = [];
    try {
      const slotRows = await db
        .select()
        .from(schema.pujaTimeSlots)
        .where(eq(schema.pujaTimeSlots.status, "active"));
      if (slotRows && slotRows.length > 0) {
        timeSlots = slotRows.map((s) => ({
          id: `slot-${s.id}`,
          name: parseJson(s.name || "{}", { en: `${s.startTime} - ${s.endTime}`, bn: "" }),
          startTime: s.startTime,
          endTime: s.endTime,
          capacity: s.capacity,
        }));
      }
    } catch {
      // ignore
    }
    if (timeSlots.length === 0) {
      timeSlots = initialTimeSlots;
    }

    return {
      puja: pujaItem,
      addons,
      timeSlots,
    };
  }

  private static formatRow(row: typeof pujas.$inferSelect): FormattedPujaItem {
    return {
      ...row,
      name: parseJson(row.name, { en: "", bn: "" }),
      description: parseJson(row.description, { en: "", bn: "" }),
      offered: row.offered ? parseJson(row.offered, { en: "", bn: "" }) : null,
    };
  }
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
