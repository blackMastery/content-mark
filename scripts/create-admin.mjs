import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url || !["127.0.0.1", "localhost"].includes(new URL(url).hostname))
  throw new Error("This helper only provisions the local development stack.");
const email = process.env.ADMIN_EMAIL || "admin@contentmark.local";
const client = createClient(url, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: users, error: listError } = await client.auth.admin.listUsers();
if (listError) throw listError;
let user = users.users.find((user) => user.email === email);
let password;
if (!user) {
  password = randomBytes(24).toString("base64url") + "aA1!";
  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  user = data.user;
}
const { error } = await client
  .from("admin_users")
  .upsert({ user_id: user.id }, { onConflict: "user_id" });
if (error) throw error;
mkdirSync(".local", { recursive: true });
if (password)
  writeFileSync(
    ".local/admin-credentials.json",
    JSON.stringify(
      { email, password, url: "http://localhost:3000/admin/login" },
      null,
      2,
    ),
    { mode: 0o600 },
  );
console.log(
  `Local admin ready: ${email}. ${existsSync(".local/admin-credentials.json") ? "Credentials are saved in .local/admin-credentials.json (git-ignored)." : "The existing password was preserved."}`,
);
