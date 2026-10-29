import { PublicPage, publicPageMetadata } from "@/components/public-page";
export const dynamic = "force-dynamic";
export const generateMetadata = () => publicPageMetadata("home");
export default function Home() {
  return <PublicPage page="home" />;
}
