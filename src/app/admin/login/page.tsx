import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { LoginForm } from "@/components/admin/login-form";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
export default async function LoginPage() {
  const configured = supabaseConfigured();
  if (configured && (await getAdmin())) redirect("/admin");
  return (
    <main id="main" className="admin-login">
      <div className="login-story">
        <Link href="/" aria-label="Content Mark home">
          <Brand />
        </Link>
        <div>
          <span className="admin-eyebrow">
            <i /> CONTENT MARK / SITE STUDIO
          </span>
          <h1>
            Your brand.
            <br />
            Your next chapter.
            <br />
            <em>Your control.</em>
          </h1>
          <p>
            A considered space to shape your website, keep your content fresh,
            and turn new inquiries into conversations.
          </p>
        </div>
        <span className="login-footnote">
          BUILT WITH INTENTION. MANAGED BY YOU.
        </span>
      </div>
      <div className="login-form-side">
        <Link href="/" className="admin-back-link">
          Back to website <ArrowUpRight size={15} />
        </Link>
        <div className="login-card">
          <span className="login-lock">
            <LockKeyhole size={23} />
          </span>
          <span className="admin-eyebrow">WELCOME BACK</span>
          <h2>Make your next move.</h2>
          <p>Sign in to manage your Content Mark website.</p>
          {configured ? (
            <LoginForm />
          ) : (
            <div className="admin-notice error">
              Supabase is not configured. Start the local stack and run{" "}
              <code>npm run db:env</code>.
            </div>
          )}
          <small>
            Private workspace. Access is limited to approved administrators.
          </small>
        </div>
        <span className="login-support">
          CONTENT MARK <span>YOUR INTERNET AWARENESS COMPONENT</span>
        </span>
      </div>
    </main>
  );
}
