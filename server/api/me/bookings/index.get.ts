import { getDb } from "../../../db";
import { BookingsService } from "../../../services/bookings";
import { requireSession } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  // Requires authentication
  const { user } = await requireSession(event);
  const db = getDb(event);

  const query = getQuery(event);
  const statusFilter = typeof query.status === "string" ? query.status : undefined;

  // Filter strictly in SQL query by user.id
  const bookings = await BookingsService.listUserBookingsWithMeta(db, user.id, statusFilter);
  return { bookings };
});
