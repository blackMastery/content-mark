import { ArrowUp, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { navigation } from "@/lib/constants";
import type { SiteDocument } from "@/lib/cms/schema";
export function Footer({
  settings,
  services,
}: {
  settings: SiteDocument["settings"];
  services: SiteDocument["services"];
}) {
  const instagram = settings.instagramUrl;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#home" aria-label="Content Mark home">
              <Brand variant="full" />
            </a>
            <p className="cms-lines">{settings.footerDescription}</p>
          </div>
          <div className="footer-links">
            <span>EXPLORE</span>
            {navigation
              .filter((l) => l.label !== "Home")
              .map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
          </div>
          <div className="footer-links">
            <span>WHAT WE DO</span>
            {services.map((service) => (
              <a
                key={service.type}
                href={`?service=${encodeURIComponent(service.title)}#contact`}
              >
                {service.title}
              </a>
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
            <a href="#home" className="back-top" aria-label="Back to top">
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
