import { SignJWT, errors, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "session";

// Sliding window: full duration is reset (inside REISSUE_THRESHOLD_SECONDS
// of expiry) on every valid request in middleware.ts, so this is really
// "max time inactive before logout," not "max session length."
export const SESSION_DURATION = "45d";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 45;

// Only re-sign/re-set the cookie once a session is within this many
// seconds of expiring, so an active user isn't getting a fresh
// Set-Cookie header on every single request.
export const REISSUE_THRESHOLD_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
  steamId: string;
}

// Distinguishes *why* a token didn't verify. Middleware currently treats
// "expired" and "invalid" the same (clear the cookie), but callers that
// want to show "your session expired, please log back in" vs a generic
// login prompt now have the information to do that.
export type SessionResult =
  | ({ status: "valid"; expiresAt: number } & SessionPayload)
  | { status: "expired" }
  | { status: "invalid" };

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ steamId: payload.steamId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionResult> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.steamId !== "string" || typeof payload.exp !== "number") {
      return { status: "invalid" };
    }
    return { status: "valid", steamId: payload.steamId, expiresAt: payload.exp };
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      return { status: "expired" };
    }
    return { status: "invalid" };
  }
}
