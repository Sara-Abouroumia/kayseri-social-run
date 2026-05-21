import { desc } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import {
  listPlatformAdmins,
  type PlatformRole,
} from "@/lib/platform-admin";

export type ListedRegisteredUser = {
  userId: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  roles: PlatformRole[];
  /** Has platform admin or developer access. */
  isPlatformAdmin: boolean;
  adminRemovable: boolean;
  adminSource?: "bootstrap_developer" | "database";
};

export function isMemberUser(u: ListedRegisteredUser): boolean {
  return !u.isPlatformAdmin;
}

export async function listRegisteredUsersForAdmin(): Promise<ListedRegisteredUser[]> {
  const admins = await listPlatformAdmins();
  const adminMetaByUserId = new Map(
    admins.map((a) => [
      a.userId,
      { roles: a.roles, removable: a.removable, source: a.source },
    ]),
  );

  const rows = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  return rows.map((r) => {
    const meta = adminMetaByUserId.get(r.userId);
    const roles = meta?.roles ?? [];
    return {
      userId: r.userId,
      name: r.name,
      email: r.email,
      emailVerified: r.emailVerified,
      createdAt: r.createdAt,
      roles,
      isPlatformAdmin: roles.length > 0,
      adminRemovable: meta?.removable ?? false,
      adminSource: meta?.source,
    };
  });
}
