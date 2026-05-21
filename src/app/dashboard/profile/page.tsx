import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { ProfileAvatarUpload } from "@/app/dashboard/profile-avatar-upload";
import { ProfileSettingsForm } from "@/app/dashboard/profile-settings-form";
import { siteMainClass } from "@/lib/layout";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

export const metadata: Metadata = {
  title: "Profile settings",
};

export default async function ProfileSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const [row] = await db
    .select({
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!row) {
    redirect("/login");
  }

  return (
    <main className={siteMainClass}>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {dict.profileSettings.title}
      </h1>
      <p className="mt-2 text-sm text-zinc-600">{dict.profileSettings.subtitle}</p>

      <div className="mt-8 space-y-6">
        <ProfileAvatarUpload
          displayName={row.name.trim() || row.email}
          initialImageUrl={row.image}
          copy={dict.profileSettings}
        />
        <ProfileSettingsForm
          initialName={row.name}
          email={row.email}
          copy={dict.profileSettings}
        />
      </div>
    </main>
  );
}
