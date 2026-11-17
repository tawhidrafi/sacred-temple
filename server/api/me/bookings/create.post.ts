import { getDb } from "../../../db";
import { BookingsService } from "../../../services/bookings";
import { requireSession } from "../../../utils/session";
import { createApiError } from "../../../utils/errors";
import { devoteePujaBookingCreateSchema } from "../../../../shared/schemas/user-portal";

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event);
  const db = getDb(event);

  const rawBody = await readBody(event);
  const parsed = devoteePujaBookingCreateSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw createApiError(400, "VALIDATION_FAILED", "Invalid puja booking details", parsed.error.flatten().fieldErrors);
  }

  try {
    const outcome = await BookingsService.createDevoteeBooking(db, user.id, parsed.data);
    return outcome;
  } catch (err: any) {
    throw createApiError(400, "BOOKING_CREATION_FAILED", err?.message || "Could not complete puja booking");
  }
});
