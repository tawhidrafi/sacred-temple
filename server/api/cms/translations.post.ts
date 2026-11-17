import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../../db/schema";
import { defaultTranslations, type SiteTranslations } from "../../../shared/constants/translations";
import { requireRole } from "../../utils/session";
import { AuditService } from "../../services/audit";

export default defineEventHandler(async (event) => {
  // Only admin and editor can modify translations
  const sessionUser = await requireRole(event, ["admin", "editor"]);

  const body = await readBody(event);
  const env = event.context.cloudflare?.env as { DB: any } | undefined;
  if (!env?.DB) {
    throw createError({ statusCode: 500, message: "Cloudflare D1 Database binding not available" });
  }

  const db = drizzle(env.DB, { schema });
  const action = body?.action;
  const now = new Date().toISOString();

  // Reset to default translations
  if (action === "reset") {
    await db
      .insert(schema.homeCms)
      .values({
        key: "site_translations",
        data: JSON.stringify(defaultTranslations),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.homeCms.key,
        set: {
          data: JSON.stringify(defaultTranslations),
          updatedAt: now,
        },
      });

    await AuditService.record(db as any, {
      userId: sessionUser.user.id,
      action: "update",
      entity: "site_translations",
      entityId: "site_translations",
      details: { action: "reset_to_defaults" },
    }).catch((err) => console.warn("Audit record error:", err));

    return { success: true, translations: defaultTranslations };
  }

  // Update translations
  const incomingTranslations = (body?.translations || body?.data || body) as Partial<SiteTranslations>;
  if (!incomingTranslations || typeof incomingTranslations !== "object") {
    throw createError({ statusCode: 400, message: "Invalid translations payload" });
  }

  // Fetch existing
  const existing = await db
    .select()
    .from(schema.homeCms)
    .where(eq(schema.homeCms.key, "site_translations"))
    .limit(1);

  let merged: SiteTranslations = { ...defaultTranslations };
  const existingRecord = existing[0];
  if (existingRecord?.data) {
    try {
      merged = { ...merged, ...JSON.parse(existingRecord.data) };
    } catch (e) {
      console.warn("Failed to parse existing site_translations JSON:", e);
    }
  }

  // Deep merge incoming keys
  for (const [key, val] of Object.entries(incomingTranslations)) {
    if (val && typeof val === "object" && "en" in val && "bn" in val) {
      merged[key] = {
        en: String(val.en ?? ""),
        bn: String(val.bn ?? ""),
        category: (val.category || defaultTranslations[key]?.category || "common") as any,
        label: val.label || defaultTranslations[key]?.label || key,
      };
    }
  }

  await db
    .insert(schema.homeCms)
    .values({
      key: "site_translations",
      data: JSON.stringify(merged),
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.homeCms.key,
      set: {
        data: JSON.stringify(merged),
        updatedAt: now,
      },
    });

  await AuditService.record(db as any, {
    userId: sessionUser.user.id,
    action: "update",
    entity: "site_translations",
    entityId: "site_translations",
    details: { updatedKeysCount: Object.keys(incomingTranslations).length },
  }).catch((err) => console.warn("Audit record error:", err));

  return { success: true, translations: merged };
});
