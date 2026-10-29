export const sitePages = [
  { key: "home", path: "/", label: "Home", seoTitle: "" },
  {
    key: "services",
    path: "/services",
    label: "Services",
    seoTitle: "Website Development & Digital Advertising in Guyana",
  },
  {
    key: "process",
    path: "/process",
    label: "Our Process",
    seoTitle: "Our Website & Advertising Process",
  },
  {
    key: "portfolio",
    path: "/portfolio",
    label: "Portfolio",
    seoTitle: "Website Development Portfolio",
  },
  {
    key: "pricing",
    path: "/pricing",
    label: "Pricing",
    seoTitle: "Website & Advertising Packages in Guyana",
  },
  {
    key: "faqs",
    path: "/faqs",
    label: "FAQs",
    seoTitle: "Website & Advertising FAQs",
  },
  {
    key: "contact",
    path: "/contact",
    label: "Contact",
    seoTitle: "Start Your Project",
  },
] as const;

export type SitePageKey = (typeof sitePages)[number]["key"];
export function getSitePage(key: SitePageKey) {
  return sitePages.find((page) => page.key === key)!;
}

export function pageHref(
  key: SitePageKey,
  preview = false,
  query: Record<string, string> = {},
) {
  const params = new URLSearchParams(preview ? { page: key, ...query } : query);
  const path = preview ? "/admin/preview" : getSitePage(key).path;
  return path + (params.size ? `?${params}` : "");
}

export function legacyPageDestination(search: string, hash: string) {
  const params = new URLSearchParams(search);
  if (params.has("service") || params.has("package"))
    return `/contact${search}`;
  const sections: Record<string, SitePageKey> = {
    "#services": "services",
    "#process": "process",
    "#work": "portfolio",
    "#pricing": "pricing",
    "#faq": "faqs",
    "#contact": "contact",
  };
  return Object.hasOwn(sections, hash)
    ? pageHref(sections[hash]) + search
    : undefined;
}
