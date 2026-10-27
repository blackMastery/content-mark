import {
  advantages,
  faqs,
  pricing,
  projects,
  services,
  steps,
} from "@/data/content";
import { facebookUrl } from "@/lib/constants";
import { siteDocumentSchema } from "./schema";

export const defaultSiteDocument = siteDocumentSchema.parse({
  hero: {
    eyebrow: "GUYANA'S DIGITAL GROWTH PARTNER",
    location: "BASED IN GUYANA. BUILT FOR WHAT'S NEXT.",
    headline: ["WE BUILD.", "WE PROMOTE.", "YOU GROW."],
    description:
      "From powerful websites to targeted social media advertising, we help ambitious businesses turn online attention into real opportunities.",
    primaryCta: "Let's Grow Your Business",
    secondaryCta: "Explore Our Services",
    assurances: [
      "Thoughtful design",
      "Connected strategy",
      "Local understanding",
    ],
  },
  headings: {
    services: {
      eyebrow: "WHAT WE DO",
      title: "Everything you need.",
      accent: "To go further online.",
      description:
        "Your business deserves more than just an online presence. We bring the right pieces together to help it grow.",
    },
    why: {
      eyebrow: "THE CONTENT MARK DIFFERENCE",
      title: "More than a website.\nMore than an ad.",
      accent: "A bigger picture.",
      description:
        "Great digital growth happens when everything works together. We connect the dots between how your business looks, who it reaches, and what happens next.",
    },
    process: {
      eyebrow: "A CLEAR PATH FORWARD",
      title: "From first conversation.",
      accent: "To your next chapter.",
      description:
        "No guesswork. No complicated jargon. Just a collaborative process with your business at the centre.",
    },
    work: {
      eyebrow: "A LOOK AT THE POSSIBILITIES",
      title: "Big ideas.",
      accent: "Made tangible.",
      description:
        "Digital experiences built around real business needs. Here's a little of what we can imagine for yours.",
    },
    pricing: {
      eyebrow: "A SMARTER INVESTMENT",
      title: "Your ambition.",
      accent: "The right starting point.",
      description:
        "Clear packages. Thoughtful deliverables. Choose a foundation for your business's digital growth.",
    },
    faq: {
      eyebrow: "GOOD QUESTIONS",
      title: "A little clarity.",
      accent: "Before we begin.",
      description:
        "Making your next move should feel simple. Here are a few things you might be wondering.",
    },
    contact: {
      eyebrow: "YOUR NEXT CHAPTER STARTS HERE",
      title: "Let's build\nsomething",
      accent: "that moves\nyou forward.",
      description:
        "Tell us about your business and what you're looking to achieve. We'll help you identify the right digital solution.",
    },
  },
  services,
  advantages,
  steps,
  pricing,
  faqs,
  projects: projects.map((p) => ({
    ...p,
    isConcept: true,
    imageUrl: "",
    websiteUrl: "",
  })),
  promotion: {
    enabled: true,
    eyebrow: "FOUNDING CLIENT OFFER",
    title: "Your website + ads launch.\nOne powerful start.",
    description:
      "A considered first step for businesses ready to show up differently.",
    price: "65,000",
    regularPrice: "75,000",
    features: [
      "Mobile-friendly one-page website",
      "WhatsApp integration",
      "Two static ad creatives",
      "Facebook or Instagram campaign setup",
      "Basic launch report",
    ],
    badge: "FIRST 3\nQUALIFYING CLIENTS",
    cta: "Claim Your Launch Offer",
    disclaimer:
      "Ad spend, domain, hosting, and ongoing management are separate. Subject to availability and project qualification.",
  },
  settings: {
    seoTitle: "Content Mark — Websites, Advertising & Digital Growth in Guyana",
    seoDescription:
      "Your Internet Awareness Component. Content Mark builds professional websites, Facebook and Instagram campaigns, and connected lead generation for ambitious businesses in Guyana.",
    facebookUrl,
    instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    footerDescription:
      "Thoughtful websites. Connected advertising.\nNew possibilities for businesses in Guyana.",
    pricingDisclaimer:
      "All prices in Guyanese dollars. Advertising spend, domain registration, hosting, and third-party subscriptions are billed separately. Scope and pricing are confirmed before work begins.",
  },
});
