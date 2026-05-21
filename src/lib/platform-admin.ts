import { desc, eq, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { platformAdmin } from "@/db/schema/platform-admin";
import {
  isBootstrapDeveloperEmail,
  parseBootstrapDeveloperEmails,
} from "@/lib/platform-developer";

const PLATFORM_ADMIN_RELATION = "platform_admin";

export const PLATFORM_ADMIN_MIGRATION_HINT =
  "Run `npm run db:migrate` (with DATABASE_URL set) so the platform_admin table exists on Neon.";

let loggedMissingPlatformAdminTable = false;

function isPlatformAdminTableMissingError(error: unknown): boolean {
  const walk = (e: unknown): boolean => {
    if (e == null || typeof e !== "object") return false;
    const o = e as Record<string, unknown>;
    if (o.code === "42P01") return true;
    const msg = String(o.message ?? "");
    if (
      new RegExp(
        `relation\\s+"${PLATFORM_ADMIN_RELATION}"\\s+does not exist`,
        "i",
      ).test(msg)
    ) {
      return true;
    }
    if (o.cause != null) return walk(o.cause);
    return false;
  };
  return walk(error);
}

function warnMissingPlatformAdminTableOnce(): void {
  if (loggedMissingPlatformAdminTable) return;
  loggedMissingPlatformAdminTable = true;
  console.warn(`[kayseri-social-run] ${PLATFORM_ADMIN_MIGRATION_HINT}`);
}

function lowerEmailMatchesAny(emails: string[]) {
  if (emails.length === 0) return sql`false`;
  if (emails.length === 1) return sql`lower(${user.email}) = ${emails[0]}`;
  return or(...emails.map((e) => sql`lower(${user.email}) = ${e}`));
}

export async function isPlatformAdmin(
  userId: string,
  email: string,
): Promise<boolean> {
  if (isBootstrapDeveloperEmail(email)) return true;

  try {
    const row = await db
      .select({ userId: platformAdmin.userId })
      .from(platformAdmin)
      .where(eq(platformAdmin.userId, userId))
      .limit(1);

    return row.length > 0;
  } catch (e) {
    if (isPlatformAdminTableMissingError(e)) {
      warnMissingPlatformAdminTableOnce();
      return false;
    }
    throw e;
  }
}

export async function getPlatformAdminUserIds(): Promise<Set<string>> {
  const ids = new Set<string>();

  let dbRows: { userId: string }[] = [];
  try {
    dbRows = await db
      .select({ userId: platformAdmin.userId })
      .from(platformAdmin);
  } catch (e) {
    if (isPlatformAdminTableMissingError(e)) {
      warnMissingPlatformAdminTableOnce();
    } else {
      throw e;
    }
  }

  for (const r of dbRows) ids.add(r.userId);

  const developerEmails = parseBootstrapDeveloperEmails();
  if (developerEmails.length === 0) return ids;

  const developerUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(lowerEmailMatchesAny(developerEmails));

  for (const u of developerUsers) ids.add(u.id);

  return ids;
}

/** Platform roles shown in system settings (extend when adding new privilege tiers). */
export type PlatformRole = "developer" | "admin";

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  developer: "Developer",
  admin: "Admin",
};

export function platformRolesForListedAdmin(
  source: "bootstrap_developer" | "database",
): PlatformRole[] {
  if (source === "bootstrap_developer") return ["developer"];
  return ["admin"];
}

export type ListedPlatformAdmin = {
  userId: string;
  email: string;
  name: string;
  source: "bootstrap_developer" | "database";
  roles: PlatformRole[];
  /** Database-granted admin; may be revoked in the UI by any platform admin. */
  removable: boolean;
};

/** Platform admins may revoke database-granted admins — not env bootstrap developers or yourself. */
export function canRevokePlatformAdminInUI(params: {
  actorUserId: string;
  targetUserId: string;
  targetSource: ListedPlatformAdmin["source"];
}): boolean {
  if (params.targetSource === "bootstrap_developer") return false;
  if (params.actorUserId === params.targetUserId) return false;
  return params.targetSource === "database";
}

