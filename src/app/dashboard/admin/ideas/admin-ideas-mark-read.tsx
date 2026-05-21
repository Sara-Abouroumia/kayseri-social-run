"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { markAllCommunityIdeasReadAction } from "@/app/dashboard/idea-box-actions";

/** Marks ideas read after mount (server actions cannot revalidate during RSC render). */
export function AdminIdeasMarkRead() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void markAllCommunityIdeasReadAction().then(() => {
      router.refresh();
    });
  }, [router]);

  return null;
}
