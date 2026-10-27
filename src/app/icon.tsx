import { ImageResponse } from "next/og";
import { getBrandArtwork } from "@/lib/brand-artwork";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const artwork = await getBrandArtwork();
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: 64,
        height: 64,
        overflow: "hidden",
        position: "relative",
        background: "#00090e",
        borderRadius: 12,
      }}
    >
      <img
        alt=""
        src={artwork}
        width={134}
        height={134}
        style={{ position: "absolute", left: -34, top: -17.6 }}
      />
    </div>,
    size,
  );
}
