import { getDb } from "../../../db";
import { PujasService } from "../../../services/pujas";
import { createApiError } from "../../../utils/errors";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createApiError(400, "BAD_REQUEST", "Puja slug is required");
  }

  const db = getDb(event);
  const result = await PujasService.getPublicPujaBySlug(db, slug);

  if (!result) {
    throw createApiError(404, "NOT_FOUND", `Puja '${slug}' not found`);
  }

  return result;
});
