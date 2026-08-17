"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import yaazhLogo from "@/assets/logo yaazh.png";
import { clearToken } from "@/lib/auth-storage";
import type { User } from "@/types";

const navItems = [
  { href: "/dashboard#schedule", hash: "#schedule", label: "Collection Schedule" },
  { href: "/dashboard#voting", hash: "#voting", label: "Voting" },
  { href: "/dashboard#complaints", hash: "#complaints", label: "Complaints" },
  { href: "/dashboard#feedback", hash: "#feedback", label: "Feedback" },
  { href: "/dashboard#rating", hash: "#rating", label: "Service Rating" }
];

export default function ResidentNav({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#schedule");

  useEffect(() => {
    if (pathname !== "/dashboard") return;

    const updateActiveHash = () => {
      const hash = window.location.hash || "#schedule";
      setActiveHash(hash);
    };

    updateActiveHash();
    window.addEventListener("hashchange", updateActiveHash);

    const sections = navItems.map((item) => document.querySelector(item.hash)).filter((section): section is Element => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActiveHash(`#${visible.target.id}`);
      },
      { rootMargin: "-32% 0px -52% 0px", threshold: [0.08, 0.2, 0.45, 0.7] }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("hashchange", updateActiveHash);
      observer.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width:901px)");
    const close = () => setLinksOpen(false);
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);

  useEffect(() => {
    if (!linksOpen) return;
    const onClick = (event: MouseEvent) => {
      const nav = document.querySelector(".resident-nav");
      if (nav && !nav.contains(event.target as Node)) setLinksOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [linksOpen]);

  function logout() {
    clearToken();
    router.push("/");
  }

  return (
    <nav className="resident-nav" aria-label="Resident dashboard navigation">
      <Link className="resident-nav-logo" href="/dashboard"><Image src={yaazhLogo} alt="Yaazh Clean360" priority /></Link>
      <div className={`resident-nav-links${linksOpen ? " resident-nav-links--open" : ""}`} id="resident-nav-links">
        {navItems.map((item) => (
          <Link className={pathname === "/dashboard" && activeHash === item.hash ? "active" : undefined} href={item.href} key={item.hash} onClick={() => setLinksOpen(false)}>
            {item.label}
          </Link>
        ))}
      </div>
      <div className="resident-nav-links-wrap">
        <button type="button" className={`resident-nav-toggle${linksOpen ? " resident-nav-toggle--open" : ""}`} aria-expanded={linksOpen} aria-controls="resident-nav-links" aria-label={linksOpen ? "Close dashboard menu" : "Open dashboard menu"} onClick={() => setLinksOpen((value) => !value)}>
          <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
        </button>
        <div className="resident-profile">
          <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
            {user.profileImage ? <img src={user.profileImage} alt="" /> : <span>{user.name.slice(0, 1).toUpperCase()}</span>}
            <strong>{user.name}</strong>
          </button>
          {profileOpen && <div className="resident-profile-menu"><Link className={pathname === "/profile" ? "active" : undefined} href="/profile" onClick={() => setProfileOpen(false)}>Edit profile</Link><button type="button" onClick={logout}>Log out</button></div>}
        </div>
      </div>
    </nav>
  );
}

