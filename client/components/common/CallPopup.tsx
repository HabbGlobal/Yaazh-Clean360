"use client";

import { usePathname } from "next/navigation";

export default function CallPopup() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <a className="call-popup" aria-label="Call Pradesa Sabha at 021 222 2700" href="tel:0212222700">
      <span className="call-popup__pulse" aria-hidden="true" />
      <div>
        <small>Need help?</small>
        <strong>Pradesa Sabha</strong>
      </div>
      <span className="call-popup__number">021 222 2700</span>
    </a>
  );
}
