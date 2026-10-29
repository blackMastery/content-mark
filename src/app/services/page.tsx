import { PublicPage, publicPageMetadata } from "@/components/public-page";
export const dynamic = "force-dynamic";
export const generateMetadata = () => publicPageMetadata("services");
export default function ServicesPage() {
  return <PublicPage page="services" />;
}
