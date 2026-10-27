import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const raw = execFileSync("supabase", ["status", "--output", "json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
const status = JSON.parse(raw);
const vars = {
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    status.PUBLISHABLE_KEY || status.ANON_KEY,
  SUPABASE_SECRET_KEY: status.SECRET_KEY || status.SERVICE_ROLE_KEY,
};
if (!vars.NEXT_PUBLIC_SUPABASE_URL || !vars.SUPABASE_SECRET_KEY)
  throw new Error(
    "Supabase status did not return the required local configuration.",
  );
let text = existsSync(".env.local") ? readFileSync(".env.local", "utf8") : "";
for (const [key, value] of Object.entries(vars)) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  text = pattern.test(text)
    ? text.replace(pattern, line)
    : `${text.trimEnd()}\n${line}\n`;
}
if (!/^CONTACT_FORM_SECRET=.+$/m.test(text))
  text += `CONTACT_FORM_SECRET=${randomBytes(32).toString("hex")}\n`;
writeFileSync(".env.local", text.trimStart(), { mode: 0o600 });
console.log(
  "Local Supabase configuration saved to .env.local. Keys were not printed.",
);
