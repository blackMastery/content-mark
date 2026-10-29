import { z } from "zod";
import { isBundledProjectImage } from "./project-media";

const line = z.string().trim().min(1, "This field is required.").max(180);
const paragraph = z.string().trim().min(1, "This field is required.").max(2000);
const optionalUrl = z.union([
  z.literal(""),
  z
    .url()
    .max(2000)
    .refine((v) => /^https:\/\//.test(v), "Use a full HTTPS URL."),
]);
const imageUrl = z.union([
  z.literal(""),
  z
    .string()
    .refine(
      isBundledProjectImage,
      "Choose a bundled portfolio preview or upload an image.",
    ),
  z
    .url()
    .max(2000)
    .refine(
      (v) =>
        /^https:\/\//.test(v) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+\/storage\/v1\/object\/public\/site-media\//.test(
          v,
        ),
      "Use an uploaded image.",
    ),
]);
const lines = z.array(line).min(1).max(20);
const section = z.object({
  eyebrow: line,
  title: line,
  accent: line,
  description: paragraph,
});
export const sectionKeys = [
  "services",
  "why",
  "process",
  "work",
  "pricing",
  "faq",
  "contact",
] as const;
export const siteDocumentSchema = z.object({
  hero: z.object({
    eyebrow: line,
    location: line,
    headline: z.tuple([line, line, line]),
    description: paragraph,
    primaryCta: line,
    secondaryCta: line,
    assurances: z.array(line).length(3),
  }),
  headings: z.object({
    services: section,
    why: section,
    process: section,
    work: section,
    pricing: section,
    faq: section,
    contact: section,
  }),
  services: z
    .array(
      z.object({
        number: line,
        title: line,
        headline: line,
        description: paragraph,
        features: lines,
        type: z.enum(["website", "advertising", "leads"]),
      }),
    )
    .length(3),
  advantages: z
    .array(z.object({ title: line, description: paragraph }))
    .length(4),
  steps: z
    .array(
      z.object({
        title: line,
        description: paragraph,
        detail: paragraph,
        tags: z.array(line).length(3),
      }),
    )
    .length(4),
  projects: z
    .array(
      z.object({
        id: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .max(80),
        category: line,
        title: line,
        description: paragraph,
        name: line,
        theme: z.enum(["auto", "property", "retail"]),
        isConcept: z.boolean(),
        imageUrl,
        websiteUrl: optionalUrl,
      }),
    )
    .min(1)
    .max(12)
    .refine(
      (items) => new Set(items.map((p) => p.id)).size === items.length,
      "Each project needs a unique ID.",
    ),
  pricing: z
    .array(
      z.object({
        name: line,
        caption: line,
        price: z
          .string()
          .regex(/^\d{1,3}(,\d{3})*$|^\d+$/, "Enter a price such as 75,000."),
        prefix: z.string().max(60),
        billing: line,
        ongoing: line,
        featured: z.boolean(),
        features: lines,
      }),
    )
    .length(3)
    .refine(
      (items) => items.filter((p) => p.featured).length <= 1,
      "Choose at most one recommended package.",
    )
    .refine(
      (items) => new Set(items.map((p) => p.name)).size === items.length,
      "Package names must be unique.",
    ),
  promotion: z.object({
    enabled: z.boolean(),
    eyebrow: line,
    title: line,
    description: paragraph,
    price: line,
    regularPrice: line,
    features: lines,
    badge: line,
    cta: line,
    disclaimer: paragraph,
  }),
  faqs: z
    .array(z.object({ question: line, answer: paragraph }))
    .min(1)
    .max(20),
  settings: z.object({
    seoTitle: line,
    seoDescription: z.string().trim().min(20).max(320),
    facebookUrl: z
      .url()
      .refine((v) => /^https:\/\//.test(v), "Use a full HTTPS URL."),
    instagramUrl: optionalUrl,
    whatsappNumber: z
      .string()
      .max(25)
      .refine(
        (v) => v === "" || /^\+?[1-9][\d\s()-]{6,24}$/.test(v),
        "Include a valid country code and number.",
      ),
    footerDescription: paragraph,
    pricingDisclaimer: paragraph,
  }),
});
export type SiteDocument = z.infer<typeof siteDocumentSchema>;
export type SectionCopy = z.infer<typeof section>;
export type Project = SiteDocument["projects"][number];
export type InquiryStatus =
  "new" | "contacted" | "qualified" | "closed" | "archived";
export const inquiryStatuses: InquiryStatus[] = [
  "new",
  "contacted",
  "qualified",
  "closed",
  "archived",
];
export type Inquiry = {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  description: string;
  status: InquiryStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  notification_status: string;
};
