import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { ContactValues } from "./validation";
const secret =
  process.env.CONTACT_FORM_SECRET || randomBytes(32).toString("hex");
function signature(value: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}
export function createFormToken(now = Date.now()) {
  const value = String(now);
  return `${value}.${signature(value)}`;
}
export function validateFormToken(token: string, now = Date.now()) {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [timestamp, provided = ""] = parts;
  const expected = signature(timestamp || "");
  if (provided.length !== expected.length) return false;
  const age = now - Number(timestamp);
  return (
    timingSafeEqual(Buffer.from(provided), Buffer.from(expected)) &&
    Number.isFinite(age) &&
    age >= 3000 &&
    age < 3_600_000
  );
}
type MailConfig = {
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
};
export async function sendInquiry(
  inquiry: ContactValues,
  config: MailConfig = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  },
  request: typeof fetch = fetch,
) {
  if (
    !config.RESEND_API_KEY ||
    !config.CONTACT_FROM_EMAIL ||
    !config.CONTACT_TO_EMAIL
  )
    throw new Error("Email delivery is not configured.");
  const text = [
    `New Content Mark inquiry`,
    `Name: ${inquiry.name}`,
    `Business: ${inquiry.business}`,
    `Email: ${inquiry.email}`,
    `Phone / WhatsApp: ${inquiry.phone}`,
    `Service / package: ${inquiry.service}`,
    `Budget: ${inquiry.budget}`,
    "",
    inquiry.description,
  ].join("\n");
  const response = await request("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.CONTACT_FROM_EMAIL,
      to: [config.CONTACT_TO_EMAIL],
      reply_to: inquiry.email,
      subject: "New Content Mark project inquiry",
      text,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error("Email delivery failed.");
  const result = await response.json();
  if (typeof result.id !== "string" || !result.id)
    throw new Error("Email delivery was not confirmed.");
  return result.id as string;
}
const limits = new Map<string, { count: number; expires: number }>();
export async function checkRateLimit(ip: string) {
  const key = `contact:${createHmac("sha256", secret).update(ip).digest("hex")}`;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    const response = await fetch(redisUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n",
        "1",
        key,
      ]),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error("Rate limit unavailable");
    const body = await response.json();
    if (typeof body.result !== "number")
      throw new Error("Rate limit unavailable");
    return body.result <= 5;
  }
  const now = Date.now();
  for (const [entry, value] of limits)
    if (value.expires < now) limits.delete(entry);
  const existing = limits.get(key);
  if (existing) {
    existing.count += 1;
    return existing.count <= 5;
  }
  if (limits.size >= 10_000) return false;
  limits.set(key, { count: 1, expires: now + 600_000 });
  return true;
}
