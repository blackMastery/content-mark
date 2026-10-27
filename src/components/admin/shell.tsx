"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CircleHelp,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  Tags,
  X,
} from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { signOut } from "@/app/admin/actions";
const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/content", label: "Page content", icon: FileText },
  { href: "/admin/projects", label: "Projects", icon: Images },
  { href: "/admin/pricing", label: "Pricing & offer", icon: Tags },
  { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
];
export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));
  const title =
    links.find((link) => isActive(link.href))?.label || "Site studio";
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebar.current
      ?.querySelector<HTMLButtonElement>(".sidebar-close")
      ?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => menuToggle.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const controls = sidebar.current?.querySelectorAll<HTMLElement>(
        "a[href],button:not([disabled])",
      );
      if (!controls?.length) return;
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const media = window.matchMedia("(min-width: 768px)");
    const resize = () => {
      if (media.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    media.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      media.removeEventListener("change", resize);
    };
  }, [open]);
  return (
    <div className="admin-app">
      <aside
        id="admin-sidebar"
        ref={sidebar}
        className={`admin-sidebar ${open ? "open" : ""}`}
      >
        <div className="admin-sidebar-brand">
          <Link href="/admin" aria-label="Content Mark Studio">
            <Brand />
          </Link>
          <button
            className="admin-icon-button sidebar-close"
            aria-label="Close admin navigation"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-label">
          <span>CM</span>
          <div>
            Content Mark<small>WEBSITE WORKSPACE</small>
          </div>
          <i />
        </div>
        <span className="sidebar-caption">MANAGE YOUR WEBSITE</span>
        <nav aria-label="Admin navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={isActive(link.href) ? "active" : ""}
            >
              <link.icon size={18} strokeWidth={1.6} />
              {link.label}
              {isActive(link.href) ? <i /> : null}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-site">
            <span className="admin-live-dot" />
            <span>
              Local workspace<small>Supabase connected</small>
            </span>
            <ArrowUpRight size={14} />
          </div>
          <Link href="/" target="_blank" className="sidebar-view">
            View live website <ArrowUpRight size={14} />
          </Link>
          <div className="admin-user">
            <span className="user-avatar">CM</span>
            <div>
              Administrator<small>{email}</small>
            </div>
            <form action={signOut}>
              <button aria-label="Sign out" title="Sign out">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>
      {open ? (
        <button
          className="sidebar-scrim"
          aria-label="Close admin navigation"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div className="admin-main" inert={open || undefined}>
        <header className="admin-topbar">
          <div>
            <button
              className="admin-icon-button sidebar-open"
              aria-label="Open admin navigation"
              ref={menuToggle}
              aria-expanded={open}
              aria-controls="admin-sidebar"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{title}</strong>
          </div>
          <Link href="/" target="_blank">
            View website <ArrowUpRight size={14} />
          </Link>
        </header>
        <main id="main" className="admin-content">
          {children}
        </main>
        <footer className="admin-footer">
          <span>Content Mark / Site Studio</span>
          <span>Your internet awareness component.</span>
        </footer>
      </div>
    </div>
  );
}
