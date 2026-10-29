import { ArrowUp, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import Link from "next/link";
import { pageHref, sitePages } from "@/lib/site-pages";
import type { SiteDocument } from "@/lib/cms/schema";
export function Footer({
  settings,
  services,
  preview = false,
}: {
  settings: SiteDocument["settings"];
  services: SiteDocument["services"];
  preview?: boolean;
}) {
  const instagram = settings.instagramUrl;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link
              href={pageHref("home", preview)}
              aria-label="Content Mark home"
            >
              <Brand variant="full" />
            </Link>
            <p className="cms-lines">{settings.footerDescription}</p>
          </div>
          <div className="footer-links">
            <span>EXPLORE</span>
            {sitePages
              .filter((l) => l.key !== "home")
              .map((link) => (
                <Link key={link.key} href={pageHref(link.key, preview)}>
                  {link.label}
                </Link>
              ))}
          </div>
          <div className="footer-links">
            <span>WHAT WE DO</span>
            {services.map((service) => (
              <Link
                key={service.type}
                href={pageHref("contact", preview, { service: service.title })}
              >
                {service.title}
              </Link>
            ))}
          </div>
          <div className="footer-links">
            <span>LET&apos;S CONNECT</span>
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook <ArrowUpRight size={13} />
            </a>
            {instagram &&
            /^https:\/\/([\w-]+\.)?instagram\.com\//.test(instagram) ? (
              <a href={instagram} target="_blank" rel="noopener noreferrer">
                Instagram <ArrowUpRight size={13} />
              </a>
            ) : null}
            <span className="footer-location">
              <i className="live-dot" /> Based in Guyana
            </span>
            <a href="#top" className="back-top" aria-label="Back to top">
              <ArrowUp size={17} />
            </a>
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          make your mark<span>.</span>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Content Mark. All rights reserved.
          </span>
          <span>
            BUILT WITH INTENTION. MADE TO MOVE YOU FORWARD.{" "}
            <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </footer>
  );
}
