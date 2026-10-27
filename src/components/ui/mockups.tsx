import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Globe2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  MousePointer2,
  Send,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export function Architecture({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`architecture ${className}`}
      viewBox="0 0 640 440"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stopColor="#c2cfc3" />
          <stop offset="1" stopColor="#edf0d9" />
        </linearGradient>
        <linearGradient id="glass" x2="1" y2="1">
          <stop stopColor="#76867b" />
          <stop offset="1" stopColor="#203e33" />
        </linearGradient>
        <linearGradient id="wall" x2="1" y2="1">
          <stop stopColor="#f0ead8" />
          <stop offset="1" stopColor="#bcb9a5" />
        </linearGradient>
        <linearGradient id="pool" x2="1" y2="1">
          <stop stopColor="#87b5a5" />
          <stop offset="1" stopColor="#365f50" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <path fill="url(#sky)" d="M0 0h640v440H0z" />
      <circle
        cx="490"
        cy="85"
        r="42"
        fill="#f5ebce"
        opacity=".7"
        filter="url(#blur)"
      />
      <path
        d="m0 243 98-54 97 26 91-77 118 58 92-39 144 66v217H0Z"
        fill="#9cae91"
      />
      <path
        d="m0 278 136-55 111 47 139-39 117 8 137-38v239H0Z"
        fill="#718b6f"
      />
      <path d="M73 207h455v151H73z" fill="#777f68" />
      <path d="m169 107 339 31v151l-339-5V107Z" fill="url(#wall)" />
      <path d="m508 138 73 43v137l-73-29V138Z" fill="#9b9f88" />
      <path
        d="m150 104 20-12 357 31 66 46-13 13-73-43-357-35Z"
        fill="#f6efdb"
      />
      <path d="M180 138h306v112H180z" fill="url(#glass)" />
      <path
        d="M200 139v110m69-104v105m73-99v99m76-90v90"
        stroke="#d4cbb2"
        strokeWidth="5"
      />
      <path d="M180 138h306v112H180z" stroke="#acac96" strokeWidth="7" />
      <path
        d="m221 140 30 3v104h-30V140Zm112 8 34 4v95h-34v-99Z"
        fill="#d6d0b7"
        opacity=".35"
      />
      <path d="m66 269 429-5 95 58-24 13-500-37v-29Z" fill="#eee8d6" />
      <path d="M85 298h380v104H85z" fill="#ccc5af" />
      <path d="m465 298 102 36v68H465V298Z" fill="#999e83" />
      <path d="M113 312h237v88H113z" fill="url(#glass)" />
      <path
        d="M131 314v86m60-86v86m63-86v86m64-86v86"
        stroke="#b1ad98"
        strokeWidth="5"
      />
      <path d="M378 312h60v88h-60z" fill="#a58f6d" />
      <path
        d="M390 317v80m9-80v80m9-80v80m9-80v80m9-80v80"
        stroke="#827556"
        strokeWidth="2"
      />
      <path d="m66 404 432-6 142 42H0l66-36Z" fill="#d9d2b8" />
      <path d="m170 413 251-4 99 31H98l72-27Z" fill="url(#pool)" />
      <path d="m176 419 250-4m-206 16 250-4" stroke="#b8d5bb" opacity=".6" />
      <path d="M548 395V212" stroke="#526340" strokeWidth="8" />
      <path
        d="M548 231c-47-60-86-38-97-25 42-10 70 6 97 25Zm0-1c29-72 76-58 88-49-43 4-67 25-88 49Zm0 0c4-74-25-91-43-90 28 26 37 53 43 90Zm0 0c55-40 84-19 92-5-34-12-64-6-92 5Z"
        fill="#3e5b3d"
      />
      <path d="M31 412V287" stroke="#5c6546" strokeWidth="5" />
      <path
        d="M31 314C4 275 0 254 6 240c5 29 20 49 25 74Zm0-13c22-48 47-49 62-41-29 9-47 22-62 41Zm0 15c-37-26-52-19-60-11 26-3 42 1 60 11Z"
        fill="#455f3d"
      />
      <path d="m63 400 14-41 34 3 12 39H63Z" fill="#536a43" />
      <path d="M0 434h640" stroke="#f4edd7" strokeWidth="3" />
    </svg>
  );
}
export function CarIllustration() {
  return (
    <svg viewBox="0 0 600 290" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="car" x2="0" y2="1">
          <stop stopColor="#d6d4cb" />
          <stop offset=".4" stopColor="#f2eee4" />
          <stop offset="1" stopColor="#777b71" />
        </linearGradient>
        <linearGradient id="windshield" x2="1" y2="1">
          <stop stopColor="#657576" />
          <stop offset="1" stopColor="#1c2726" />
        </linearGradient>
      </defs>
      <ellipse cx="301" cy="243" rx="244" ry="21" fill="#000" opacity=".25" />
      <path
        d="m63 174 57-17 72-73c14-12 31-17 50-18l136 5c20 1 39 9 52 24l47 58 57 22 13 45-35 15H85l-35-20 13-41Z"
        fill="url(#car)"
      />
      <path
        d="m201 92 41-9 128 5 34 11 40 53-291 2 48-62Z"
        fill="url(#windshield)"
      />
      <path d="m281 84-5 70m96-66 22 65" stroke="#c3c3b7" strokeWidth="6" />
      <path
        d="m155 166 286-5m-158 4v55m153-55 19 49"
        stroke="#6b756e"
        strokeWidth="2"
      />
      <path
        d="m68 180 61-5-12 17-53 6m423-28 44 17-1 11-40-10"
        fill="#faf3ce"
      />
      <path d="m62 210 64 10h331l80-17" stroke="#404b44" strokeWidth="7" />
      <circle cx="153" cy="219" r="41" fill="#1b211e" />
      <circle cx="153" cy="219" r="25" fill="#a3aaa0" />
      <circle cx="153" cy="219" r="13" fill="#3e4741" />
      <path
        d="m153 194 1 50m-26-26h50m-43-17 35 35m0-35-35 35"
        stroke="#d0d4c8"
        strokeWidth="3"
      />
      <circle cx="444" cy="219" r="41" fill="#1b211e" />
      <circle cx="444" cy="219" r="25" fill="#a3aaa0" />
      <circle cx="444" cy="219" r="13" fill="#3e4741" />
      <path
        d="m444 194 1 50m-26-26h50m-43-17 35 35m0-35-35 35"
        stroke="#d0d4c8"
        strokeWidth="3"
      />
      <rect x="295" y="173" width="22" height="4" rx="2" fill="#707a70" />
      <rect x="404" y="173" width="22" height="4" rx="2" fill="#707a70" />
    </svg>
  );
}
export function ChairIllustration() {
  return (
    <svg viewBox="0 0 360 380" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="chair" x2="1" y2="1">
          <stop stopColor="#bd6e3d" />
          <stop offset=".6" stopColor="#94502d" />
          <stop offset="1" stopColor="#613c27" />
        </linearGradient>
      </defs>
      <ellipse
        cx="185"
        cy="346"
        rx="114"
        ry="17"
        fill="#644b32"
        opacity=".14"
      />
      <path
        d="m111 253-19 91m156-97 24 96m-100-87-9 76m47-69 18 67"
        stroke="#63543e"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M104 91c0-35 150-51 153 1l8 120-160 5-1-126Z"
        fill="url(#chair)"
      />
      <path d="M106 105c-4-30 132-38 135-3l6 106-138 8-3-111Z" fill="#b57348" />
      <path
        d="M87 224c-3-28 177-39 189-10l-3 46c-45 28-155 27-181-1l-5-35Z"
        fill="url(#chair)"
      />
      <path d="M91 220c32-23 154-27 181-6 19 22-137 46-181 6Z" fill="#c0875c" />
      <path
        d="M72 183c-6-20 16-29 28-11l11 59-23 8-16-56Zm181-19c4-20 27-15 28 4l-5 60-24 9 1-73Z"
        fill="#865232"
      />
      <path
        d="m112 115 2 85m116-91 6 85"
        stroke="#d79a6b"
        opacity=".35"
        strokeWidth="2"
      />
    </svg>
  );
}
export function BrowserChrome({
  label = "A thoughtful digital experience",
}: {
  label?: string;
}) {
  return (
    <div className="browser-chrome">
      <span className="browser-dots">
        <i />
        <i />
        <i />
      </span>
      <span>
        <Globe2 size={8} />
        {label}
      </span>
      <MoreHorizontal size={12} />
    </div>
  );
}
export function PropertyMockup({ small = false }: { small?: boolean }) {
  return (
    <div className={`property-mockup ${small ? "is-small" : ""}`}>
      <BrowserChrome label="Website concept / real estate" />
      <div className="property-inner">
        <div className="mock-nav">
          <span className="mock-wordmark">
            forma<span>®</span>
          </span>
          <span>Spaces for living.</span>
          <span>
            Find your place <ArrowUpRight size={10} />
          </span>
        </div>
        <div className="property-content">
          <div className="property-copy">
            <small>THOUGHTFULLY PLACED.</small>
            <h3>
              A little closer
              <br />
              to your
              <br />
              <em>dream home.</em>
            </h3>
            <p>
              Exceptional spaces.
              <br />A fresh perspective on living.
            </p>
            <span className="mock-button">
              Explore properties <ArrowUpRight size={10} />
            </span>
          </div>
          <Architecture />
        </div>
        <div className="mock-bottom">
          <span>SPACES THAT FEEL LIKE YOU.</span>
          <span>
            Discover a different kind of home. <ArrowUpRight size={11} />
          </span>
        </div>
      </div>
    </div>
  );
}
export function PhoneMockup() {
  return (
    <div className="phone-mockup">
      <div className="phone-island" />
      <div className="phone-header">
        <span>form & field</span>
        <ShoppingBag size={10} />
      </div>
      <small>THE EVERYDAY, ELEVATED.</small>
      <h3>
        Objects with
        <br />
        <em>intention.</em>
      </h3>
      <div className="phone-product">
        <ChairIllustration />
        <span>01 — THE SUNDAY CHAIR</span>
      </div>
      <div className="phone-shop">
        Find your everyday <ArrowUpRight size={11} />
      </div>
      <div className="phone-bottom" />
    </div>
  );
}
export function AdMockup() {
  return (
    <div className="ad-mockup">
      <div className="ad-profile">
        <span className="ad-avatar">f.</span>
        <span>
          forma homes<small>Sponsored · Concept</small>
        </span>
        <MoreHorizontal size={15} />
      </div>
      <div className="ad-image">
        <Architecture />
        <span>
          Your next chapter
          <br />
          starts here.
        </span>
        <i>
          <ArrowUpRight size={16} />
        </i>
      </div>
      <div className="ad-footer">
        <span>Find a place that feels like you.</span>
        <span>
          Learn more <ArrowUpRight size={10} />
        </span>
      </div>
      <div className="ad-actions">
        <Heart size={14} />
        <MessageCircle size={14} />
        <Send size={13} />
        <span>A creative direction by Content Mark</span>
      </div>
    </div>
  );
}
export function GrowthCard() {
  return (
    <div className="growth-card">
      <div className="growth-top">
        <span className="growth-icon">
          <Sparkles size={16} />
        </span>
        <span>
          Built for your next chapter<small>ONE CONNECTED STRATEGY</small>
        </span>
        <ArrowUpRight size={17} />
      </div>
      <div className="growth-bars">
        {[24, 38, 32, 50, 44, 64, 58, 78, 72, 95, 85, 112].map(
          (height, index) => (
            <i key={index} style={{ height: `${height / 2}px` }} />
          ),
        )}
      </div>
      <div className="growth-labels">
        <span>Attention</span>
        <span>Connection</span>
        <span>Opportunity</span>
      </div>
    </div>
  );
}
export function LeadFlow() {
  return (
    <div className="lead-flow">
      <div className="flow-label">
        <span className="live-dot" /> A CONNECTED CUSTOMER JOURNEY
      </div>
      <div className="flow-path">
        <div>
          <span>
            <MousePointer2 size={22} />
          </span>
          <small>Your ad</small>
        </div>
        <i />
        <div>
          <span>
            <Globe2 size={22} />
          </span>
          <small>Your website</small>
        </div>
        <i />
        <div>
          <span>
            <MessageCircle size={22} />
          </span>
          <small>A conversation</small>
        </div>
      </div>
      <div className="lead-message">
        <span className="lead-avatar">
          <MessageCircle size={17} />
        </span>
        <div>
          <strong>Let&apos;s talk business.</strong>
          <p>Hi! I&apos;d love to learn more about your services.</p>
        </div>
        <Check size={14} />
      </div>
      <span className="flow-note">
        Illustrative inquiry flow <ChevronDown size={10} />
      </span>
    </div>
  );
}
export function AutoMockup() {
  return (
    <div className="auto-mockup">
      <BrowserChrome label="Website concept / automotive" />
      <div className="auto-inner">
        <div className="mock-nav">
          <strong>
            DRIVE<span> / </span>
          </strong>
          <span>The fleet &nbsp; About &nbsp; Get in touch</span>
        </div>
        <small>FREEDOM STARTS HERE.</small>
        <h3>
          Your plans.
          <br />
          Your pace.
        </h3>
        <span className="auto-cta">
          Find your drive <ArrowUpRight size={10} />
        </span>
        <CarIllustration />
        <div className="auto-bottom">
          CITY STREETS. OPEN ROADS. YOUR CHOICE.<span>01 / 03</span>
        </div>
      </div>
    </div>
  );
}
export function RetailMockup() {
  return (
    <div className="retail-mockup">
      <BrowserChrome label="Website concept / ecommerce" />
      <div className="retail-inner">
        <div className="mock-nav">
          <strong>form & field</strong>
          <span>
            Objects &nbsp; Our story &nbsp; <ShoppingBag size={10} />
          </span>
        </div>
        <div className="retail-content">
          <div>
            <small>LESS, BUT BETTER.</small>
            <h3>
              Make room
              <br />
              for <em>the good.</em>
            </h3>
            <p>
              Considered objects for
              <br />
              the spaces we call home.
            </p>
            <span className="retail-cta">
              Explore the collection <ArrowUpRight size={10} />
            </span>
          </div>
          <ChairIllustration />
        </div>
        <div className="retail-bottom">
          <span>MADE TO BE LIVED WITH.</span>
          <span>Thoughtful by nature.</span>
        </div>
      </div>
    </div>
  );
}
