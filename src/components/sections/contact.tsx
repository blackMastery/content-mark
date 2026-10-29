"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  MessageCircle,
} from "lucide-react";
import {
  budgetOptions,
  createContactSchema,
  type ContactValues,
} from "@/lib/validation";
import { getWhatsAppUrl } from "@/lib/constants";
import type { SiteDocument, SectionCopy } from "@/lib/cms/schema";
import { Reveal } from "@/components/animations/reveal";
export function Contact({
  copy,
  settings,
  options: serviceOptions,
  headingAs: Heading = "h2",
  preview = false,
}: {
  copy: SectionCopy;
  settings: SiteDocument["settings"];
  options: string[];
  headingAs?: "h1" | "h2";
  preview?: boolean;
}) {
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [token, setToken] = useState("");
  const params = useSearchParams();
  const whatsapp = getWhatsAppUrl(settings.whatsappNumber);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(createContactSchema(serviceOptions)),
    defaultValues: {
      name: "",
      business: "",
      email: "",
      phone: "",
      description: "",
      website: "",
    },
  });
  useEffect(() => {
    const selected = params.get("package") || params.get("service");
    setValue(
      "service",
      selected && serviceOptions.includes(selected) ? selected : "",
    );
  }, [params, setValue, serviceOptions]);
  useEffect(() => {
    if (preview) return;
    let active = true;
    fetch("/api/contact", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (active && data.token) setToken(data.token);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [preview]);
  async function submit(values: ContactValues) {
    if (preview) return;
    setResult(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, token }),
      });
      const body = await response.json();
      if (!response.ok) {
        setResult({
          success: false,
          message:
            body.error || "Your message couldn't be sent. Please try again.",
        });
        return;
      }
      setResult({
        success: true,
        message:
          "Your inquiry has been received. Thank you for telling us about your business. We'll be in touch using the details you provided.",
      });
      reset();
    } catch {
      setResult({
        success: false,
        message:
          "We couldn't connect. Your message has not been sent. Please try again, or contact us on Facebook.",
      });
    }
  }
  const fieldError = (key: keyof ContactValues) =>
    errors[key] ? (
      <span className="field-error" id={`${key}-error`}>
        {errors[key]?.message}
      </span>
    ) : null;
  const fieldProps = (key: keyof ContactValues) => ({
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });
  return (
    <section id="contact" className="section contact-section">
      <div className="container contact-layout">
        <Reveal className="contact-intro">
          <span className="eyebrow">
            <span className="live-dot" /> {copy.eyebrow}
          </span>
          <Heading>
            <span className="cms-lines">{copy.title}</span>
            <br />
            <span className="text-mint cms-lines">{copy.accent}</span>
            <ArrowUpRight strokeWidth={1} />
          </Heading>
          <p>{copy.description}</p>
          <div className="contact-location">
            <MapPin size={17} />
            <span>
              Rooted in Guyana.
              <br />
              <strong>Ready for your ambition.</strong>
            </span>
          </div>
          <div className="contact-alternatives">
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-button"
              >
                <MessageCircle size={17} /> Let&apos;s chat on WhatsApp{" "}
                <ArrowUpRight size={15} />
              </a>
            ) : null}
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-facebook"
            >
              Find us on Facebook <ArrowUpRight size={14} />
            </a>
          </div>
        </Reveal>
        <Reveal className="contact-form-panel">
          <div className="form-heading">
            <span>LET&apos;S TALK ABOUT YOUR BUSINESS.</span>
            <span>01 / A GOOD BEGINNING</span>
          </div>
          <form onSubmit={handleSubmit(submit)} noValidate>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">
                  Full name <span>*</span>
                </label>
                <input
                  id="name"
                  autoComplete="name"
                  placeholder="Your name"
                  {...register("name")}
                  {...fieldProps("name")}
                />
                {fieldError("name")}
              </div>
              <div className="field">
                <label htmlFor="business">
                  Business name <span>*</span>
                </label>
                <input
                  id="business"
                  autoComplete="organization"
                  placeholder="Your business"
                  {...register("business")}
                  {...fieldProps("business")}
                />
                {fieldError("business")}
              </div>
              <div className="field">
                <label htmlFor="email">
                  Email address <span>*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@yourbusiness.com"
                  {...register("email")}
                  {...fieldProps("email")}
                />
                {fieldError("email")}
              </div>
              <div className="field">
                <label htmlFor="phone">
                  Phone / WhatsApp <span>*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Your contact number"
                  {...register("phone")}
                  {...fieldProps("phone")}
                />
                {fieldError("phone")}
              </div>
              <div className="field">
                <label htmlFor="service">
                  I&apos;m interested in <span>*</span>
                </label>
                <select
                  id="service"
                  defaultValue=""
                  {...register("service")}
                  {...fieldProps("service")}
                >
                  <option value="" disabled>
                    Select a service or package
                  </option>
                  {serviceOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                {fieldError("service")}
              </div>
              <div className="field">
                <label htmlFor="budget">
                  Estimated budget <span>*</span>
                </label>
                <select
                  id="budget"
                  defaultValue=""
                  {...register("budget")}
                  {...fieldProps("budget")}
                >
                  <option value="" disabled>
                    Select a budget range
                  </option>
                  {budgetOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                {fieldError("budget")}
              </div>
              <div className="field field-full">
                <label htmlFor="description">
                  A little about your project <span>*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  maxLength={4000}
                  placeholder="What do you do, and where would you like to go?"
                  {...register("description")}
                  {...fieldProps("description")}
                />
                {fieldError("description")}
              </div>
            </div>
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Leave this empty</label>
              <input
                id="website"
                tabIndex={-1}
                autoComplete="off"
                {...register("website")}
              />
            </div>
            {result ? (
              <div
                className={`form-result ${result.success ? "success" : "error"}`}
                role={result.success ? "status" : "alert"}
              >
                {result.success ? <CheckCircle2 size={21} /> : null}
                <p>{result.message}</p>
              </div>
            ) : null}
            <button
              type="submit"
              className="button submit-button"
              disabled={isSubmitting || preview}
            >
              {isSubmitting ? (
                <>
                  Sending your inquiry{" "}
                  <LoaderCircle size={18} className="spinner" />
                </>
              ) : (
                <>
                  Let&apos;s Start a Conversation <ArrowUpRight size={18} />
                </>
              )}
            </button>
            <p className="form-privacy">
              {preview
                ? "Private draft preview — inquiries can be sent from the published Contact page. "
                : ""}
              By submitting, you agree that Content Mark may use these details
              to respond to your inquiry. No mailing lists. Just a conversation.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
