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

  function logout() {
    clearToken();
    router.push("/");
  }

  return (
    <nav className="resident-nav" aria-label="Resident dashboard navigation">
      <Link className="resident-nav-logo" href="/dashboard"><Image src={yaazhLogo} alt="Yaazh Clean360" priority /></Link>
      <div className="resident-nav-links">
        {navItems.map((item) => (
          <Link className={pathname === "/dashboard" && activeHash === item.hash ? "active" : undefined} href={item.href} key={item.hash}>
            {item.label}
          </Link>
        ))}
      </div>
      <div className="resident-profile">
        <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
          {user.profileImage ? <img src={user.profileImage} alt="" /> : <span>{user.name.slice(0, 1).toUpperCase()}</span>}
          <strong>{user.name}</strong>
        </button>
        {profileOpen && <div className="resident-profile-menu"><Link className={pathname === "/profile" ? "active" : undefined} href="/profile">Edit profile</Link><button type="button" onClick={logout}>Log out</button></div>}
      </div>
    </nav>
  );
}
