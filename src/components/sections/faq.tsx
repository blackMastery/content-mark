import { ArrowUpRight, Plus } from "lucide-react";
import type { SiteDocument, SectionCopy } from "@/lib/cms/schema";
import { Reveal } from "@/components/animations/reveal";
export function FAQ({
  faqs,
  copy,
}: {
  faqs: SiteDocument["faqs"];
  copy: SectionCopy;
}) {
  return (
    <section id="faq" className="section faq-section">
      <div className="container faq-layout">
        <Reveal className="faq-intro">
          <span className="eyebrow">
            <span className="section-mark" /> {copy.eyebrow}
          </span>
          <h2>
            <span className="cms-lines">{copy.title}</span>
            <br />
            <span className="text-muted cms-lines">{copy.accent}</span>
          </h2>
          <p>{copy.description}</p>
          <a href="#contact" className="text-button">
            Have something else in mind? <ArrowUpRight size={17} />
          </a>
        </Reveal>
        <Reveal className="faq-list">
          {faqs.map((faq, i) => (
            <details key={faq.question} name="faq">
              <summary>
                <span className="faq-number">0{i + 1}</span>
                <span>{faq.question}</span>
                <Plus size={18} />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
