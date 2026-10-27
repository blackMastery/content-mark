"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <div className="admin-empty">
      <h2>Your workspace is temporarily unavailable.</h2>
      <p>
        Check that local Supabase is running, then try again. Your saved content
        is safe in the database.
      </p>
      <button className="admin-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
