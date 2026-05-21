import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next-path";

/** Sends signed-in users away from guest-only auth pages. */
export async function redirectIfAuthenticated(next?: string | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    redirect(safeNextPath(next, "/dashboard"));
  }
}
