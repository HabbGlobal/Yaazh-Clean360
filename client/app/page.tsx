"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const features = [
  {
    title: "Zone-based schedules",
    text: "Select your zone and instantly see the collection day and time for your street.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Monday to Saturday",
    text: "Weekly pickups across six days, mapped to the area you call home.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "Waste-type aware",
    text: "General, recyclable, organic and hazardous waste are collected separately.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8a10 10 0 0 1-10 10Z" />
        <path d="M2 21c0-3 1.9-5.5 3.5-7" />
      </svg>
    ),
  },
];

const pickupRows = [
  { tag: "#c94f3d", type: "General waste", when: "7:00 AM" },
  { tag: "#2aa876", type: "Recyclable", when: "9:30 AM" },
  { tag: "#c98b2d", type: "Organic", when: "1:00 PM" },
];

export default function Home() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("revealed"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="landing" ref={rootRef}>
      <div className="blobs" aria-hidden="true">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
      </div>

      <div className="landing-hero">
        <p className="eyebrow">Smart waste collection</p>
        <h1 className="hero-title">
          Cleaner zones. <span className="gradient">Smarter collection.</span>
        </h1>
        <p className="hero-sub">
          Yaazh Clean360 schedules your local Monday–Saturday waste collection so
          your street is always collected on time.
        </p>
        <div className="actions">
          <Link className="btn btn-primary" href="/signup">Create an account</Link>
          <Link className="btn btn-outline" href="/login">Sign in</Link>
        </div>
      </div>

      <div className="mock-wrap reveal">
        <div className="mock-card">
          <div className="mock-head">
            <span className="mock-title">Zone 3 · Today&apos;s pickup</span>
            <span className="live"><span className="live-dot" />LIVE</span>
          </div>
          <div className="collection-route" aria-hidden="true">
            <span className="route-line" />
            <svg className="collection-truck" viewBox="0 0 72 36" fill="none">
              <path d="M4 8h38v18H4z" fill="#0d6b4f" />
              <path d="M42 14h14l7 7v5H42z" fill="#2aa876" />
              <path d="M50 14v7h13" stroke="#eff8f2" strokeWidth="2" />
              <circle cx="17" cy="29" r="4" fill="#17332b" />
              <circle cx="53" cy="29" r="4" fill="#17332b" />
              <circle cx="17" cy="29" r="1.5" fill="#eff8f2" />
              <circle cx="53" cy="29" r="1.5" fill="#eff8f2" />
            </svg>
          </div>
          {pickupRows.map((row) => (
            <div className="mock-row" key={row.type}>
              <span className="tag" style={{ background: row.tag }} />
              <span>{row.type}</span>
              <span className="when">{row.when}</span>
            </div>
          ))}
          <p className="mock-day">Next collection: Tuesday · Recyclable · 8:00 AM</p>
        </div>
      </div>

      <div className="stats">
        <div className="stat reveal"><strong>5</strong><span>Zones covered</span></div>
        <div className="stat reveal"><strong>6</strong><span>Collection days</span></div>
        <div className="stat reveal"><strong>5</strong><span>Waste types</span></div>
        <div className="stat reveal"><strong>100%</strong><span>Organised</span></div>
      </div>

      <div className="features">
        <h2 className="reveal">Everything your neighbourhood needs</h2>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article className="feature-card reveal" key={feature.title} style={{ transitionDelay: `${index * 120}ms` }}>
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="cta-banner reveal">
        <h2>Ready for a cleaner zone?</h2>
        <Link className="btn btn-primary" href="/signup">Get started free</Link>
      </div>
    </section>
  );
}
