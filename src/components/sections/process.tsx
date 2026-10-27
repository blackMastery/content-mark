"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Check,
  Compass,
  Layers3,
  Rocket,
  SlidersHorizontal,
} from "lucide-react";
import type { SiteDocument, SectionCopy } from "@/lib/cms/schema";
import { SectionHeading } from "@/components/ui/section-heading";
const icons = [Compass, Layers3, Rocket, SlidersHorizontal];
export function Process({
  steps,
  copy,
}: {
  steps: SiteDocument["steps"];
  copy: SectionCopy;
}) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const Icon = icons[active];
  return (
    <section id="process" className="section process-section">
      <div className="container">
        <SectionHeading copy={copy} />
        <div
          className="process-tabs"
          role="tablist"
          aria-label="Our four-step process"
        >
          {steps.map((step, i) => (
            <button
              key={step.title}
              role="tab"
              id={`step-tab-${i}`}
              aria-selected={active === i}
              aria-controls="process-panel"
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(event) => {
                const next =
                  event.key === "ArrowRight"
                    ? (i + 1) % 4
                    : event.key === "ArrowLeft"
                      ? (i + 3) % 4
                      : event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? 3
                          : null;
                if (next === null) return;
                event.preventDefault();
                setActive(next);
                document.getElementById(`step-tab-${next}`)?.focus();
              }}
              className={active === i ? "active" : ""}
            >
              <span className="step-track">
                <span>0{i + 1}</span>
                <i />
              </span>
              <h3>
                {step.title}
                <ArrowUpRight size={19} />
              </h3>
              <p>{step.description}</p>
            </button>
          ))}
        </div>
        <div
          id="process-panel"
          role="tabpanel"
          aria-labelledby={`step-tab-${active}`}
          tabIndex={0}
          className="process-panel"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="process-detail"
              initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: reduced ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            >
              <span className="process-detail-icon">
                <Icon size={34} strokeWidth={1.3} />
              </span>
              <div>
                <span className="eyebrow">
                  STEP 0{active + 1} / {steps[active].title.toUpperCase()}
                </span>
                <p>{steps[active].detail}</p>
              </div>
              <div className="process-tags">
                {steps[active].tags.map((tag) => (
                  <span key={tag}>
                    <Check size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
