import type { Metadata } from "next";
import Link from "next/link";
import { privateRobots } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Page not found | Content Mark",
  robots: privateRobots,
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <main id="main" className="site-unavailable">
      <span className="eyebrow">CONTENT MARK / 404</span>
      <h1>This page couldn&apos;t be found.</h1>
      <p>Let&apos;s get you back to a little more possibility.</p>
      <Link className="button" href="/">
        Return to Content Mark
      </Link>
    </main>
  );
}
