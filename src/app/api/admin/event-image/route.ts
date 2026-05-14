import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/platform-admin";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Without Vercel Blob, we embed as a data URL — keep small for DB and HTML payloads. */
const INLINE_MAX_BYTES = 750 * 1024;

const BLOB_MAX_BYTES = 4 * 1024 * 1024;

function inferMimeFromName(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return null;
}

function effectiveImageMime(file: File): string | null {
  if (file.type && ALLOWED.has(file.type)) return file.type;
  return inferMimeFromName(file.name);
}

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

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const mime = effectiveImageMime(file);
  if (!mime) {
    return NextResponse.json(
      {
        error:
          "Could not detect image type. Use JPEG, PNG, WebP, or GIF (some devices omit file type — try renaming to .jpg if needed).",
      },
      { status: 400 },
    );
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (token) {
    if (file.size > BLOB_MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be 4 MB or smaller." },
        { status: 400 },
      );
    }
    try {
      const { put } = await import("@vercel/blob");
      const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
      const pathname = `event-covers/${crypto.randomUUID()}-${safeName}`;

      const blob = await put(pathname, file, {
        access: "public",
        token,
        contentType: mime,
      });

      return NextResponse.json({ url: blob.url, storage: "blob" as const });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed.";
      console.error("[event-image]", e);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (file.size > INLINE_MAX_BYTES) {
    return NextResponse.json(
      {
        error: `Without BLOB_READ_WRITE_TOKEN, use an image up to ${Math.round(INLINE_MAX_BYTES / 1024)} KB, set BLOB_READ_WRITE_TOKEN for larger files (Vercel Blob), or paste an https image URL.`,
      },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const b64 = buf.toString("base64");
  const url = `data:${mime};base64,${b64}`;
  return NextResponse.json({
    url,
    storage: "inline" as const,
    hint:
      "Stored inline in the database. For production, set BLOB_READ_WRITE_TOKEN to use Vercel Blob instead.",
  });
}
