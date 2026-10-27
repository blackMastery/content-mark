import type { Metadata } from "next";
import "./admin.css";
export const metadata: Metadata = {
  title: {
    default: "Content Mark — Site Studio",
    template: "%s — Content Mark Studio",
  },
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export const dynamic = "force-dynamic";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
