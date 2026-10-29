import { PublicPage, publicPageMetadata } from "@/components/public-page";
export const dynamic = "force-dynamic";
export const generateMetadata = () => publicPageMetadata("pricing");
export default function PricingPage() {
  return <PublicPage page="pricing" />;
}
