import { PublicPage, publicPageMetadata } from "@/components/public-page";
export const dynamic = "force-dynamic";
export const generateMetadata = () => publicPageMetadata("contact");
export default function ContactPage() {
  return <PublicPage page="contact" />;
}
