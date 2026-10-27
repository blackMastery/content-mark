import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Inbox,
  Search,
} from "lucide-react";
import { requireAdmin } from "@/lib/supabase/admin";
import { inquiryStatuses } from "@/lib/cms/schema";

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.floor(
    Math.max(1, Math.min(Number(params.page) || 1, 10000)),
  );
  const search = (typeof params.q === "string" ? params.q : "").slice(0, 80);
  const status = inquiryStatuses.includes(
    params.status as (typeof inquiryStatuses)[number],
  )
    ? params.status
    : undefined;
  const { client } = await requireAdmin();
  let query = client
    .from("inquiries")
    .select("id,name,business,email,service,budget,status,created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * 25, page * 25 - 1);
  if (status) query = query.eq("status", status);
  if (search)
    query = query.textSearch("search_text", search, {
      type: "websearch",
      config: "simple",
    });
  const { data, error, count } = await query;
  if (error) throw new Error("Inquiries couldn't be loaded.");
  const pages = Math.max(1, Math.ceil((count || 0) / 25));
  const pageUrl = (p: number) =>
    `/admin/inquiries?${new URLSearchParams({ ...(search ? { q: search } : {}), ...(status ? { status } : {}), page: String(p) })}`;
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">ATTENTION INTO CONVERSATIONS</span>
          <h1>Your next opportunities.</h1>
          <p>
            A thoughtful space to manage every inquiry, from the first hello to
            the next step.
          </p>
        </div>
        <span className="inquiry-count">
          {count || 0} {(count || 0) === 1 ? "inquiry" : "inquiries"}
        </span>
      </div>
      <div className="admin-panel">
        <form className="inquiry-filters" action="/admin/inquiries">
          <label>
            <Search size={17} />
            <input
              name="q"
              defaultValue={search}
              aria-label="Search inquiries"
              placeholder="Search name, business, or message…"
            />
          </label>
          <select
            name="status"
            defaultValue={status || ""}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {inquiryStatuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <button type="submit" className="admin-secondary">
            Apply filters
          </button>
          {status || search ? (
            <Link href="/admin/inquiries" className="admin-inline-link">
              Clear
            </Link>
          ) : null}
        </form>
        {data?.length ? (
          <>
            <div className="inquiry-table-scroll">
              <table className="inquiry-table">
                <thead>
                  <tr>
                    <th>Person / business</th>
                    <th>Interested in</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th>
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link href={`/admin/inquiries/${item.id}`}>
                          <strong>{item.name}</strong>
                          <span>{item.business}</span>
                        </Link>
                      </td>
                      <td>{item.service}</td>
                      <td>{item.budget}</td>
                      <td>
                        <span
                          className={`inquiry-status status-${item.status}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {new Date(item.created_at).toLocaleDateString("en-GB", {
                          dateStyle: "medium",
                          timeZone: "America/Guyana",
                        })}
                      </td>
                      <td>
                        <Link
                          href={`/admin/inquiries/${item.id}`}
                          className="admin-round-link"
                          aria-label={`Open inquiry from ${item.name}`}
                        >
                          <ArrowUpRight size={17} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="inquiry-pagination">
              <span>
                Page {page} of {pages} · {count} results
              </span>
              <div>
                {page > 1 ? (
                  <Link href={pageUrl(page - 1)} className="admin-secondary">
                    <ArrowLeft size={14} />
                    Previous
                  </Link>
                ) : null}
                {page < pages ? (
                  <Link href={pageUrl(page + 1)} className="admin-secondary">
                    Next
                    <ArrowRight size={14} />
                  </Link>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="inquiries-empty full">
            <Inbox size={35} strokeWidth={1.2} />
            <h3>
              {search || status
                ? "No inquiries match those filters."
                : "Your next conversation starts here."}
            </h3>
            <p>
              {search || status
                ? "Try a different search or clear your filters."
                : "New submissions from your website's contact form will appear here automatically."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
