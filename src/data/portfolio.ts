import type { Project, SectionCopy } from "@/lib/cms/schema";
import { bundledProjectImages } from "@/lib/cms/project-media";

// Imported from the user's website-development portfolio and project detail pages.
export const portfolioSource = "https://www.kevoncadogan.com/portfolio";
export const portfolioHeading: SectionCopy = {
  eyebrow: "WEBSITE DEVELOPMENT PORTFOLIO",
  title: "Real businesses.",
  accent: "Thoughtfully built online.",
  description:
    "Website development by Kevon Cadogan for businesses in Guyana and the Caribbean, spanning retail, travel, engineering, and professional services.",
};

export const portfolioProjects: Project[] = [
  {
    id: "poshhomedecor",
    name: "Posh Home Decor",
    category: "HOME DECOR / ECOMMERCE",
    title: "Posh Home Decor",
    description:
      "An image-led showroom catalogue with product collections, saved pieces, and bag-to-WhatsApp ordering.",
    theme: "retail",
    isConcept: false,
    imageUrl: bundledProjectImages.poshhomedecor.src,
    websiteUrl: "https://www.poshhomedecorgy.com/",
  },
  {
    id: "wsengineering",
    name: "W&S Engineering",
    category: "ENGINEERING / PRODUCT CATALOGUE",
    title: "W&S Engineering",
    description:
      "A trade-tool catalogue with part-number search, product variants, customer accounts, and order requests.",
    theme: "auto",
    isConcept: false,
    imageUrl: bundledProjectImages.wsengineering.src,
    websiteUrl: "https://www.wsengineeringgy.com/",
  },
  {
    id: "inneralchemyinstitution",
    name: "Inner Alchemy Institution",
    category: "COACHING / PROFESSIONAL SERVICES",
    title: "Inner Alchemy Institution",
    description:
      "An editorial practice website with programme discovery, session information, and discovery-call booking.",
    theme: "property",
    isConcept: false,
    imageUrl: bundledProjectImages.inneralchemyinstitution.src,
    websiteUrl: "https://www.inneralchemyinstitution.com/",
  },
  {
    id: "waronretailguyana",
    name: "War On Retail Guyana",
    category: "ELECTRONICS / RETAIL",
    title: "War On Retail Guyana",
    description:
      "A product catalogue for electronics and home appliances, with Guyanese-dollar pricing and WhatsApp ordering.",
    theme: "retail",
    isConcept: false,
    imageUrl: bundledProjectImages.waronretailguyana.src,
    websiteUrl: "https://www.waronretailguyana.com/",
  },
  {
    id: "mistaconciergetravel",
    name: "Mista Concierge Travel",
    category: "TRAVEL / TOURISM",
    title: "Mista Concierge Travel",
    description:
      "A concierge travel website showcasing Caribbean and Latin American tour packages and destination guides.",
    theme: "property",
    isConcept: false,
    imageUrl: bundledProjectImages.mistaconciergetravel.src,
    websiteUrl: "https://www.mistaconciergetravel.com/",
  },
  {
    id: "impact-business-solutions",
    name: "Impact Business Solutions",
    category: "MARKETING / BUSINESS SERVICES",
    title: "Impact Business Solutions",
    description:
      "A business website presenting a boutique agency's marketing and business development services.",
    theme: "auto",
    isConcept: false,
    imageUrl: bundledProjectImages["impact-business-solutions"].src,
    websiteUrl: "https://www.impact-business-solutions.com/",
  },
  {
    id: "healthyzway",
    name: "Healthyzway",
    category: "CONSUMER BRAND / ECOMMERCE",
    title: "Healthyzway",
    description:
      "A direct-to-consumer storefront with product flavours, usage information, delivery details, and FAQs.",
    theme: "retail",
    isConcept: false,
    imageUrl: bundledProjectImages.healthyzway.src,
    websiteUrl: "https://healthyzway.vercel.app/",
  },
  {
    id: "selenafurniturestore",
    name: "Selena's Furniture Store Guyana",
    category: "FURNITURE / RETAIL",
    title: "Selena's Furniture Store Guyana",
    description:
      "A furniture storefront with room-by-room browsing, showroom information, and local search optimisation.",
    theme: "retail",
    isConcept: false,
    imageUrl: bundledProjectImages.selenafurniturestore.src,
    websiteUrl: "https://selenafurniturestore.com/",
  },
  {
    id: "bucketlistcaribbean",
    name: "Bucketlist Caribbean",
    category: "TRAVEL / VACATION PACKAGES",
    title: "Bucketlist Caribbean",
    description:
      "A travel website with Caribbean getaways, destination guides, and direct WhatsApp enquiries.",
    theme: "property",
    isConcept: false,
    imageUrl: bundledProjectImages.bucketlistcaribbean.src,
    websiteUrl: "https://www.bucketlistcaribbean.com/",
  },
];
