import {
  ArrowUpRight,
  Crosshair,
  Globe2,
  MessageSquareText,
  MoveUpRight,
  ScanLine,
} from "lucide-react";
import type { SiteDocument, SectionCopy } from "@/lib/cms/schema";
import { Reveal } from "@/components/animations/reveal";
import { Brand } from "@/components/ui/brand";
export function WhyContentMark({
  advantages,
  copy,
}: {
  advantages: SiteDocument["advantages"];
  copy: SectionCopy;
}) {
  const icons = [ScanLine, Crosshair, MessageSquareText, MoveUpRight];
  return (
    <section className="section why-section">
      <div className="container why-layout">
        <Reveal className="why-intro">
          <span className="eyebrow">
            <span className="section-mark" /> {copy.eyebrow}
          </span>
          <h2>
            <span className="cms-lines">{copy.title}</span>
            <br />
            <span className="text-mint cms-lines">{copy.accent}</span>
          </h2>
          <p>{copy.description}</p>
          <a href="#contact" className="text-button">
            Meet your next growth partner <ArrowUpRight size={18} />
          </a>
          <div className="strategy-art" aria-hidden="true">
            <div className="strategy-orbit" />
            <span className="strategy-node node-web">
              <Globe2 size={20} />
              Your website
            </span>
            <span className="strategy-center">
              <Brand variant="mark" />
            </span>
            <span className="strategy-node node-ads">
              <Crosshair size={20} />
              Your advertising
            </span>
            <span className="strategy-node node-growth">
              <MoveUpRight size={20} />
              Your growth
            </span>
          </div>
        </Reveal>
        <div className="advantages">
          {advantages.map((advantage, index) => {
            const Icon = icons[index];
            return (
              <Reveal
                key={advantage.title}
                className="advantage"
                delay={index * 0.05}
              >
                <span className="advantage-icon">
                  <Icon size={21} strokeWidth={1.5} />
                </span>
                <div>
                  <span className="advantage-number">0{index + 1}</span>
                  <h3>{advantage.title}</h3>
                  <p>{advantage.description}</p>
                </div>
                <ArrowUpRight className="advantage-arrow" size={18} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
