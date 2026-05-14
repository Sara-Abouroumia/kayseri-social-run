import { RegisterForm } from "./register-form";
import { getInviteEmailForRegisterToken } from "@/lib/platform-admin-invite";

type PageProps = {
  searchParams: Promise<{ invite?: string }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const { invite } = await searchParams;
  const raw = invite?.trim();
  const inviteLockedEmail = raw
    ? await getInviteEmailForRegisterToken(raw)
    : null;

  return <RegisterForm inviteLockedEmail={inviteLockedEmail} />;
}
