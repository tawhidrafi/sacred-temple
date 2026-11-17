import { getDb } from "../../db";
import { UserProfileService } from "../../services/user-profile";
import { requireSession } from "../../utils/session";
import { createApiError } from "../../utils/errors";
import { devoteeProfileUpdateSchema } from "../../../shared/schemas/user-portal";

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event);
  const db = getDb(event);

  const rawBody = await readBody(event);
  const parsed = devoteeProfileUpdateSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw createApiError(400, "VALIDATION_FAILED", "Invalid profile update data", parsed.error.format());
  }

  try {
    const profile = await UserProfileService.updateProfile(db, user.id, parsed.data);
    return { success: true, profile };
  } catch (err: any) {
    throw createApiError(500, "INTERNAL_SERVER_ERROR", err?.message || "Failed to update devotee profile");
  }
});
