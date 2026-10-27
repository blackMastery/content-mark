import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  MapPin,
} from "lucide-react";
import {
  HeroComposition,
  HeroLine,
  Reveal,
} from "@/components/animations/reveal";
import {
  AdMockup,
  GrowthCard,
  PhoneMockup,
  PropertyMockup,
} from "@/components/ui/mockups";
import type { SiteDocument } from "@/lib/cms/schema";
export function Hero({ hero }: { hero: SiteDocument["hero"] }) {
  return (
    <section id="home" className="hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="container">
        <div className="hero-topline">
          <span className="eyebrow">
            <span className="live-dot" /> {hero.eyebrow}
          </span>
          <span className="hero-location">
            <MapPin size={12} /> {hero.location}
          </span>
        </div>
        <div className="hero-main">
          <div className="hero-copy">
            <h1>
              <HeroLine delay={0.08}>{hero.headline[0]}</HeroLine>
              <HeroLine delay={0.19}>{hero.headline[1]}</HeroLine>
              <HeroLine delay={0.3} className="text-mint">
                {hero.headline[2]}
                <ArrowUpRight className="headline-arrow" strokeWidth={1.4} />
              </HeroLine>
            </h1>
            <Reveal delay={0.35}>
              <p className="hero-description">{hero.description}</p>
              <div className="hero-buttons">
                <a href="#contact" className="button">
                  {hero.primaryCta} <ArrowUpRight size={18} />
                </a>
                <a href="#services" className="text-button">
                  {hero.secondaryCta} <ArrowDownRight size={17} />
                </a>
              </div>
              <div className="hero-assurance">
                <span>
                  <Check size={13} /> {hero.assurances[0]}
                </span>
                <span>
                  <Check size={13} /> {hero.assurances[1]}
                </span>
                <span>
                  <Check size={13} /> {hero.assurances[2]}
                </span>
              </div>
            </Reveal>
          </div>
          <HeroComposition>
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="composition-caption">
              <span className="live-dot" /> YOUR NEXT CHAPTER, ONLINE.
            </div>
            <div className="hero-desktop">
              <PropertyMockup />
            </div>
            <div className="hero-phone">
              <PhoneMockup />
            </div>
            <div className="hero-ad">
              <AdMockup />
            </div>
            <div className="hero-growth">
              <GrowthCard />
            </div>
            <span className="composition-note">
              DESIGNED TO CONNECT. BUILT TO CONVERT. <ArrowUpRight size={12} />
            </span>
            <span className="concept-note">
              Illustrative website & advertising concepts
            </span>
          </HeroComposition>
        </div>
        <div className="hero-bottom">
          <div>
            <span className="small-star">✳</span>
            <span>
              GOOD DESIGN GETS ATTENTION.
              <br />
              <strong>THE RIGHT STRATEGY TAKES IT FURTHER.</strong>
            </span>
          </div>
          <a href="#services" className="scroll-link">
            A LITTLE SCROLL. A LOT OF POSSIBILITY.{" "}
            <span>
              <ArrowDown size={16} />
            </span>
          </a>
        </div>
      </div>
      <div className="capabilities-strip">
        <div className="container">
          <span>WEBSITES THAT WORK</span>
          <span className="strip-star">✳</span>
          <span>ADVERTISING THAT CONNECTS</span>
          <span className="strip-star">✳</span>
          <span>GROWTH WITH INTENTION</span>
          <span className="strip-star">✳</span>
          <span>
            MADE IN GUYANA <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </section>
  );
}
