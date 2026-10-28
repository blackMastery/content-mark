import { siteConfiguration } from "./site-config";

export const navigation = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Our Process", href: "#process" },
  { label: "Work", href: "#work" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];
export const facebookUrl =
  "https://www.facebook.com/profile.php?id=100068946408361";
export function getSiteUrl() {
  return siteConfiguration().origin;
}
export function getWhatsAppUrl(configuredNumber?: string) {
  const number = (
    configuredNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  )?.replace(/[\s+()-]/g, "");
  return number && /^[1-9]\d{6,14}$/.test(number)
    ? `https://wa.me/${number}?text=${encodeURIComponent("Hi Content Mark! I'd like to discuss my business's digital growth.")}`
    : undefined;
}
export const serviceOptions = [
  "Website Development",
  "Social Media Advertising",
  "Lead Generation",
  "Digital Starter",
  "Business Growth",
  "Growth Pro",
  "Founding Client Offer",
  "Let's discuss",
] as const;
