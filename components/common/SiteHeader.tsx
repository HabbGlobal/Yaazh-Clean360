"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import yaazhLogo from "@/assets/logo yaazh.png";
import AuthNav from "@/components/auth/AuthNav";

export default function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/dashboard" || pathname === "/profile" || pathname.startsWith("/admin")) return null;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand"><Image className="brand-logo" src={yaazhLogo} alt="Yaazh Clean360" priority /></Link>
        <AuthNav />
      </div>
    </header>
  );
}
