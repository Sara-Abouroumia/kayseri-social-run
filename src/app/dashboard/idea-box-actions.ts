"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, count, desc, eq, notExists } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { communityIdeaRead } from "@/db/schema/community-idea-read";
import { communityIdea } from "@/db/schema/community-ideas";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { auth } from "@/lib/auth";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin-session";

export type IdeaBoxActionState = { ok?: boolean; message?: string };

const submitSchema = z.object({
  title: z.string().trim().min(1).max(200),
  detail: z.string().trim().min(1).max(5000),
});

function revalidateIdeaBoxPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/ideas");
}

function isMissingReadTableError(error: unknown): boolean {
  const code =
    error &&
    typeof error === "object" &&
    "cause" in error &&
    error.cause &&
    typeof error.cause === "object" &&
    "code" in error.cause
      ? String((error.cause as { code?: string }).code)
      : null;
  return code === "42P01";
}

export async function submitCommunityIdeaAction(
  _prev: IdeaBoxActionState | undefined,
  formData: FormData,
): Promise<IdeaBoxActionState> {
  const dict = getDictionary(await getLocale());
  const t = dict.ideaBox;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return { ok: false, message: t.mustSignIn };
  }

  const parsed = submitSchema.safeParse({
    title: formData.get("title"),
    detail: formData.get("detail"),
  });

  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors;
    if (issues.title?.length) {
      const msg = issues.title[0];
      if (msg?.includes("200")) return { ok: false, message: t.titleTooLong };
      return { ok: false, message: t.titleRequired };
    }
    if (issues.detail?.length) {
      const msg = issues.detail[0];
      if (msg?.includes("5000")) return { ok: false, message: t.detailTooLong };
      return { ok: false, message: t.detailRequired };
    }
    return { ok: false, message: t.submitError };
  }

  await db.insert(communityIdea).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    title: parsed.data.title,
    detail: parsed.data.detail,
    createdAt: new Date(),
  });

  revalidateIdeaBoxPaths();

  return { ok: true, message: t.submitSuccess };
}

export async function listMyCommunityIdeas(userId: string) {
  return db
    .select({
      id: communityIdea.id,
      title: communityIdea.title,
      detail: communityIdea.detail,
      createdAt: communityIdea.createdAt,
    })
    .from(communityIdea)
    .where(eq(communityIdea.userId, userId))
    .orderBy(desc(communityIdea.createdAt));
}

export async function listCommunityIdeasForAdmin() {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) return [];

  return db
    .select({
      id: communityIdea.id,
      title: communityIdea.title,
      detail: communityIdea.detail,
      createdAt: communityIdea.createdAt,
      authorName: user.name,
      authorEmail: user.email,
      authorImage: user.image,
    })
    .from(communityIdea)
    .innerJoin(user, eq(communityIdea.userId, user.id))
    .orderBy(desc(communityIdea.createdAt));
}

export async function countUnreadCommunityIdeasForAdmin(
  adminUserId: string,
): Promise<number> {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok || gate.session.user.id !== adminUserId) return 0;

  try {
    const [row] = await db
      .select({ n: count() })
      .from(communityIdea)
      .where(
        notExists(
          db
            .select()
            .from(communityIdeaRead)
            .where(
              and(
                eq(communityIdeaRead.ideaId, communityIdea.id),
                eq(communityIdeaRead.adminUserId, adminUserId),
              ),
            ),
        ),
      );

    return Number(row?.n ?? 0);
  } catch (error) {
    if (isMissingReadTableError(error)) return 0;
    throw error;
  }
}

async function markAllCommunityIdeasRead(adminUserId: string) {
  const unread = await db
    .select({ id: communityIdea.id })
    .from(communityIdea)
    .where(
      notExists(
        db
          .select()
          .from(communityIdeaRead)
          .where(
            and(
              eq(communityIdeaRead.ideaId, communityIdea.id),
              eq(communityIdeaRead.adminUserId, adminUserId),
            ),
          ),
      ),
    );

  if (unread.length === 0) return;

  const now = new Date();
  await db.insert(communityIdeaRead).values(
    unread.map((row) => ({
      adminUserId,
      ideaId: row.id,
      readAt: now,
    })),
  );
}

/** Call from client after the admin ideas page loads (not during RSC render). */
export async function markAllCommunityIdeasReadAction() {
  const gate = await requirePlatformAdminSession();
  if (!gate.ok) return;

  try {
    await markAllCommunityIdeasRead(gate.session.user.id);
    revalidateIdeaBoxPaths();
  } catch (error) {
    if (isMissingReadTableError(error)) return;
    throw error;
  }
}
