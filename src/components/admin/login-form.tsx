"use client";
import { useActionState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { signIn } from "@/app/admin/actions";
export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  return (
    <form action={action} className="admin-login-form">
      <label>
        Email address
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          placeholder="Your admin email"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="Your password"
        />
      </label>
      {state.error ? (
        <p className="admin-notice error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="admin-primary" disabled={pending}>
        {pending ? (
          <>
            Signing in <LoaderCircle className="spinner" size={17} />
          </>
        ) : (
          <>
            Enter your studio <ArrowUpRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}
