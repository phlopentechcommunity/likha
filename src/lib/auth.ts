import { timingSafeEqual } from "node:crypto";
export function requireInternalToken(request: Request) {
  const expected = process.env.INTERNAL_API_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\\s+/i, "");
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected), b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}
