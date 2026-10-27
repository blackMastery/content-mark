"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="site-unavailable">
      <span className="eyebrow">CONTENT MARK</span>
      <h1>We&apos;ll be right back.</h1>
      <p>
        Our website is temporarily unavailable. Please try again in a moment.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
