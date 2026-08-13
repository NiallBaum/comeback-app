import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { magicLink } from "better-auth/plugins/magic-link";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { getMongoClient } from "@/lib/db/mongodb";
import { steamSessionPlugin } from "@/lib/auth/steamPlugin";

const client = await getMongoClient();

// Lazy, not module-scope - Resend's constructor throws immediately if
// RESEND_API_KEY is unset, which would break every auth path (including
// Steam, which never touches email) just from importing this module.
function getResendClient(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

export const auth = betterAuth({
  database: mongodbAdapter(client.db(), { client }),
  // Steam/Riot/Battle.net never supply a per-user OAuth token we'd act on -
  // we already call each platform's API with our own server-side key, so
  // they're just verified identifiers on the account, not linked OAuth
  // accounts in Better Auth's sense.
  user: {
    additionalFields: {
      steamId: { type: "string", required: false },
      steamPersonaName: { type: "string", required: false },
      steamAvatarUrl: { type: "string", required: false },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await getResendClient().emails.send({
          // TODO: swap for a verified sending domain before going live -
          // resend.dev only delivers to the Resend account's own inbox.
          from: "Comeback <onboarding@resend.dev>",
          to: email,
          subject: "Sign in to Comeback",
          html: `<p>Click below to sign in to Comeback:</p><p><a href="${url}">${url}</a></p><p>This link expires in 5 minutes.</p>`,
        });
      },
    }),
    steamSessionPlugin(),
    nextCookies(),
  ],
});
