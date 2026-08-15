"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import yaazhLogo from "@/assets/logo yaazh.png";
import { clearToken } from "@/lib/auth-storage";
import type { User } from "@/types";

export default function ResidentNav({ user }: { user: User }) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  function logout() {
    clearToken();
    router.push("/");
  }

  return (
    <nav className="resident-nav" aria-label="Resident dashboard navigation">
      <Link className="resident-nav-logo" href="/dashboard"><Image src={yaazhLogo} alt="Yaazh Clean360" priority /></Link>
      <div className="resident-nav-links">
        <Link href="/dashboard#schedule">Collection Schedule</Link>
        <Link href="/dashboard#voting">Voting</Link>
        <Link href="/dashboard#complaints">Complaints</Link>
        <Link href="/dashboard#feedback">Feedback</Link>
        <Link href="/dashboard#rating">Service Rating</Link>
      </div>
      <div className="resident-profile">
        <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
          {user.profileImage ? <img src={user.profileImage} alt="" /> : <span>{user.name.slice(0, 1).toUpperCase()}</span>}
          <strong>{user.name}</strong>
        </button>
        {profileOpen && <div className="resident-profile-menu"><Link href="/profile">Edit profile</Link><button type="button" onClick={logout}>Log out</button></div>}
      </div>
    </nav>
  );
}
