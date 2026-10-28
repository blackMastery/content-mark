import { ImageResponse } from "next/og";
import { getBrandArtwork } from "@/lib/brand-artwork";
import type { SiteDocument } from "@/lib/cms/schema";

const size = { width: 1200, height: 630 };

export async function createShareImage(site: SiteDocument) {
  const artwork = await getBrandArtwork();
  // Keep administrator-edited headlines inside the card, including unusually long lines.
  const lines = site.hero.headline.map((line) => line.length > 42 ? `${line.slice(0, 41).trimEnd()}…` : line);
  const longest = Math.max(...lines.map((line) => line.length));
  const fontSize = Math.min(99, Math.floor(1470 / longest));
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#080D0C",
        color: "#F7FAF8",
        width: "100%",
        height: "100%",
        padding: "55px 65px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 25,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              position: "relative",
              width: 48,
              height: 48,
              overflow: "hidden",
            }}
          >
            <img
              alt=""
              src={artwork}
              width={100}
              height={100}
              style={{ position: "absolute", left: -26, top: -13.2 }}
            />
          </div>
          <div
            style={{
              display: "flex",
              position: "relative",
              width: 183,
              height: 21,
              overflow: "hidden",
            }}
          >
            <img
              alt="Content Mark"
              src={artwork}
              width={202}
              height={202}
              style={{ position: "absolute", left: -9, top: -123 }}
            />
          </div>
        </div>
        <span style={{ color: "#45E5A4", fontSize: 17 }}>
          BASED IN GUYANA
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontWeight: 800,
          fontSize,
          lineHeight: 1.12,
          letterSpacing: -fontSize * 0.04,
        }}
      >
        {lines.map((line, index) => <span key={index} style={{ color: index === 2 ? "#45E5A4" : "#F7FAF8" }}>{line}</span>)}
      </div>
      <div style={{ display: "flex", fontSize: 18, color: "#9BAFA5" }}>
        WEBSITE DEVELOPMENT / DIGITAL ADVERTISING / LEAD GENERATION
      </div>
    </div>,
    { ...size, headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
  );
}
