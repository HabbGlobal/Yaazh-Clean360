import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import ZoneCardSpread from "@/components/landing/ZoneCardSpread";
import yaazhLogo from "@/assets/logo yaazh.png";
import welcomeImage from "@/assets/images/welcome.png";
import zone1Image from "@/assets/images/Zone01-RB9593.png";
import zone2Image from "@/assets/images/Zone02-RE9244.png";
import zone3Image from "@/assets/images/Zone03-RH9424.png";
import zone4Image from "@/assets/images/Zone04-RH9425.png";
import zone5Image from "@/assets/images/Zone05-GL8706.png";

type ZoneFeature = { zone: string; lorry: string; image: StaticImageData; accent: "purple" | "yellow" | "pink" | "mint" };

const zones: ZoneFeature[] = [
  { zone: "Zone 01", lorry: "RB 9593", image: zone1Image, accent: "purple" },
  { zone: "Zone 02", lorry: "RE 9244", image: zone2Image, accent: "yellow" },
  { zone: "Zone 03", lorry: "RH 9424", image: zone3Image, accent: "pink" },
  { zone: "Zone 04", lorry: "RH 9425", image: zone4Image, accent: "mint" },
  { zone: "Zone 05", lorry: "GL 8706", image: zone5Image, accent: "purple" },
];

const features = [
  ["location", "Zone-based schedules", "Choose your area and receive the collection timetable created for your neighbourhood.", "purple"],
  ["calendar", "Monday–Saturday service", "See collection days and times across the full six-day operating week.", "pink"],
  ["truck", "Assigned lorry details", "Know the registration number of the collection vehicle serving your zone.", "yellow"],
  ["recycle", "Waste-type guidance", "Separate general, recyclable, organic and hazardous waste with confidence.", "mint"],
  ["vote", "Readiness voting", "Confirm whether your household is ready for collection and help officials see zone-level demand.", "purple"],
  ["complaint", "Complaint reporting", "Report missed pickups or service issues with clear details and optional photo evidence.", "pink"],
  ["status", "Complaint status tracking", "Follow each report from submitted to in-review and resolved without calling the office repeatedly.", "mint"],
  ["star", "Service rating", "Rate collection quality after service and share feedback that helps improve future routes.", "yellow"],
  ["profile", "Resident profile control", "Keep your phone number, address, profile image and selected zone up to date from one place.", "purple"],
  ["phone", "Tap-to-call support", "Reach Pradesa Sabha quickly from the floating help popup on mobile and desktop.", "pink"],
  ["shield", "Secure resident access", "OTP verification, password hashing, JWT sessions and role-based access protect the platform.", "yellow"],
  ["refresh", "Admin-managed updates", "Schedules, waste types, lorries, residents, complaints and feedback can be managed centrally.", "mint"],
];

const pradesaSabhaPhone = "021 222 2700";

function FeatureIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M8 3v4m8-4v4M3 10h18m-13 4h2m4 0h2m-8 4h2"/></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 4v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    recycle: <><path d="m9 4 3-2 3 5M5 9l-3 3 3 4m14-7 3 3-3 4"/><path d="M7 7h8l4 7M17 17H9l-4-7"/></>,
    vote: <><path d="M5 12h14v8H5z"/><path d="m8 9 4-5 4 5M12 4v11"/><path d="M9 16h6"/></>,
    complaint: <><path d="M4 5h16v11H8l-4 4z"/><path d="M12 8v3m0 3h.01"/></>,
    status: <><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="18" cy="18" r="2.5"/><path d="m17 18 1 1 2-2"/></>,
    star: <><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-4 4-6 8-6s6.6 2 8 6"/></>,
    phone: <><path d="M7 4h4l2 5-2.5 1.5a13 13 0 0 0 5 5L17 13l5 2v4c0 1-1 2-2 2A17 17 0 0 1 3 6c0-1 1-2 2-2h2Z"/></>,
    shield: <><path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z"/><path d="m9 12 2 2 4-5"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 9m16 6-2 2.5A7 7 0 0 1 5.5 15"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export default function Home() {
  return (
    <div className="np-landing">
      <section className="np-hero np-dots" aria-labelledby="hero-title">
        <span className="np-shape np-shape--hero-logo" aria-hidden="true"><Image src={yaazhLogo} alt="" sizes="120px" /></span><span className="np-shape np-shape--diamond" aria-hidden="true" />
        <div className="np-container np-hero__grid">
          <div className="np-hero__copy">
            <p className="np-sticker np-sticker--yellow">Smart collection for cleaner communities</p>
            <h1 id="hero-title">Cleaner streets, right on schedule.</h1>
            <p className="np-lead">Yaazh Clean360 connects every resident with the correct zone, assigned lorry and Monday–Saturday waste collection timetable.</p>
            <div className="np-actions">
              <Link className="np-button np-button--purple" href="/login">Get started <span>→</span></Link>
              <Link className="np-button np-button--outline" href="/signup"><span className="np-play">▶</span> Create resident account</Link>
            </div>
          </div>
          <figure className="np-hero__figure">
            <div className="np-image-shadow" aria-hidden="true" />
            <div className="np-image-frame"><Image src={welcomeImage} alt="Yaazh Clean360 waste collection team welcoming residents" sizes="(max-width: 780px) 94vw, 48vw" /></div>
          </figure>
        </div>
      </section>

      <section className="np-stats" aria-label="Collection service overview">
        <div className="np-container np-stats__grid">
          <article className="np-stat np-stat--purple"><strong>5</strong><span>Active zones</span></article>
          <article className="np-stat np-stat--yellow"><strong>6</strong><span>Collection days</span></article>
          <article className="np-stat np-stat--pink"><strong>5</strong><span>Assigned lorries</span></article>
          <article className="np-stat np-stat--mint"><strong>1</strong><span>Clear dashboard</span></article>
        </div>
      </section>

      <section className="np-section np-dots" id="zones" aria-labelledby="zones-heading">
        <span className="np-shape np-shape--soft-ring" aria-hidden="true" />
        <div className="np-container">
          <header className="np-section-heading"><p className="np-sticker np-sticker--pink">Local collection network</p><h2 id="zones-heading">Your zone, your collection crew</h2><p>Select the map that covers your home. Your assigned lorry appears instantly.</p></header>
          <ZoneCardSpread zones={zones} />
        </div>
      </section>

      <section className="np-story" aria-labelledby="story-heading">
        <div className="np-container np-story__grid">
          <div className="np-story__visual" aria-hidden="true"><span className="np-story__card np-story__card--back" /><span className="np-story__card np-story__card--front"><b>MON</b><strong>07:30</strong><small>ZONE 03 · RH 9424</small></span></div>
          <div className="np-story__copy"><p className="np-sticker np-sticker--mint">One reliable source</p><h2 id="story-heading">No more guessing when the lorry will arrive.</h2><p>Your dashboard brings the important details together: collection day, time, waste category, zone and assigned vehicle. Information stays readable on mobile, tablet and desktop.</p><blockquote>“Designed around the simple question every resident asks: when is my waste being collected?”</blockquote></div>
        </div>
      </section>

      <section className="np-action-section np-dots" id="voting" aria-labelledby="action-heading">
        <div className="np-container">
          <header className="np-section-heading"><p className="np-sticker np-sticker--yellow">Resident action centre</p><h2 id="action-heading">Vote ready. Report issues. Reach officials.</h2><p>Proposal-backed tools give residents a quick way to participate and give Pradesa Sabha officials measurable service signals.</p></header>
          <div className="np-action-grid">
            <article className="np-action-card np-action-card--vote"><span>01</span><h3>Daily readiness voting</h3><p>Residents can mark whether their waste is ready for pickup. Results can be grouped by zone and date so route decisions are based on live participation.</p><div className="np-progress" aria-hidden="true"><i /></div></article>
            <article className="np-action-card np-action-card--complaint" id="complaints"><span>02</span><h3>Complaint reporting</h3><p>Residents can report missed pickups, delays, or service issues with details and photo evidence, giving administrators a clear record to resolve.</p><div className="np-photo-stack" aria-hidden="true"><i /><b /></div></article>
            <article className="np-action-card np-action-card--call"><span>03</span><h3>Pradesa Sabha contact</h3><p>The official telephone number remains visible across the app. On mobile, residents can tap it and call directly.</p><a href="tel:0212222700">Call {pradesaSabhaPhone}</a></article>
          </div>
        </div>
      </section>

      <section className="np-section np-dots" id="features" aria-labelledby="features-heading">
        <div className="np-container">
          <header className="np-section-heading"><h2 id="features-heading">Powerful resident features</h2><p>Everything you need for a more organised collection day.</p></header>
          <div className="np-feature-grid">
            {features.map(([icon, title, text, accent]) => <article className={`np-feature-card np-accent--${accent}`} key={title}><span className={`np-feature-icon np-feature-icon--${accent}`}><FeatureIcon name={icon} /></span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="np-how np-dots" id="how-it-works" aria-labelledby="how-heading">
        <div className="np-container">
          <header className="np-section-heading"><p className="np-sticker np-sticker--yellow">Simple resident onboarding</p><h2 id="how-heading">How Yaazh Clean360 works</h2><p>Get set up in minutes, then check your schedule whenever you need it.</p></header>
          <ol className="np-steps"><li><span>1</span><h3>Create your profile</h3><p>Enter your resident details and set a secure password.</p></li><li><span>2</span><h3>Verify your email</h3><p>Use the one-time code sent to your email address.</p></li><li><span>3</span><h3>Select your zone</h3><p>Choose the correct zone map and open your collection dashboard.</p></li></ol>
          <div className="np-benefits">
            <article><span className="np-check">✓</span><div><h3>Save time every week</h3><p>Collection information is available before you place waste outside.</p></div><div className="np-orbit np-orbit--one" aria-hidden="true"><i/><b/><em/></div></article>
            <article><div className="np-orbit np-orbit--two" aria-hidden="true"><i/><b/><em/></div><span className="np-check">✓</span><div><h3>Keep every household informed</h3><p>A clear schedule helps everyone in your home prepare the correct waste.</p></div></article>
            <article><span className="np-check">✓</span><div><h3>Change zones with confidence</h3><p>Moved to another area? Update your selected zone from your account.</p></div><div className="np-orbit np-orbit--three" aria-hidden="true"><i/><b/><em/></div></article>
          </div>
        </div>
      </section>

      <section className="np-faq np-dots" aria-labelledby="faq-heading"><div className="np-container np-faq__inner"><header className="np-section-heading"><h2 id="faq-heading">Frequently asked questions</h2></header><div className="np-faq__list"><details><summary>How do I know which zone to select?<span>+</span></summary><p>Compare the five zone maps during signup and choose the area that contains your home address.</p></details><details><summary>Can I change my selected zone later?<span>+</span></summary><p>Yes. Signed-in residents can update their zone whenever their collection area changes.</p></details><details><summary>Which days are collections available?<span>+</span></summary><p>Yaazh Clean360 schedules collections from Monday through Saturday. Sunday schedules are not created.</p></details><details><summary>How is my account protected?<span>+</span></summary><p>Your email is verified with an OTP, your password is securely hashed, and authenticated requests use a JWT.</p></details></div></div></section>

      <section className="np-final-cta np-dots" aria-labelledby="cta-heading"><div className="np-cta-card"><h2 id="cta-heading">Ready for a cleaner collection day?</h2><p>Join your zone, verify your account and keep your household on schedule.</p><div className="np-actions np-actions--center"><Link className="np-button np-button--yellow" href="/login">Get started <span>→</span></Link></div></div></section>

      <footer className="np-footer"><div className="np-container np-footer__grid"><div><strong>Yaazh Clean360</strong><p>Cleaner zones. Smarter collection.</p></div><nav aria-label="Footer"><a href="#features">Features</a><a href="#zones">Zones</a><a href="#voting">Voting</a><a href="#complaints">Complaints</a></nav><div className="np-footer__account"><Link href="/login">Get started</Link><Link href="/signup">Create account</Link></div></div><p className="np-footer__copyright">© {new Date().getFullYear()} Yaazh Clean360. Smart waste collection for local communities.</p></footer>
    </div>
  );
}
