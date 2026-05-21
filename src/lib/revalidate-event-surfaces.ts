import { revalidatePath } from "next/cache";

/** Paths that list or surface club events for visitors and members. */
export function revalidateEventSurfaces(shareSlug?: string) {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/events");
  if (shareSlug) {
    revalidatePath(`/e/${shareSlug}`);
  }
}
