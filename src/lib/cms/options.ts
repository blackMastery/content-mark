import type { SiteDocument } from "./schema";
export function getServiceOptions(site: SiteDocument) {
  return [
    ...new Set([
      ...site.services.map((s) => s.title),
      ...site.pricing.map((p) => p.name),
      ...(site.promotion.enabled ? ["Founding Client Offer"] : []),
      "Let's discuss",
    ]),
  ];
}
