import Image from "next/image";

// Display crops of the supplied artwork; the original image stays unchanged.
export function Brand({
  variant = "header",
}: {
  variant?: "header" | "full" | "mark";
}) {
  if (variant === "full") {
    return (
      <span className="brand-signature">
        <Image
          src="/brand/content-mark-logo.png"
          width={1254}
          height={1254}
          sizes="300px"
          alt="Content Mark — Advertising / Marketing. Your Internet Awareness Component."
        />
      </span>
    );
  }

  return (
    <span
      className={`brand brand-official ${variant === "mark" ? "brand-mark-only" : ""}`}
      role="img"
      aria-label="Content Mark"
    >
      <span className="brand-symbol">
        <Image
          src="/brand/content-mark-logo.png"
          width={1254}
          height={1254}
          sizes="100px"
          alt=""
          preload={variant === "header"}
        />
      </span>
      {variant === "header" ? (
        <span className="brand-wordmark">
          <Image
            src="/brand/content-mark-logo.png"
            width={1254}
            height={1254}
            sizes="200px"
            alt=""
            preload
          />
        </span>
      ) : null}
    </span>
  );
}
