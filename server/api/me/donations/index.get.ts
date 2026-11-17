import { getDb } from "../../../db";
import { DonationsService } from "../../../services/donations";
import { requireSession } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event);
  const db = getDb(event);

  const query = getQuery(event);
  const statusFilter = typeof query.status === "string" ? query.status : undefined;

  const result = await DonationsService.listUserDonations(db, user.id, statusFilter);
  return result;
});
