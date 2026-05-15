import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { uploadImageFile } from "@/lib/upload-image";

export const runtime = "nodejs";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const result = await uploadImageFile(file, `avatars/${session.user.id}`, {
    inlineMaxBytes: 512 * 1024,
    blobMaxBytes: AVATAR_MAX_BYTES,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}
