import { LoginForm } from "./login-form";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { safeNextPath } from "@/lib/safe-next-path";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const defaultNext = safeNextPath(typeof next === "string" ? next : null, "/dashboard");
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return <LoginForm defaultNext={defaultNext} copy={dict.login} />;
}
