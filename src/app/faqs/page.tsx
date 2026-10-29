import { PublicPage, publicPageMetadata } from "@/components/public-page";
export const dynamic = "force-dynamic";
export const generateMetadata = () => publicPageMetadata("faqs");
export default function FAQsPage() {
  return <PublicPage page="faqs" />;
}
