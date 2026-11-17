import { getDb } from "../../../db";
import { BookingsService } from "../../../services/bookings";
import { createApiError } from "../../../utils/errors";

export default defineEventHandler(async (event) => {
  const queryParam = getRouterParam(event, "ref");
  if (!queryParam) {
    throw createApiError(400, "BAD_REQUEST", "Booking reference code or mobile phone number is required");
  }

  const db = getDb(event);
  const result = await BookingsService.getByRefOrPhone(db, queryParam);
  if (!result.booking) {
    throw createApiError(404, "NOT_FOUND", `No booking found for '${queryParam}'`);
  }

  return {
    ...result.booking,
    items: result.items,
  };
});
