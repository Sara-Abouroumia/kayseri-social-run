import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { uploadImageFile } from "@/lib/upload-image";

export const runtime = "nodejs";

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

  const result = await uploadImageFile(file, "event-covers");

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json(result);
}
