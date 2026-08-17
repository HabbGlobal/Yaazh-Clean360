"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/#zones", hash: "#zones", label: "Zones" },
  { href: "/#voting", hash: "#voting", label: "Voting" },
  { href: "/#features", hash: "#features", label: "Features" },
  { href: "/#how-it-works", hash: "#how-it-works", label: "How it works" }
];

export default function AuthNav() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;

    const updateActiveHash = () => {
      const line = window.innerHeight * 0.35;
      let current = window.location.hash;
      for (const item of navItems) {
        const section = document.querySelector(item.hash);
        if (!section) continue;
        if (section.getBoundingClientRect().top <= line) current = item.hash;
      }
      setActiveHash(current);
    };

    updateActiveHash();
    window.addEventListener("hashchange", updateActiveHash);
    window.addEventListener("scroll", updateActiveHash, { passive: true });

    return () => {
      window.removeEventListener("hashchange", updateActiveHash);
      window.removeEventListener("scroll", updateActiveHash);
    };
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width:901px)");
    const close = () => setOpen(false);
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);

  return (
    <nav className="auth-nav" aria-label="Primary navigation">
      <div className="nav-sections">
        {navItems.map((item) => (
          <Link className={pathname === "/" && activeHash === item.hash ? "active" : undefined} href={item.href} key={item.hash}>
            {item.label}
          </Link>
        ))}
      </div>
      <Link className="nav-signup" href="/login">Get started</Link>
      <button type="button" className={`nav-menu-toggle${open ? " nav-menu-toggle--open" : ""}`} aria-expanded={open} aria-controls="site-nav-menu" aria-label={open ? "Close navigation menu" : "Open navigation menu"} onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
      </button>
      {open && <div className="nav-menu-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
      {open && (
        <div className="nav-mobile-menu" id="site-nav-menu">
          {navItems.map((item) => (
            <Link key={item.hash} className={pathname === "/" && activeHash === item.hash ? "active" : undefined} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          <Link className="nav-mobile-signup" href="/login" onClick={() => setOpen(false)}>Get started</Link>
        </div>
      )}
    </nav>
  );
}
