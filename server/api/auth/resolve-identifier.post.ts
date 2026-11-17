import { getDb } from "../../db";
import { user } from "../../db/schema";
import { eq, or } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const identifier = typeof body?.identifier === "string" ? body.identifier.trim() : "";
  if (!identifier) return { email: "" };

  // If it already looks like an email, return as-is
  if (identifier.includes("@")) {
    return { email: identifier.toLowerCase() };
  }

  // Otherwise, query by devotee mobile phone
  const db = getDb(event);
  const cleanPhone = identifier.replace(/^\+880/, "0");

  try {
    const matched = await db
      .select({ email: user.email })
      .from(user)
      .where(or(eq(user.phone, identifier), eq(user.phone, cleanPhone)))
      .get();

    return { email: matched?.email || identifier };
  } catch {
    return { email: identifier };
  }
});
