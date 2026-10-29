"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { legacyPageDestination } from "@/lib/site-pages";

export function LegacySectionRedirect() {
  const router = useRouter();
  useEffect(() => {
    const redirect = () => {
      const target = legacyPageDestination(
        window.location.search,
        window.location.hash,
      );
      if (target) router.replace(target);
    };
    redirect();
    window.addEventListener("hashchange", redirect);
    return () => window.removeEventListener("hashchange", redirect);
  }, [router]);
  return null;
}
