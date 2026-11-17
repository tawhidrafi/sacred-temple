import { getDb } from "../../../db";
import { DonationsService } from "../../../services/donations";
import { requireRole } from "../../../utils/session";
import { createApiError } from "../../../utils/errors";

export default defineEventHandler(async (event) => {
  const { user } = await requireRole(event, ["admin", "editor"]);
  const idOrRef = getRouterParam(event, "id");
  if (!idOrRef) {
    throw createApiError(400, "BAD_REQUEST", "Donation ID is required");
  }

  const body = await readBody(event);
  const status = body?.status;
  if (status !== "confirmed" && status !== "rejected") {
    throw createApiError(400, "BAD_REQUEST", "Status must be 'confirmed' or 'rejected'");
  }

  const db = getDb(event);

  try {
    const outcome = await DonationsService.verifyDonation(
      db,
      idOrRef,
      user.id,
      status,
      body?.adminNote
    );
    return outcome;
  } catch (err: any) {
    throw createApiError(400, "VERIFICATION_FAILED", err?.message || "Failed to verify donation");
  }
});
