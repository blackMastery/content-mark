import type { SectionCopy } from "@/lib/cms/schema";
import { Reveal } from "@/components/animations/reveal";
export function SectionHeading({
  copy,
  disclaimer,
  headingAs: Heading = "h2",
}: {
  copy: SectionCopy;
  disclaimer?: string;
  headingAs?: "h1" | "h2";
}) {
  return (
    <Reveal className="section-heading">
      <div>
        <span className="eyebrow">
          <span className="section-mark" />
          {copy.eyebrow}
        </span>
        <Heading>
          <span className="cms-lines">{copy.title}</span>
          <br />
          <span className="text-muted cms-lines">{copy.accent}</span>
        </Heading>
      </div>
      {disclaimer ? (
        <div>
          <p>{copy.description}</p>
          <span className="work-disclaimer">{disclaimer}</span>
        </div>
      ) : (
        <p>{copy.description}</p>
      )}
    </Reveal>
  );
}
