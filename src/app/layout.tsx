import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { getSiteUrl } from "@/lib/constants";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: "Content Mark",
  title: "Content Mark",
  creator: "Content Mark",
  publisher: "Content Mark",
  // Only the public home page explicitly opts into indexing and sharing metadata.
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  themeColor: "#080D0C",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GY" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${space.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
