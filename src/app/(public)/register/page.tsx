import { RegisterForm } from "./register-form";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { getInviteEmailForRegisterToken } from "@/lib/platform-admin-invite";
import { redirectIfAuthenticated } from "@/lib/redirect-if-authenticated";
import { safeNextPath } from "@/lib/safe-next-path";

type PageProps = {
  searchParams: Promise<{ invite?: string; next?: string }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const { invite, next } = await searchParams;
  await redirectIfAuthenticated(next);
  const raw = invite?.trim();
  const inviteLockedEmail = raw
    ? await getInviteEmailForRegisterToken(raw)
    : null;

  const defaultNext = safeNextPath(typeof next === "string" ? next : null, "/dashboard");
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <RegisterForm
      inviteLockedEmail={inviteLockedEmail}
      defaultNext={defaultNext}
      copy={dict.register}
    />
  );
}
