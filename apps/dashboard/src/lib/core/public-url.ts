export const DEFAULT_APP_URL = "http://localhost:3001";

function normalizeUrl(raw: string): string {
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function getPublicAppUrl(fallback = DEFAULT_APP_URL): string {
  const candidate = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!candidate) return fallback;
  try {
    return normalizeUrl(new URL(candidate).toString());
  } catch {
    return fallback;
  }
}
