import { PublicPage, publicPageMetadata } from "@/components/public-page";
export const dynamic = "force-dynamic";
export const generateMetadata = () => publicPageMetadata("portfolio");
export default function PortfolioPage() {
  return <PublicPage page="portfolio" />;
}
