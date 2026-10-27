import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { GET, POST } from "../src/app/api/contact/route";
test("form tokens are never cached", async () => {
  const response = GET();
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match((await response.json()).token, /^\d+\.[a-f0-9]{64}$/);
});
test("route rejects foreign origins, malformed bodies, oversized payloads and spam", async () => {
  const send = (body: string, extra: Record<string, string> = {}) =>
    POST(
      new NextRequest("http://0.0.0.0:3000/api/contact", {
        method: "POST",
        headers: {
          host: "localhost:3000",
          origin: "http://localhost:3000",
          "content-type": "application/json",
          ...extra,
        },
        body,
      }),
    );
  assert.equal(
    (await send("{}", { origin: "https://foreign.example" })).status,
    403,
  );
  assert.equal((await send("malformed")).status, 400);
  assert.equal((await send("a".repeat(17_000))).status, 413);
  assert.equal((await send(JSON.stringify({ website: "spam" }))).status, 400);
});
test("same-origin browser submissions accept localhost host behind a wildcard listener, then honestly report missing configuration", async () => {
  const response = await POST(
    new NextRequest("http://0.0.0.0:3000/api/contact", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
        "content-type": "application/json",
        "x-vercel-forwarded-for": "test-config",
      },
      body: JSON.stringify({
        name: "Preview Person",
        business: "Preview Business",
        email: "preview@example.com",
        phone: "+592 600 0000",
        service: "Business Growth",
        budget: "Let's discuss",
        description: "A local test of our business website inquiry form.",
        website: "",
      }),
    }),
  );
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /not configured/);
});
test("sixth inquiry attempt in one window is rejected", async () => {
  let last: Response | undefined;
  for (let i = 0; i < 6; i++)
    last = await POST(
      new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          host: "localhost:3000",
          origin: "http://localhost:3000",
          "content-type": "application/json",
          "x-vercel-forwarded-for": "test-rate-limit",
        },
        body: "{}",
      }),
    );
  assert.equal(last?.status, 429);
});
