import assert from "node:assert/strict";
import { test } from "node:test";
import { contactSchema } from "../src/lib/validation";
import {
  createFormToken,
  validateFormToken,
  sendInquiry,
} from "../src/lib/contact-server";
const inquiry = {
  name: "Test Person",
  business: "Test Business",
  email: "test@example.com",
  phone: "+592 600 0000",
  service: "Digital Starter",
  budget: "Under G$75,000",
  description: "We need a new website for our local business.",
  website: "",
};
test("valid inquiries pass; invalid addresses, injected choices and honeypots fail", () => {
  assert.equal(contactSchema.safeParse(inquiry).success, true);
  for (const invalid of [
    { email: "invalid" },
    { service: "unexpected" },
    { website: "spam" },
    { description: "short" },
    { phone: "letters" },
  ])
    assert.equal(
      contactSchema.safeParse({ ...inquiry, ...invalid }).success,
      false,
    );
});
test("signed form tokens reject fast, expired and tampered submissions", () => {
  const now = Date.now();
  const token = createFormToken(now);
  assert.equal(validateFormToken(token, now + 4000), true);
  assert.equal(validateFormToken(token, now + 1000), false);
  assert.equal(validateFormToken(token, now + 3_700_000), false);
  assert.equal(validateFormToken(token + "tampered", now + 4000), false);
});
test("missing email configuration never returns success", async () => {
  await assert.rejects(
    sendInquiry(contactSchema.parse(inquiry), {}, fetch),
    /not configured/,
  );
});
test("provider failure and a successful response without an id never report success", async () => {
  const config = {
    RESEND_API_KEY: "test",
    CONTACT_FROM_EMAIL: "Agency <agency@example.com>",
    CONTACT_TO_EMAIL: "owner@example.com",
  };
  for (const response of [
    new Response("{}", { status: 429 }),
    new Response("{}", { status: 200 }),
  ])
    await assert.rejects(
      sendInquiry(contactSchema.parse(inquiry), config, async () => response),
      /delivery/,
    );
});
test("validated inquiry is delivered with a reply-to and plain text body", async () => {
  const config = {
    RESEND_API_KEY: "test",
    CONTACT_FROM_EMAIL: "Agency <agency@example.com>",
    CONTACT_TO_EMAIL: "owner@example.com",
  };
  let payload: Record<string, unknown> = {};
  const id = await sendInquiry(
    contactSchema.parse(inquiry),
    config,
    async (_url, options) => {
      payload = JSON.parse(String(options?.body));
      return Response.json({ id: "test-message" });
    },
  );
  assert.equal(id, "test-message");
  assert.equal(payload.reply_to, inquiry.email);
  assert.match(String(payload.text), /Test Business/);
});
