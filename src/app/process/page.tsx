import { PublicPage, publicPageMetadata } from "@/components/public-page";
export const dynamic = "force-dynamic";
export const generateMetadata = () => publicPageMetadata("process");
export default function ProcessPage() {
  return <PublicPage page="process" />;
}
