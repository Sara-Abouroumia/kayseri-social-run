import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema/auth";
import { redeemPendingAdminInviteAfterEmailVerification } from "@/lib/platform-admin-invite";
import { sendTransactionalEmail } from "@/lib/send-email";
import {
  getAuthSecret,
  getExtraTrustedOrigins,
  getSiteUrl,
} from "@/lib/site-url";

const baseURL = getSiteUrl();
const extraTrustedOrigins = getExtraTrustedOrigins();
const secret = getAuthSecret();

export const auth = betterAuth({
  ...(secret ? { secret } : {}),

  baseURL,

  ...(extraTrustedOrigins.length > 0
    ? { trustedOrigins: extraTrustedOrigins }
    : {}),

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendTransactionalEmail({
        to: user.email,
        subject: "Verify your email — Kayseri Social Run",
        text: `Hi${user.name ? ` ${user.name}` : ""},

Please verify your email address by opening this link (valid for a limited time):

${url}

If you did not create an account, you can ignore this message.

— Kayseri Social Run
${baseURL}
`,
        html: `<p>Please verify your email address:</p><p><a href="${url}">Verify email</a></p>`,
      });
    },
    afterEmailVerification: async (verifiedUser) => {
      await redeemPendingAdminInviteAfterEmailVerification(
        verifiedUser.id,
        verifiedUser.email,
      );
    },
  },
});
