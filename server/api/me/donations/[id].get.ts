import { getDb } from "../../../db";
import { DonationsService } from "../../../services/donations";
import { requireSession } from "../../../utils/session";
import { createApiError } from "../../../utils/errors";

export default defineEventHandler(async (event) => {
  const idOrRef = getRouterParam(event, "id");
  if (!idOrRef) {
    throw createApiError(400, "BAD_REQUEST", "Donation ID or Reference is required");
  }

  const { user } = await requireSession(event);
  const db = getDb(event);

  const donation = await DonationsService.getDevoteeDonation(db, idOrRef, user.id);
  if (!donation) {
    throw createApiError(404, "NOT_FOUND", "Donation record not found");
  }

  return { donation };
});
