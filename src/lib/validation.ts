import { z } from "zod";
import { serviceOptions } from "./constants";
export const budgetOptions = [
  "Under G$75,000",
  "G$75,000–G$150,000",
  "G$150,000–G$300,000",
  "G$300,000+",
  "Let's discuss",
] as const;
export const createContactSchema = (
  options: readonly string[] = serviceOptions,
) =>
  z.object({
    name: z.string().trim().min(2, "Please enter your full name.").max(100),
    business: z
      .string()
      .trim()
      .min(2, "Please enter your business name.")
      .max(150),
    email: z.email("Please enter a valid email address.").max(254),
    phone: z
      .string()
      .trim()
      .min(7, "Please enter a phone or WhatsApp number.")
      .max(30)
      .regex(/^[+\d\s()\-]+$/, "Please use a valid phone number."),
    service: z.enum(options as [string, ...string[]], {
      error: "Please choose a service or package.",
    }),
    budget: z.enum(budgetOptions, { error: "Please select a budget range." }),
    description: z
      .string()
      .trim()
      .min(20, "Tell us a little more (at least 20 characters).")
      .max(4000, "Please keep your description under 4,000 characters."),
    website: z.string().max(0, "Unable to submit this inquiry."),
  });
export const contactSchema = createContactSchema();
export type ContactValues = z.infer<typeof contactSchema>;
