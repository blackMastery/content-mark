import type { Metadata } from "next";
import { privateRobots } from "@/lib/seo/metadata";
import "./admin.css";
export const metadata: Metadata = {
  title: {
    default: "Content Mark — Site Studio",
    template: "%s — Content Mark Studio",
  },
  description: "Private Content Mark website management workspace.",
  robots: privateRobots,
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};
export const dynamic = "force-dynamic";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
