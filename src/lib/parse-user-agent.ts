export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export type ParsedUserAgent = {
  type: DeviceType;
  /** Short label for tables, e.g. "iPhone · Safari". */
  label: string;
};

function detectDeviceType(ua: string): DeviceType {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

function detectOs(ua: string): string {
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/ipod/i.test(ua)) return "iPod";
  if (/android/i.test(ua)) return "Android";
  if (/windows phone/i.test(ua)) return "Windows Phone";
  if (/windows/i.test(ua)) return "Windows";
  if (/mac os x|macintosh/i.test(ua)) return "Mac";
  if (/cros/i.test(ua)) return "ChromeOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown OS";
}

function detectBrowser(ua: string): string {
  if (/instagram/i.test(ua)) return "Instagram";
  if (/fbav|fban/i.test(ua)) return "Facebook";
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/crios/i.test(ua)) return "Chrome";
  if (/fxios/i.test(ua)) return "Firefox";
  if (/chrome|chromium/i.test(ua) && !/edg\//i.test(ua)) return "Chrome";
  if (/safari/i.test(ua) && !/chrome|crios|chromium|android/i.test(ua)) {
    return "Safari";
  }
  if (/firefox/i.test(ua)) return "Firefox";
  return "Browser";
}

/** Coarse device + OS/browser label from the request User-Agent header. */
export function parseUserAgent(
  ua: string | null | undefined,
): ParsedUserAgent {
  if (!ua?.trim()) {
    return { type: "unknown", label: "Unknown" };
  }

  const type = detectDeviceType(ua);
  const os = detectOs(ua);
  const browser = detectBrowser(ua);
  const label = `${os} · ${browser}`;

  return { type, label };
}

export function deviceTypeLabel(type: DeviceType): string {
  switch (type) {
    case "mobile":
      return "Mobile";
    case "tablet":
      return "Tablet";
    case "desktop":
      return "Desktop";
    default:
      return "Unknown";
  }
}
