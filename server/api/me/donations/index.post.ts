import { getDb } from "../../../db";
import { DonationsService } from "../../../services/donations";
import { requireSession } from "../../../utils/session";
import { createApiError } from "../../../utils/errors";
import { devoteeDonationCreateSchema } from "../../../../shared/schemas/user-portal";

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event);
  const db = getDb(event);

  const rawBody = await readBody(event);
  const parsed = devoteeDonationCreateSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw createApiError(400, "VALIDATION_FAILED", "Invalid donation submission", parsed.error.flatten().fieldErrors);
  }

  try {
    const outcome = await DonationsService.createDonation(db, user.id, parsed.data);
    return outcome;
  } catch (err: any) {
    throw createApiError(400, "DONATION_CREATION_FAILED", err?.message || "Failed to create donation record");
  }
});
