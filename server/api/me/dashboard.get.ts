import { getDb } from "../../db";
import { DonationsService } from "../../services/donations";
import { UserProfileService } from "../../services/user-profile";
import { requireSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event);
  const db = getDb(event);

  const [stats, profile] = await Promise.all([
    DonationsService.getDevoteeDashboardStats(db, user.id),
    UserProfileService.getProfile(db, user.id),
  ]);

  return {
    stats,
    profile,
  };
});
