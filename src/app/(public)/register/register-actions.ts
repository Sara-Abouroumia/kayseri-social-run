"use server";

import { z } from "zod";

import { getRegisterEmailStatus } from "@/lib/register-email-check";

const emailSchema = z.string().trim().email();

export async function checkRegisterEmailAction(
  email: string,
): Promise<{ status: Awaited<ReturnType<typeof getRegisterEmailStatus>> }> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { status: "available" };
  }
  const status = await getRegisterEmailStatus(parsed.data);
  return { status };
}
