import { getAuth } from "../../utils/auth";
import { requireSession } from "../../utils/session";
import { createApiError } from "../../utils/errors";
import { devoteeChangePasswordSchema } from "../../../shared/schemas/user-portal";

export default defineEventHandler(async (event) => {
  await requireSession(event);
  const rawBody = await readBody(event);
  const parsed = devoteeChangePasswordSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw createApiError(400, "VALIDATION_FAILED", "Invalid password data", parsed.error.format());
  }

  const auth = getAuth(event);

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: false,
      },
      headers: event.headers,
    });

    return { success: true, message: "Password updated successfully" };
  } catch (err: any) {
    throw createApiError(400, "PASSWORD_CHANGE_FAILED", err?.message || "Current password is incorrect");
  }
});
