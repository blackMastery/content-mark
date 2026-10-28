import { ImageResponse } from "next/og";
import { getBrandArtwork } from "@/lib/brand-artwork";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const artwork = await getBrandArtwork();
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: 180,
        height: 180,
        overflow: "hidden",
        position: "relative",
        background: "#00090e",
      }}
    >
      <img
        alt=""
        src={artwork}
        width={377}
        height={377}
        style={{ position: "absolute", left: -96, top: -50 }}
      />
    </div>,
    size,
  );
}
