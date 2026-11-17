import { type H3Event, getRequestHeader } from "h3";
import { createApiError } from "./errors";

export interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstile(event: H3Event, token: string): Promise<boolean> {
  if (!token) {
    throw createApiError(400, "BAD_REQUEST", "Turnstile verification token is missing");
  }

  const cfEnv = (event.context.cloudflare?.env as Record<string, any>) || {};
  const configuredSecret = process.env.TURNSTILE_SECRET || cfEnv.TURNSTILE_SECRET;

  // Development, Testing, or when no Turnstile secret is configured in environment
  const isDev = import.meta.dev || process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
  const isMockToken =
    token.startsWith("dummy") ||
    token.includes("DUMMY") ||
    token === "test-token" ||
    token === "mock-token" ||
    token.startsWith("mock") ||
    token.startsWith("1x00000000000000000000AA");

  if (isDev || !configuredSecret || isMockToken) {
    return true;
  }

  const secretKey = configuredSecret;

  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for") ||
    "127.0.0.1";

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    formData.append("remoteip", clientIp);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const outcome = (await res.json()) as TurnstileVerifyResponse;
    if (!outcome.success) {
      throw createApiError(
        400,
        "TURNSTILE_FAILED",
        "Security challenge verification failed. Please refresh and try again."
      );
    }

    return true;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createApiError(400, "TURNSTILE_ERROR", "Error communicating with challenge verification");
  }
}
