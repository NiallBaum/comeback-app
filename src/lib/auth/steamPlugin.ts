import { createAuthEndpoint } from "@better-auth/core/api";
import { setSessionCookie } from "better-auth/cookies";
import type { User } from "better-auth";
import * as z from "zod";

type SteamUser = User & {
  steamId?: string;
  steamPersonaName?: string;
  steamAvatarUrl?: string;
};

// Steam OpenID gives no email at all (a hard platform limit) - Better
// Auth's core user schema requires one, so a synthetic, obviously-fake
// placeholder satisfies it without pretending to be a real contact
// address. Never emailed to, never shown to the user.
function syntheticSteamEmail(steamId: string): string {
  return `steam-${steamId}@users.comeback.internal`;
}

const steamSignInBody = z.object({
  steamId: z.string(),
  personaName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

// Steam speaks OpenID 2.0, not OAuth2/OIDC, so it can't be a Better Auth
// "social provider" - src/lib/steam/openid.ts does the real handshake
// verification untouched, then the callback route calls this endpoint
// (via auth.api.signInSteam) purely to find-or-create the account and
// mint a real session for an already-verified steamId.
export function steamSessionPlugin() {
  return {
    id: "steam-session",
    endpoints: {
      signInSteam: createAuthEndpoint(
        "/sign-in/steam",
        { method: "POST", body: steamSignInBody },
        async (ctx) => {
          const { steamId, personaName, avatarUrl } = ctx.body;

          let user = await ctx.context.adapter.findOne<SteamUser>({
            model: "user",
            where: [{ field: "steamId", value: steamId }],
          });

          if (!user) {
            user = await ctx.context.internalAdapter.createUser({
              email: syntheticSteamEmail(steamId),
              emailVerified: false,
              name: personaName || `Steam ${steamId}`,
              steamId,
              steamPersonaName: personaName,
              steamAvatarUrl: avatarUrl,
            });
          } else if (personaName || avatarUrl) {
            // Keep persona/avatar fresh on every login, same as the old
            // upsertUserFromSteamLogin behaviour it replaces.
            user = await ctx.context.internalAdapter.updateUser(user.id, {
              ...(personaName ? { steamPersonaName: personaName } : {}),
              ...(avatarUrl ? { steamAvatarUrl: avatarUrl } : {}),
            });
          }

          const session = await ctx.context.internalAdapter.createSession(user.id);
          await setSessionCookie(ctx, { session, user });

          return ctx.json({ success: true });
        },
      ),
    },
  };
}