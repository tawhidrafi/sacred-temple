import { getDb } from "../../../db";
import { BookingsService } from "../../../services/bookings";
import { requireSession } from "../../../utils/session";
import { createApiError } from "../../../utils/errors";

export default defineEventHandler(async (event) => {
  const idOrRef = getRouterParam(event, "id");
  if (!idOrRef) {
    throw createApiError(400, "BAD_REQUEST", "Booking ID or Reference is required");
  }

  const { user } = await requireSession(event);
  const db = getDb(event);

  const booking = await BookingsService.getDevoteeBooking(db, idOrRef, user.id);
  if (!booking) {
    throw createApiError(404, "NOT_FOUND", "Booking not found");
  }

  return { booking };
});
