"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navigation } from "@/lib/constants";
import { Brand } from "@/components/ui/brand";
export function Navigation() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key !== "Tab") return;
      const links = panel.current?.querySelectorAll<HTMLAnchorElement>("a");
      const first = toggle.current;
      const last = links?.[links.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onResize = () => {
      if (mq.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onResize);
    };
  }, [open]);
  return (
    <header className="site-header">
      <div className="container nav-shell">
        <a href="#home" aria-label="Content Mark home" className="logo-link">
          <Brand />
        </a>
        <nav aria-label="Main navigation" className="desktop-nav">
          {navigation.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="button button-small nav-cta" href="#contact">
          Start Your Project <ArrowUpRight size={16} />
        </a>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panel}
            id="mobile-nav"
            className="mobile-nav"
            initial={{ opacity: 0, y: reduced ? 0 : -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -12 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            <nav aria-label="Mobile navigation">
              {navigation.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  <span>0{i + 1}</span>
                  {link.label}
                  <ArrowUpRight size={19} />
                </a>
              ))}
              <a
                href="#contact"
                className="mobile-project"
                onClick={() => setOpen(false)}
              >
                Start Your Project <ArrowUpRight />
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
