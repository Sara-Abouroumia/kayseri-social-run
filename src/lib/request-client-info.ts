export type ClientRequestInfo = {
  ipAddress: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  userAgent: string | null;
};

/** IP and coarse location from reverse-proxy / Vercel / Cloudflare headers. */
export function getClientRequestInfo(headerList: Headers): ClientRequestInfo {
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip")?.trim() ??
    null;

  return {
    ipAddress: ip,
    country:
      headerList.get("x-vercel-ip-country") ??
      headerList.get("cf-ipcountry") ??
      null,
    region: headerList.get("x-vercel-ip-country-region"),
    city: headerList.get("x-vercel-ip-city"),
    userAgent: headerList.get("user-agent"),
  };
}

export function formatLocationLabel(info: {
  city: string | null;
  region: string | null;
  country: string | null;
}): string {
  const parts = [info.city, info.region, info.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Unknown";
}
