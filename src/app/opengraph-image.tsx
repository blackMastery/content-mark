import { ImageResponse } from "next/og";
import { getBrandArtwork } from "@/lib/brand-artwork";
export const alt = "Content Mark — We build. We promote. You grow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const artwork = await getBrandArtwork();
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
          GUYANA&apos;S DIGITAL GROWTH PARTNER
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontWeight: 800,
          fontSize: 99,
          lineHeight: 1,
          letterSpacing: -5,
        }}
      >
        <span>WE BUILD.</span>
        <span>WE PROMOTE.</span>
        <span style={{ color: "#45E5A4" }}>YOU GROW. ↗</span>
      </div>
      <div style={{ display: "flex", fontSize: 18, color: "#9BAFA5" }}>
        WEBSITE DEVELOPMENT / DIGITAL ADVERTISING / LEAD GENERATION
      </div>
    </div>,
    { ...size },
  );
}
