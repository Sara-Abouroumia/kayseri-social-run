/**
 * Break-glass developers from env. They are always platform admins and can see
 * bootstrap metadata in system settings. Prefer PLATFORM_DEVELOPER_EMAILS;
 * PLATFORM_ADMIN_EMAILS is read as a fallback for older deployments.
 */
export function parseBootstrapDeveloperEmails(): string[] {
  const raw =
    process.env.PLATFORM_DEVELOPER_EMAILS?.trim() ??
    process.env.PLATFORM_ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isBootstrapDeveloperEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return parseBootstrapDeveloperEmails().includes(normalized);
}

export async function isPlatformDeveloper(
  _userId: string,
  email: string,
): Promise<boolean> {
  return isBootstrapDeveloperEmail(email);
}
