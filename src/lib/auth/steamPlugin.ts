import { createAuthEndpoint } from "@better-auth/core/api";
import { setSessionCookie } from "better-auth/cookies";
import { getSessionFromCtx } from "better-auth/api";
import type { User } from "better-auth";
import * as z from "zod";

type SteamUser = User & {
  steamId?: string;
  steamPersonaName?: string;
  steamAvatarUrl?: string;
};

const steamSignInBody = z.object({
  steamId: z.string(),
  personaName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

// Steam speaks OpenID 2.0, not OAuth2/OIDC, so it can't be a Better Auth
// "social provider" - src/lib/steam/openid.ts does the real handshake
// verification untouched, then the callback route calls this endpoint
// (via auth.api.signInSteam) for an already-verified steamId. Steam can
// only ever attach to an account that already exists (created via email
// magic-link) or sign back into one that previously attached it - it can
// never originate a new account on its own.
export function steamSessionPlugin() {
  return {
    id: "steam-session",
    endpoints: {
      signInSteam: createAuthEndpoint(
        "/sign-in/steam",
        { method: "POST", body: steamSignInBody },
        async (ctx) => {
          const { steamId, personaName, avatarUrl } = ctx.body;
          const currentSession = await getSessionFromCtx(ctx)

          const existingUser = await ctx.context.adapter.findOne<SteamUser>({
            model: "user",
            where: [{ field: "steamId", value: steamId }]
          })

          if (existingUser) {
            let user = existingUser;
            if (personaName || avatarUrl) {
              user = await ctx.context.internalAdapter.updateUser(user.id, {
                ...(personaName ? { steamPersonaName: personaName } : {}),
                ...(avatarUrl ? { steamAvatarUrl: avatarUrl } : {})
              });
            }
            const session = await ctx.context.internalAdapter.createSession(user.id);
            await setSessionCookie(ctx, { session, user });
            return ctx.json({ status: "signed-in" });
          }

          if (currentSession) {
            await ctx.context.internalAdapter.updateUser(currentSession.user.id, {
              steamId,
              ...(personaName ? { steamPersonaName: personaName } : {}),
              ...(avatarUrl ? { steamAvatarUrl: avatarUrl } : {}),
            });
            return ctx.json({ status: "linked" });
          }

          return ctx.json({ status: "no-account" });
        },
      ),

      disconnectSteam: createAuthEndpoint(
        "/disconnect/steam",
        { method: "POST" },
        async (ctx) => {
          const currentSession = await getSessionFromCtx(ctx);
          if (!currentSession) {
            throw ctx.error("UNAUTHORIZED");
          }

          await ctx.context.internalAdapter.updateUser(currentSession.user.id, {
            steamId: null,
            steamPersonaName: null,
            steamAvatarUrl: null,
          });

          return ctx.json({ status: "disconnected" });
        },
      ),
    },
  };
}