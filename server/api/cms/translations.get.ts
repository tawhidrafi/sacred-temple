import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "../../db/schema";
import { defaultTranslations, type SiteTranslations } from "../../../shared/constants/translations";

export default defineEventHandler(async (event) => {
  // Edge & browser caching for high performance
  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");

  const env = event.context.cloudflare?.env as { DB: any } | undefined;
  if (!env?.DB) {
    return {
      success: true,
      translations: defaultTranslations,
    };
  }

  const db = drizzle(env.DB, { schema });
  try {
    const records = await db
      .select()
      .from(schema.homeCms)
      .where(eq(schema.homeCms.key, "site_translations"))
      .limit(1);

    const first = records[0];
    if (first?.data) {
      try {
        const parsed = JSON.parse(first.data);
        const merged: SiteTranslations = {
          ...defaultTranslations,
          ...parsed,
        };
        return {
          success: true,
          translations: merged,
        };
      } catch (parseErr) {
        console.warn("Failed to parse site_translations JSON:", parseErr);
      }
    }

    // Seed default translations in D1 if not yet present
    await db
      .insert(schema.homeCms)
      .values({
        key: "site_translations",
        data: JSON.stringify(defaultTranslations),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoNothing();

    return {
      success: true,
      translations: defaultTranslations,
    };
  } catch (err) {
    console.error("Failed to load CMS translations data:", err);
    return {
      success: true,
      translations: defaultTranslations,
    };
  }
});
