"use client";

import { usePathname } from "next/navigation";

import CallPopup from "@/components/common/CallPopup";
import SiteHeader from "@/components/common/SiteHeader";

export default function AppFrame({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // The administrator workspace owns the viewport. Rendering it outside the
  // public-page main container prevents inherited centering/max-width rules.
  if (isAdmin) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      <main className="app-main">{children}</main>
      <CallPopup />
    </>
  );
}
