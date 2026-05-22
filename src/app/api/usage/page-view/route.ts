import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getClientRequestInfo } from "@/lib/request-client-info";
import {
  newVisitorId,
  recordPageView,
  shouldTrackPathname,
  USAGE_VISITOR_COOKIE,
} from "@/lib/usage-analytics";

const bodySchema = z.object({
  pathname: z.string().min(1).max(500),
  referrer: z.string().max(500).optional(),
  durationMs: z.number().int().min(0).max(30 * 60 * 1000).optional(),
});

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!shouldTrackPathname(body.pathname)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const h = await headers();
  const cookieHeader = h.get("cookie") ?? "";
  const visitorMatch = cookieHeader.match(
    new RegExp(`${USAGE_VISITOR_COOKIE}=([^;]+)`),
  );
  let visitorId = visitorMatch?.[1]?.trim();
  const setVisitorCookie = !visitorId;
  if (!visitorId) {
    visitorId = newVisitorId();
  }

  const session = await auth.api.getSession({ headers: h });
  const userId = session?.user?.id ?? null;

  try {
    await recordPageView({
      visitorId,
      userId,
      pathname: body.pathname,
      referrer: body.referrer ?? null,
      durationMs: body.durationMs ?? null,
      client: getClientRequestInfo(h),
    });
  } catch (e) {
    const msg = String((e as { message?: string })?.message ?? "");
    if (msg.includes("usage_page_views") && msg.includes("does not exist")) {
      return NextResponse.json({ ok: false, reason: "migration_required" });
    }
    console.error("[usage] recordPageView failed", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  if (setVisitorCookie) {
    response.cookies.set(USAGE_VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
  }
  return response;
}
