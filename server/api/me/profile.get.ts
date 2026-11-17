import { getDb } from "../../db";
import { UserProfileService } from "../../services/user-profile";
import { requireSession } from "../../utils/session";
import { createApiError } from "../../utils/errors";

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event);
  const db = getDb(event);

  const profile = await UserProfileService.getProfile(db, user.id);
  if (!profile) {
    throw createApiError(404, "NOT_FOUND", "Devotee profile not found");
  }

  return { profile };
});
