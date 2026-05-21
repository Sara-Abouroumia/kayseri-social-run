import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema/auth";
import { getLocale } from "@/i18n/get-locale";
import { getTransactionalEmailCopy } from "@/i18n/messages/transactional-email";
import { buildVerificationEmail } from "@/lib/email-templates";
import { countActiveVerificationTokensForEmail } from "@/lib/register-email-check";
import { redeemPendingAdminInviteAfterEmailVerification } from "@/lib/platform-admin-invite";
import { sendTransactionalEmail } from "@/lib/send-email";
import { getAuthSecret, getSiteUrl, getTrustedOrigins } from "@/lib/site-url";

const baseURL = getSiteUrl();
const trustedOrigins = getTrustedOrigins();
const secret = getAuthSecret();

export const auth = betterAuth({
  ...(secret ? { secret } : {}),

  baseURL,

  trustedOrigins,

  user: {
    additionalFields: {
      gender: {
        type: "string",
        required: false,
        defaultValue: "female",
        input: true,
      },
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),

  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          const now = new Date();
          await db
            .update(user)
            .set({ genderChosenAt: now, updatedAt: now })
            .where(eq(user.id, createdUser.id));
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const activeTokenCount = await countActiveVerificationTokensForEmail(user.email);
      if (activeTokenCount > 1) {
        return;
      }

      const locale = await getLocale();
      const copy = getTransactionalEmailCopy(locale);
      const email = buildVerificationEmail({
        copy,
        siteUrl: baseURL,
        verifyUrl: url,
        recipientName: user.name,
      });
      void sendTransactionalEmail({
        to: user.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
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
