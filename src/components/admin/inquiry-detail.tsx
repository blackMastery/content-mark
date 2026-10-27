"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Mail,
  MessageCircle,
  Phone,
  Save,
} from "lucide-react";
import {
  inquiryStatuses,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/cms/schema";
import { updateInquiry } from "@/app/admin/actions";
export function InquiryDetail({ inquiry }: { inquiry: Inquiry }) {
  const [status, setStatus] = useState(inquiry.status);
  const [notes, setNotes] = useState(inquiry.notes);
  const [version, setVersion] = useState(inquiry.updated_at);
  const [message, setMessage] = useState<{
    text: string;
    error?: boolean;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const number = inquiry.phone.replace(/[^\d]/g, "");
  function save() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await updateInquiry({
          id: inquiry.id,
          status,
          notes,
          updatedAt: version,
        });
        if (result.error) {
          setMessage({ text: result.error, error: true });
          return;
        }
        setVersion(result.updatedAt!);
        setMessage({ text: "Inquiry updated." });
      } catch {
        setMessage({
          text: "Your changes couldn't be saved. Please try again.",
          error: true,
        });
      }
    });
  }
  return (
    <>
      <Link href="/admin/inquiries" className="admin-back-link">
        <ArrowLeft size={15} />
        All inquiries
      </Link>
      <div className="admin-page-heading inquiry-detail-heading">
        <div>
          <span className="admin-eyebrow">A NEW CONVERSATION</span>
          <h1>{inquiry.business}</h1>
          <p>
            Received{" "}
            {new Date(inquiry.created_at).toLocaleString("en-GB", {
              dateStyle: "long",
              timeStyle: "short",
              timeZone: "America/Guyana",
            })}
          </p>
        </div>
        <span className={`inquiry-status status-${status}`}>{status}</span>
      </div>
      <div className="inquiry-detail-grid">
        <div>
          <section className="admin-panel inquiry-message">
            <span className="admin-eyebrow">PROJECT INQUIRY</span>
            <h2>{inquiry.service}</h2>
            <div className="inquiry-budget">
              Estimated budget <strong>{inquiry.budget}</strong>
            </div>
            <p>{inquiry.description}</p>
          </section>
          <section className="admin-panel inquiry-person">
            <span className="admin-eyebrow">
              THE PERSON BEHIND THE BUSINESS
            </span>
            <h2>{inquiry.name}</h2>
            <p>{inquiry.business}</p>
            <a href={`mailto:${encodeURIComponent(inquiry.email)}`}>
              <Mail size={17} />
              {inquiry.email}
              <ArrowUpRight size={14} />
            </a>
            <a href={`tel:${inquiry.phone.replace(/[^+\d]/g, "")}`}>
              <Phone size={17} />
              {inquiry.phone}
              <ArrowUpRight size={14} />
            </a>
            {/^[1-9]\d{6,14}$/.test(number) ? (
              <a
                href={`https://wa.me/${number}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={17} />
                Open WhatsApp
                <ArrowUpRight size={14} />
              </a>
            ) : null}
            <small>
              {inquiry.notification_status === "sent"
                ? "Email notification sent."
                : inquiry.notification_status === "failed"
                  ? "Email notification failed. This inquiry was safely saved here."
                  : "Saved in your inbox. Email notifications are not configured."}
            </small>
          </section>
        </div>
        <section className="admin-panel inquiry-manage">
          <span className="admin-eyebrow">YOUR NEXT STEP</span>
          <h2>Keep things moving.</h2>
          <label className="admin-field">
            <span>Inquiry status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InquiryStatus)}
            >
              {inquiryStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Private notes</span>
            <textarea
              rows={8}
              value={notes}
              maxLength={10000}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="A follow-up, a useful detail, a next step…"
            />
            <small>Only approved administrators can see these notes.</small>
          </label>
          {message ? (
            <div
              className={`admin-notice ${message.error ? "error" : "success"}`}
              role={message.error ? "alert" : "status"}
            >
              {message.text}
            </div>
          ) : null}
          <button className="admin-primary" onClick={save} disabled={pending}>
            <Save size={16} />
            {pending ? "Saving…" : "Save inquiry"}
          </button>
          <p className="manage-hint">
            Use “Archived” to keep an inquiry out of your active workflow while
            preserving the conversation.
          </p>
        </section>
      </div>
    </>
  );
}
