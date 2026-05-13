export function safeJsonParse<T>(
  input: string | null | undefined,
  fallback: T,
): T {
  if (!input) return fallback;
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}

export const ensureString = (val: unknown): string => {
  if (typeof val === "string" || typeof val === "number") return String(val);
  return "";
};
