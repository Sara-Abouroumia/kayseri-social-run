import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/platform-admin";

export const runtime = "nodejs";

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const BLOB_MAX_BYTES = 40 * 1024 * 1024;

function inferVideoMime(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  return null;
}

function effectiveVideoMime(file: File): string | null {
  if (file.type && VIDEO_MIMES.has(file.type)) return file.type;
  return inferVideoMime(file.name);
}

/** Short silent clips for the landing page — requires Vercel Blob (no inline fallback). */
export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isPlatformAdmin(session.user.id, session.user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Video upload needs BLOB_READ_WRITE_TOKEN (Vercel Blob). Paste an https link to your MP4/WebM instead, or set the token for uploads.",
      },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const mime = effectiveVideoMime(file);
  if (!mime) {
    return NextResponse.json(
      {
        error:
          "Use MP4, WebM, or MOV. If your device omits the file type, rename the file to end in .mp4 or .webm.",
      },
      { status: 400 },
    );
  }

  if (file.size > BLOB_MAX_BYTES) {
    return NextResponse.json(
      { error: "Video must be 40 MB or smaller. Try a shorter clip or lower resolution." },
      { status: 400 },
    );
  }

  try {
    const { put } = await import("@vercel/blob");
    const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
    const pathname = `about-media/${crypto.randomUUID()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: "public",
      token,
      contentType: mime,
    });

    return NextResponse.json({ url: blob.url, storage: "blob" as const });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    console.error("[about-media]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