export async function listPlatformAdmins(): Promise<ListedPlatformAdmin[]> {
  const developerEmails = parseBootstrapDeveloperEmails();

  let dbJoined: {
    userId: string;
    email: string;
    name: string;
  }[] = [];

  try {
    dbJoined = await db
      .select({
        userId: user.id,
        email: user.email,
        name: user.name,
      })
      .from(platformAdmin)
      .innerJoin(user, eq(platformAdmin.userId, user.id))
      .orderBy(desc(platformAdmin.createdAt));
  } catch (e) {
    if (isPlatformAdminTableMissingError(e)) {
      warnMissingPlatformAdminTableOnce();
    } else {
      throw e;
    }
  }

  const byId = new Map<string, ListedPlatformAdmin>();

  for (const row of dbJoined) {
    const bootstrapDeveloper = isBootstrapDeveloperEmail(row.email);
    const source = bootstrapDeveloper ? "bootstrap_developer" : "database";
    byId.set(row.userId, {
      userId: row.userId,
      email: row.email,
      name: row.name,
      source,
      roles: platformRolesForListedAdmin(source),
      removable: !bootstrapDeveloper,
    });
  }

  if (developerEmails.length > 0) {
    const developerUsers = await db
      .select({ id: user.id, email: user.email, name: user.name })
      .from(user)
      .where(lowerEmailMatchesAny(developerEmails));

    for (const u of developerUsers) {
      if (byId.has(u.id)) continue;
      byId.set(u.id, {
        userId: u.id,
        email: u.email,
        name: u.name,
        source: "bootstrap_developer",
        roles: platformRolesForListedAdmin("bootstrap_developer"),
        removable: false,
      });
    }
  }

  return [...byId.values()].sort((a, b) =>
    a.email.localeCompare(b.email, undefined, { sensitivity: "base" }),
  );
}

export async function findUserIdByEmail(
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = ${normalized}`)
    .limit(1);
  return rows[0]?.id ?? null;
}

export async function grantPlatformAdmin(params: {
  targetUserId: string;
  grantedByUserId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const { targetUserId, grantedByUserId } = params;

  const target = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);
  if (!target[0]) return { ok: false, message: "User not found." };

  if (await isPlatformAdmin(targetUserId, target[0].email)) {
    return { ok: false, message: "That user is already a platform admin." };
  }

  try {
    await db.insert(platformAdmin).values({
      userId: targetUserId,
      createdAt: new Date(),
      grantedByUserId,
    });
  } catch (e) {
    if (isPlatformAdminTableMissingError(e)) {
      warnMissingPlatformAdminTableOnce();
      return { ok: false, message: PLATFORM_ADMIN_MIGRATION_HINT };
    }
    throw e;
  }

  return { ok: true };
}

export async function revokePlatformAdminDbRow(params: {
  actorUserId: string;
  actorEmail: string;
  targetUserId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const { actorUserId, targetUserId } = params;

  const target = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, targetUserId))
    .limit(1);
  if (!target[0]) return { ok: false, message: "User not found." };

  const targetSource: ListedPlatformAdmin["source"] = isBootstrapDeveloperEmail(
    target[0].email,
  )
    ? "bootstrap_developer"
    : "database";

  if (
    !canRevokePlatformAdminInUI({
      actorUserId,
      targetUserId,
      targetSource,
    })
  ) {
    if (targetSource === "bootstrap_developer") {
      return {
        ok: false,
        message:
          "This developer is defined in PLATFORM_DEVELOPER_EMAILS. Remove them from environment config instead.",
      };
    }
    return {
      ok: false,
      message: "You cannot remove this admin access.",
    };
  }

  let inDb: { userId: string }[] = [];
  try {
    inDb = await db
      .select({ userId: platformAdmin.userId })
      .from(platformAdmin)
      .where(eq(platformAdmin.userId, targetUserId))
      .limit(1);
  } catch (e) {
    if (isPlatformAdminTableMissingError(e)) {
      warnMissingPlatformAdminTableOnce();
      return { ok: false, message: PLATFORM_ADMIN_MIGRATION_HINT };
    }
    throw e;
  }

  if (!inDb[0]) {
    return {
      ok: false,
      message: "That user is not in the database admin list.",
    };
  }

  const before = await getPlatformAdminUserIds();
  before.delete(targetUserId);
  if (before.size === 0) {
    return {
      ok: false,
      message: "Cannot remove the last platform admin.",
    };
  }

  try {
    await db
      .delete(platformAdmin)
      .where(eq(platformAdmin.userId, targetUserId));
  } catch (e) {
    if (isPlatformAdminTableMissingError(e)) {
      warnMissingPlatformAdminTableOnce();
      return { ok: false, message: PLATFORM_ADMIN_MIGRATION_HINT };
    }
    throw e;
  }

  return { ok: true };
}
