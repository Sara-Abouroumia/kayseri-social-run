const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Without Vercel Blob, embed as data URL — keep small for DB payloads. */
export const INLINE_IMAGE_MAX_BYTES = 750 * 1024;

export const BLOB_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export type UploadedImage = {
  url: string;
  storage: "blob" | "inline";
  hint?: string;
};

export type UploadImageError = {
  error: string;
  status: 400 | 500;
};

function inferMimeFromName(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return null;
}

export function effectiveImageMime(file: File): string | null {
  if (file.type && ALLOWED_IMAGE_MIMES.has(file.type)) return file.type;
  return inferMimeFromName(file.name);
}

export async function uploadImageFile(
  file: File,
  pathnamePrefix: string,
  options?: { inlineMaxBytes?: number; blobMaxBytes?: number },
): Promise<UploadedImage | UploadImageError> {
  const inlineMax = options?.inlineMaxBytes ?? INLINE_IMAGE_MAX_BYTES;
  const blobMax = options?.blobMaxBytes ?? BLOB_IMAGE_MAX_BYTES;

  const mime = effectiveImageMime(file);
  if (!mime) {
    return {
      error:
        "Could not detect image type. Use JPEG, PNG, WebP, or GIF (some devices omit file type — try renaming to .jpg if needed).",
      status: 400,
    };
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (token) {
    if (file.size > blobMax) {
      return {
        error: `Image must be ${Math.round(blobMax / (1024 * 1024))} MB or smaller.`,
        status: 400,
      };
    }
    try {
      const { put } = await import("@vercel/blob");
      const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
      const pathname = `${pathnamePrefix}/${crypto.randomUUID()}-${safeName}`;

      const blob = await put(pathname, file, {
        access: "public",
        token,
        contentType: mime,
      });

      return { url: blob.url, storage: "blob" };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed.";
      console.error("[upload-image]", e);
      return { error: message, status: 500 };
    }
  }

  if (file.size > inlineMax) {
    return {
      error: `Without BLOB_READ_WRITE_TOKEN, use an image up to ${Math.round(inlineMax / 1024)} KB, or set BLOB_READ_WRITE_TOKEN for larger files (Vercel Blob).`,
      status: 400,
    };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const b64 = buf.toString("base64");
  return {
    url: `data:${mime};base64,${b64}`,
    storage: "inline",
    hint: "Stored inline. Set BLOB_READ_WRITE_TOKEN for Vercel Blob in production.",
  };
}
